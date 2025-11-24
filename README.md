# 🚀 Bubble Backend API

Enterprise-grade backend API with KYC verification, authentication, and payment processing.

## 📁 Project Structure
```
bubble-backend-api/
├── config/              # Configuration files
│   ├── database.js     # PostgreSQL & Supabase
│   ├── env.js          # Environment variables
│   └── monitoring.js   # Logging & monitoring
├── controllers/         # Business logic
│   ├── auth/           # Authentication controllers
│   ├── kyc/            # KYC verification
│   └── payment/        # Payment processing
├── middleware/          # Express middleware
│   ├── auth.middleware.js
│   ├── hmac.middleware.js
│   └── region/
├── routes/              # API routes
│   ├── auth/           # Auth & account routes
│   ├── kyc/            # KYC routes
│   └── payment/        # Payment routes
├── services/            # External services
│   ├── auth/           # Auth services (Google, Apple)
│   ├── kyc/            # KYC services
│   ├── payment/        # Stripe integration
│   └── storage/        # AWS S3
├── migrations/          # Database migrations
├── scripts/             # Utility scripts
├── tests/               # Test suite
├── docs/                # Documentation
└── utils/               # Utilities
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL
- Railway account (or any PaaS)

### Installation
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Run migrations
node scripts/migrations/run-migration.js

# Start server
npm start
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/v1/auth/signup` - Register user
- `POST /api/v1/auth/signin` - Login user
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/google/start` - Google OAuth
- `POST /api/v1/auth/google/callback` - Google callback

### Account Management
- `POST /api/v1/account/delete/request` - Request deletion (30-day grace)
- `POST /api/v1/account/delete/cancel` - Cancel deletion
- `DELETE /api/v1/account/delete/immediate` - Immediate deletion
- `GET /api/v1/account/delete/status` - Check deletion status

### KYC Endpoints
- `POST /api/v1/kyc/start` - Start KYC session
- `POST /api/v1/kyc/consent` - Submit consent
- `GET /api/v1/kyc/options` - Get ID options
- `POST /api/v1/kyc/upload-url` - Get S3 upload URL
- `POST /api/v1/kyc/confirm-upload` - Confirm upload
- `POST /api/v1/kyc/send-otp` - Send OTP
- `POST /api/v1/kyc/verify-otp` - Verify OTP
- `GET /api/v1/kyc/status/:id` - Get KYC status

### Payment Endpoints
- `POST /api/v1/payment/create-customer` - Create Stripe customer
- `POST /api/v1/payment/add-payment-method` - Add payment method
- `POST /api/v1/payment/create-subscription` - Create subscription
- `POST /api/v1/payment/cancel-subscription/:id` - Cancel subscription
- `GET /api/v1/payment/subscription/:id` - Get subscription
- `POST /api/v1/payment/webhook` - Stripe webhook

## 🔐 Security Features

- ✅ bcrypt password hashing (12 rounds)
- ✅ JWT access tokens (15min) + refresh tokens (7 days)
- ✅ Token rotation on refresh
- ✅ HMAC request validation
- ✅ Rate limiting
- ✅ CORS & security headers
- ✅ OTP verification (SHA-256 hashed)
- ✅ Audit logging
- ✅ GDPR-compliant account deletion

## 📊 Database

12 tables:
- `users` - User accounts
- `refresh_tokens` - JWT refresh tokens
- `login_events` - Login history
- `kyc_sessions` - KYC workflow
- `kyc_documents` - Document metadata
- `kyc_audit_logs` - Compliance logs
- `otp_codes` - OTP verification
- `magic_links` - Magic link auth
- `payment_customers` - Stripe customers
- `subscriptions` - Subscription management
- `payment_events` - Webhook logs
- `data_deletion_requests` - GDPR deletions

## 🧪 Testing
```bash
# Run all tests
npm test

# Run linter
npm run lint

# Check coverage
npm run test:coverage
```

## 🚀 Deployment

Currently deployed on Railway: https://bubble-backend-api-production.up.railway.app

### Deploy to Railway
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up
```

## 📝 Environment Variables

See `.env.example` for required variables.

## 📖 Documentation

- [Implementation Guide](docs/IMPLEMENTATION_COMPLETE.md)
- [Test Results](docs/TEST_RESULTS.md)
- [Success Summary](docs/FINAL_SUCCESS.md)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is proprietary and confidential.

## 👥 Support

For support, email support@bubble.com or open an issue.

---

**Status:** ✅ Production Ready  
**Version:** 1.0.0  
**Last Updated:** November 24, 2024
