# 🗑️ Account Deletion System - Complete Guide

## Overview

GDPR-compliant account deletion system with two options:
1. **30-Day Grace Period** - Standard deletion with cancellation option
2. **Immediate Deletion** - Permanent deletion with strong confirmation

---

## API Endpoints

### 1. Check Deletion Status
```bash
GET /api/v1/account/delete/status
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "hasPendingDeletion": true,
    "id": "uuid",
    "status": "pending",
    "reason": "User requested",
    "requested_at": "2025-11-24T12:44:26.730Z",
    "completed_at": null
  }
}
```

---

### 2. Request Deletion (30-Day Grace)
```bash
POST /api/v1/account/delete/request
Authorization: Bearer {token}
Content-Type: application/json

{
  "reason": "No longer need the service",
  "confirmPassword": "user_password"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "requestId": "uuid",
    "status": "pending",
    "message": "Deletion request created. You have 30 days to cancel before permanent deletion.",
    "requestedAt": "2025-11-24T12:44:26.730Z"
  }
}
```

---

### 3. Cancel Deletion Request
```bash
POST /api/v1/account/delete/cancel
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Account deletion request cancelled successfully"
}
```

---

### 4. Immediate Deletion (Permanent)
```bash
DELETE /api/v1/account/delete/immediate
Authorization: Bearer {token}
Content-Type: application/json

{
  "confirmPassword": "user_password",
  "confirmText": "DELETE MY ACCOUNT"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account and all associated data permanently deleted"
}
```

---

## What Gets Deleted

When an account is deleted (immediate or after 30-day grace), ALL user data is removed:

1. ✅ **User Account** - Email, password, profile
2. ✅ **Authentication Data** - Refresh tokens, magic links
3. ✅ **Login History** - All login events
4. ✅ **KYC Data** - Sessions, documents, audit logs
5. ✅ **OTP Codes** - All verification codes
6. ✅ **Payment Data** - Stripe customers, subscriptions
7. ✅ **Deletion Logs** - Request is logged for compliance

---

## UI Integration Example

### React Component
```jsx
import { useState } from 'react';

function AccountDeletion() {
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [deletionType, setDeletionType] = useState('grace'); // 'grace' or 'immediate'

  const handleDelete = async () => {
    const token = localStorage.getItem('accessToken');
    
    if (deletionType === 'grace') {
      // Request 30-day grace deletion
      const response = await fetch('/api/v1/account/delete/request', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: 'User requested deletion',
          confirmPassword: password
        })
      });
      
      if (response.ok) {
        alert('Deletion requested. You have 30 days to cancel.');
      }
    } else {
      // Immediate deletion
      const response = await fetch('/api/v1/account/delete/immediate', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          confirmPassword: password,
          confirmText: confirmText
        })
      });
      
      if (response.ok) {
        // Logout and redirect
        localStorage.clear();
        window.location.href = '/goodbye';
      }
    }
  };

  return (
    <div className="danger-zone">
      <h3>Delete Account</h3>
      <p>Once deleted, your account cannot be recovered.</p>
      
      <button onClick={() => setShowModal(true)}>
        Delete My Account
      </button>
      
      {showModal && (
        <div className="modal">
          <h2>Confirm Account Deletion</h2>
          
          <label>
            <input 
              type="radio" 
              name="type" 
              value="grace"
              checked={deletionType === 'grace'}
              onChange={() => setDeletionType('grace')}
            />
            30-Day Grace Period (Can cancel)
          </label>
          
          <label>
            <input 
              type="radio" 
              name="type" 
              value="immediate"
              checked={deletionType === 'immediate'}
              onChange={() => setDeletionType('immediate')}
            />
            Immediate Permanent Deletion
          </label>
          
          <input
            type="password"
            placeholder="Confirm Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          {deletionType === 'immediate' && (
            <input
              type="text"
              placeholder='Type "DELETE MY ACCOUNT"'
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
            />
          )}
          
          <button onClick={handleDelete}>Confirm Deletion</button>
          <button onClick={() => setShowModal(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
}
```

---

## Security Features

1. ✅ **Password Verification** - Required for all deletions
2. ✅ **Strong Confirmation** - "DELETE MY ACCOUNT" text for immediate deletion
3. ✅ **Transaction Safety** - All-or-nothing database deletion
4. ✅ **Audit Logging** - All requests logged for compliance
5. ✅ **OAuth Support** - Works with Google/Apple sign-in users
6. ✅ **30-Day Grace** - Users can change their mind

---

## Error Handling
```javascript
try {
  const response = await fetch('/api/v1/account/delete/request', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ confirmPassword: password })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    switch (response.status) {
      case 401:
        alert('Invalid password');
        break;
      case 400:
        alert(data.error || 'Deletion request already pending');
        break;
      case 500:
        alert('Server error. Please try again.');
        break;
    }
  } else {
    alert('Deletion requested successfully');
  }
} catch (error) {
  alert('Network error. Please check your connection.');
}
```

---

## Testing
```bash
# Get token
TOKEN=$(curl -s -X POST https://your-api.com/api/v1/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"password"}' | jq -r '.data.tokens.accessToken')

# Check status
curl https://your-api.com/api/v1/account/delete/status \
  -H "Authorization: Bearer $TOKEN"

# Request deletion
curl -X POST https://your-api.com/api/v1/account/delete/request \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason":"Testing","confirmPassword":"password"}'

# Cancel deletion
curl -X POST https://your-api.com/api/v1/account/delete/cancel \
  -H "Authorization: Bearer $TOKEN"

# Immediate deletion
curl -X DELETE https://your-api.com/api/v1/account/delete/immediate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"confirmPassword":"password","confirmText":"DELETE MY ACCOUNT"}'
```

---

## Database Schema
```sql
CREATE TABLE data_deletion_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    request_reason TEXT NULL,
    status TEXT DEFAULT 'pending',
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ NULL,
    completed_at TIMESTAMPTZ NULL
);
```

**Status Values:**
- `pending` - Awaiting 30-day grace period
- `cancelled` - User cancelled request
- `completed` - Account deleted

---

## GDPR Compliance

✅ **Right to Erasure** - Full data deletion  
✅ **Data Portability** - Can export before deletion  
✅ **Audit Trail** - All requests logged  
✅ **Grace Period** - 30 days to change mind  
✅ **Confirmation** - Password + text verification

---

**Status:** ✅ Production Ready  
**Version:** 1.0.0  
**Last Updated:** November 24, 2024
