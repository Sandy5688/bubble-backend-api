const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');
const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');
const { secureRequestLogger } = require('./middleware/secureLogger');
const { validateHmacSignature } = require('./middleware/hmac.middleware');
const { cookieParserMiddleware } = require('./middleware/csrf.middleware');
const env = require('./config/env');

const app = express();

// ===========================================
// 1. SENTRY INITIALIZATION (Production only)
// ===========================================
if (env.NODE_ENV === 'production' && env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app }),
      new ProfilingIntegration(),
    ],
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
  });

  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
}

// ===========================================
// 2. HARDENED HELMET CONFIGURATION
// ===========================================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true
}));

// ===========================================
// 3. HARDENED CORS CONFIGURATION
// ===========================================
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000", "http://localhost:5173"],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-api-key", "x-signature", "x-timestamp", "X-CSRF-Token", "x-idempotency-key"]
};

app.use(cors(corsOptions));

// ===========================================
// 4. COOKIE PARSER (for CSRF tokens)
// ===========================================
app.use(cookieParserMiddleware);

// ===========================================
// 5. BODY PARSING (with size limits - FIX #17)
// ===========================================
app.use(express.json({ 
  limit: '1mb',
  verify: (req, res, buf) => {
    // Store raw body for webhook signature verification
    if (req.originalUrl.includes('/webhook')) {
      req.rawBody = buf.toString('utf8');
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ===========================================
// 6. HTTPS REDIRECT (FIX #16)
// ===========================================
app.use((req, res, next) => {
  // Check if request is not secure (HTTP instead of HTTPS)
  const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  
  if (!isSecure && env.NODE_ENV === 'production') {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  
  next();
});

// ===========================================
// 7. HMAC VALIDATION (FIX #2 - GLOBAL MOUNTING)
// ===========================================
// Apply HMAC to internal API routes only (not webhooks or public routes)
app.use('/api/v1', (req, res, next) => {
  // Skip HMAC for public routes
  const publicRoutes = ['/health', '/auth/signin', '/auth/signup', '/auth/refresh', '/auth/csrf-token'];
  const isPublicRoute = publicRoutes.some(route => req.path.startsWith(route));
  
  // Skip HMAC for webhooks (they have their own signature validation)
  const isWebhook = req.path.includes('/webhook');
  
  if (isPublicRoute || isWebhook) {
    return next();
  }
  
  // Apply HMAC validation to all other routes
  validateHmacSignature(req, res, next);
});

// Secure request logging
app.use(secureRequestLogger);

// API routes
app.use('/api/v1', routes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Bubble Backend API',
    version: '1.0.0',
    status: 'operational',
    environment: env.NODE_ENV
  });
});

// ===========================================
// 8. ERROR HANDLERS
// ===========================================
if (env.NODE_ENV === 'production' && env.SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler());
}

app.use(errorHandler);

module.exports = app;
