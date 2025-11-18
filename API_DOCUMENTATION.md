# Bubble Backend API Documentation

## Base URL
```
Production: https://bubble-backend-api-production.up.railway.app/api/v1
Development: http://localhost:8080/api/v1
```

## Authentication

All protected endpoints require authentication via JWT token:
```
Authorization: Bearer <your-jwt-token>
```

### HMAC Signature (For Internal APIs)

Protected routes require HMAC signature:
```
x-api-key: your-internal-api-key
x-timestamp: 1234567890
x-signature: generated-hmac-sha256-signature
```

**Signature Generation:**
```javascript
const crypto = require('crypto');
const timestamp = Math.floor(Date.now() / 1000);
const method = 'POST';
const url = '/api/v1/user/profile';
const body = JSON.stringify({ name: 'John' });
const payload = `${timestamp}${method}${url}${body}`;
const signature = crypto
  .createHmac('sha256', API_KEY)
  .update(payload)
  .digest('hex');
```

## Endpoints

### Health Check
```
GET /health
GET /api/v1/health
GET /api/v1/health?detailed=true
```

### Authentication
```
POST /api/v1/auth/signup
POST /api/v1/auth/signin
POST /api/v1/auth/signout
POST /api/v1/auth/refresh
POST /api/v1/auth/reset-password
GET  /api/v1/auth/me
```

### User Management
```
GET    /api/v1/user/profile
PUT    /api/v1/user/profile
DELETE /api/v1/user/deactivate
```

### File Management
```
POST   /api/v1/files/upload
GET    /api/v1/files/:fileId
DELETE /api/v1/files/:fileId
GET    /api/v1/files/list
```

### Payments
```
POST /api/v1/pay/stripe/create
POST /api/v1/pay/stripe/confirm
POST /api/v1/pay/paypal/create
POST /api/v1/pay/paypal/confirm
POST /api/v1/pay/webhook/stripe
POST /api/v1/pay/webhook/paypal
```

### Messaging
```
POST /api/v1/msg/email
POST /api/v1/msg/sms
GET  /api/v1/msg/:messageId
```

### AI Features
```
POST /api/v1/ai/chat
POST /api/v1/ai/analyze
POST /api/v1/ai/decide
```

### Workflows
```
POST   /api/v1/flow/create
GET    /api/v1/flow/:workflowId
POST   /api/v1/flow/:workflowId/execute
DELETE /api/v1/flow/:workflowId
POST   /api/v1/flow/:workflowId/retry
```

## Rate Limits

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| General | 100 requests | 15 minutes |
| Authentication | 5 requests | 15 minutes |
| Payments | 10 requests | 15 minutes |
| AI | 20 requests | 15 minutes |
| File Upload | 50 requests | 1 hour |

## Error Responses
```json
{
  "status": "error",
  "code": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error
- `503` - Service Unavailable

## Examples

### Signup
```bash
curl -X POST https://your-api.railway.app/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "name": "John Doe"
  }'
```

### File Upload
```bash
curl -X POST https://your-api.railway.app/api/v1/files/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/file.pdf"
```

### Payment
```bash
curl -X POST https://your-api.railway.app/api/v1/pay/stripe/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "currency": "usd",
    "description": "Product purchase"
  }'
```

## Webhook Endpoints

### Stripe Webhooks
```
POST /api/v1/pay/webhook/stripe
```

Must include `stripe-signature` header for validation.

### PayPal Webhooks
```
POST /api/v1/pay/webhook/paypal
```

Must include `paypal-transmission-id` header.

## Support

For issues or questions:
- GitHub: https://github.com/yourusername/bubble-backend-api
- Email: support@yourdomain.com
