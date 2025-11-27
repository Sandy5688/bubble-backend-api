# �� Bubble Backend API - Complete Documentation

**Base URL:** `https://bubble-backend-api-production.up.railway.app/api/v1`

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [KYC Verification](#kyc-verification)
3. [Payment Integration](#payment-integration)
4. [Account Management](#account-management)
5. [Admin Panel](#admin-panel)
6. [Error Handling](#error-handling)

---

## Authentication

### Register User
```http
POST /auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "emailVerified": false
    },
    "tokens": {
      "accessToken": "jwt...",
      "refreshToken": "token..."
    }
  }
}
```

### Login
```http
POST /auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer <accessToken>
```

### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

### Logout
```http
POST /auth/logout
Authorization: Bearer <accessToken>
```

### Google OAuth
```http
GET /auth/google/start
POST /auth/google/callback
```

### Apple OAuth
```http
GET /auth/apple/start
POST /auth/apple/callback
```

### Magic Link
```http
POST /auth/magic/send
Content-Type: application/json

{
  "email": "user@example.com"
}
```
```http
POST /auth/magic/verify
Content-Type: application/json

{
  "token": "magic-token",
  "email": "user@example.com"
}
```

---

## KYC Verification

### Start KYC Session
```http
POST /kyc/start
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "kycSessionId": "uuid",
    "status": "pending_consent",
    "next": "consent"
  }
}
```

### Submit Consent
```http
POST /kyc/consent
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "kycSessionId": "uuid",
  "consentVersion": "1.0"
}
```

### Get ID Options
```http
GET /kyc/options
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "idTypes": [
      {"value": "passport", "label": "Passport"},
      {"value": "driver_license", "label": "Driver License"},
      {"value": "national_id", "label": "National ID"}
    ]
  }
}
```

### Get Upload URL
```http
POST /kyc/upload-url
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "kycSessionId": "uuid",
  "fileName": "passport.jpg",
  "fileType": "image/jpeg",
  "idType": "passport"
}
```

### Send OTP
```http
POST /kyc/send-otp
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "kycSessionId": "uuid",
  "method": "email",
  "destination": "user@example.com"
}
```

### Verify OTP
```http
POST /kyc/verify-otp
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "kycSessionId": "uuid",
  "otp": "123456"
}
```

### Check Status
```http
GET /kyc/status/:kycSessionId
Authorization: Bearer <accessToken>
```

---

## Payment Integration

### Create Stripe Customer
```http
POST /payment/create-customer
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### Create Subscription
```http
POST /payment/create-subscription
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "priceId": "price_xxxxx"
}
```

### Get Subscription
```http
GET /payment/subscription/:subscriptionId
Authorization: Bearer <accessToken>
```

### Cancel Subscription
```http
POST /payment/cancel-subscription/:subscriptionId
Authorization: Bearer <accessToken>
```

---

## Account Management

### Request Deletion (30-day grace)
```http
POST /account/delete/request
Authorization: Bearer <accessToken>
```

### Cancel Deletion
```http
POST /account/delete/cancel
Authorization: Bearer <accessToken>
```

### Check Deletion Status
```http
GET /account/delete/status
Authorization: Bearer <accessToken>
```

---

## Admin Panel

### List Users
```http
GET /admin/users?limit=50&offset=0&search=query
Authorization: Bearer <adminToken>
```

### Get User KYC Status
```http
GET /admin/kyc/:userId
Authorization: Bearer <adminToken>
```

### Update KYC Status
```http
PUT /admin/kyc/:sessionId
Authorization: Bearer <adminToken>
Content-Type: application/json

{
  "status": "approved",
  "notes": "Verified"
}
```

---

## Error Handling

All errors return:
```json
{
  "success": false,
  "error": "Error message"
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Server Error

---

**Total Endpoints:** 63+  
**Last Updated:** November 27, 2025
