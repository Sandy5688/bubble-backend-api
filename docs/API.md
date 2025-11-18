# API Documentation

## Base URL
```
https://your-api.railway.app/api/v1
```

## Authentication
All endpoints require API key in header:
```
x-api-key: your-api-key
```

## Endpoints

### Health Check
```http
GET /health
```

### Authentication
```http
POST /auth/signup
POST /auth/login
POST /auth/logout
```

### Files
```http
POST /files/presigned-url
POST /files/confirm-upload
GET /files/:id
DELETE /files/:id
```

### Payments
```http
POST /payments/create-intent
POST /payments/webhook
GET /payments/:id
```

### AI Services
```http
POST /ai/generate
POST /ai/chat
```

### Messaging
```http
POST /messaging/email
POST /messaging/sms
```

## Error Responses
All errors follow this format:
```json
{
  "error": "Error message",
  "statusCode": 400
}
```
