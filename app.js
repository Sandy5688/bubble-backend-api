const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const routes = require('./routes');
const env = require('./config/env');

const app = express();

app.set('trust proxy', 1);

app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));

app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/v1', routes);

app.get('/', (req, res) => {
  res.json({
    message: 'Bubble Backend API',
    version: '1.0.0',
    status: 'operational'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
