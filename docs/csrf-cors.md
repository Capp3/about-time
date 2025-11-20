# CSRF and CORS Configuration Guide

## Overview

This document explains how CSRF (Cross-Site Request Forgery) protection and CORS (Cross-Origin Resource Sharing) are configured in the About Time application, specifically for our Single Page Application (SPA) architecture with Django backend and React frontend.

## Architecture Summary

- **Backend:** Django 5.2+ running on port 8000
- **Frontend:** React 18 running on port 3000 (development)
- **Authentication:** Django session-based with CSRF protection
- **Same-Origin:** Frontend and backend will be served from same domain in production

## CSRF Protection

### What is CSRF?

Cross-Site Request Forgery is an attack that tricks a user's browser into making unwanted requests to a web application where the user is authenticated. Django provides built-in CSRF protection that we leverage.

### How Django CSRF Works

1. Django sends a CSRF token as a cookie (`csrftoken`)
2. Client must include this token in a custom HTTP header (`X-CSRFToken`) for unsafe methods (POST, PUT, PATCH, DELETE)
3. Django validates the token matches for each request
4. If validation fails, request is rejected with 403 Forbidden

### CSRF Configuration (Backend)

In `backend/project_name/settings/base.py`:

```python
# CSRF Settings
CSRF_USE_SESSIONS = False  # Use separate cookie (default)
CSRF_COOKIE_NAME = 'csrftoken'
CSRF_HEADER_NAME = 'HTTP_X_CSRFTOKEN'
CSRF_COOKIE_HTTPONLY = False  # JavaScript needs to read it
CSRF_COOKIE_SAMESITE = 'Lax'  # or 'Strict' for more security
CSRF_COOKIE_SECURE = True  # Only via HTTPS (production)

# Development: Set to False
# CSRF_COOKIE_SECURE = False

# Trusted origins (production)
CSRF_TRUSTED_ORIGINS = [
    'https://yourdomain.com',
]
```

### CSRF Implementation (Frontend)

#### Reading the CSRF Token

The CSRF token is available in the `csrftoken` cookie. We read it using the `cookie` package:

```typescript
// frontend/js/App.tsx
import cookie from 'cookie';
import { OpenAPI } from './api';

// Configure API client to include CSRF token
OpenAPI.interceptors.request.use((request) => {
  const { csrftoken } = cookie.parse(document.cookie);
  if (request.headers && csrftoken) {
    request.headers["X-CSRFTOKEN"] = csrftoken;
  }
  return request;
});
```

#### Getting Initial CSRF Token

The CSRF token is automatically set when you make your first GET request to the Django backend:

```typescript
// Make any GET request to get the CSRF cookie
await fetch('http://localhost:8000/api/users/', {
  credentials: 'include', // Important: include cookies
});

// Now the csrftoken cookie is set
```

#### Alternative: Dedicated CSRF Endpoint

You can create a dedicated endpoint to get the CSRF token:

```python
# In backend/common/views.py
from django.middleware.csrf import get_token
from django.http import JsonResponse

def get_csrf_token(request):
    """Return CSRF token for SPA"""
    return JsonResponse({'csrfToken': get_token(request)})
```

```python
# In backend/common/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('csrf/', views.get_csrf_token, name='csrf'),
]
```

Then in frontend:

```typescript
const response = await fetch('http://localhost:8000/csrf/', {
  credentials: 'include',
});
const { csrfToken } = await response.json();
```

## CORS Configuration

### What is CORS?

Cross-Origin Resource Sharing (CORS) is a security feature that restricts web pages from making requests to a different domain than the one serving the web page.

### Our CORS Strategy

**Development:**
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- Different ports = different origins → CORS headers needed

**Production:**
- Both served from same domain → No CORS needed
- Example: `https://yourdomain.com` (static files via whitenoise or CDN with same origin)

### CORS Configuration (Development Only)

For development, we need to configure CORS to allow requests from localhost:3000 to localhost:8000.

#### Install django-cors-headers

```bash
cd backend
uv pip install django-cors-headers
```

#### Configure in settings

```python
# In backend/project_name/settings/local_base.py
INSTALLED_APPS = [
    # ...
    'corsheaders',
    # ...
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Should be as high as possible
    'django.middleware.security.SecurityMiddleware',
    # ... rest of middleware
]

# CORS settings for development
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

CORS_ALLOW_CREDENTIALS = True  # Required for cookies/sessions

# Optional: Allow all origins in local development
# CORS_ALLOW_ALL_ORIGINS = True  # Only for development!
```

#### Production Configuration

```python
# In backend/project_name/settings/production.py
# No CORS configuration needed if serving from same domain

# If using a CDN or separate frontend domain:
CORS_ALLOWED_ORIGINS = [
    "https://yourdomain.com",
    "https://www.yourdomain.com",
]

CORS_ALLOW_CREDENTIALS = True
```

## Session Configuration

### Session Settings

```python
# In backend/project_name/settings/base.py

# Session backend
SESSION_ENGINE = 'django.contrib.sessions.backends.db'  # Store in database

# Session cookie settings
SESSION_COOKIE_NAME = 'sessionid'
SESSION_COOKIE_AGE = 14400  # 4 hours in seconds
SESSION_COOKIE_HTTPONLY = True  # Prevent JavaScript access
SESSION_COOKIE_SAMESITE = 'Lax'  # or 'Strict'
SESSION_COOKIE_SECURE = True  # HTTPS only (production)
SESSION_SAVE_EVERY_REQUEST = True  # Refresh expiry on each request

# Development: Allow HTTP cookies
# SESSION_COOKIE_SECURE = False
```

### Session Cookie Attributes

- **HttpOnly:** `True` - Prevents JavaScript from accessing session cookie (security)
- **Secure:** `True` in production - Only send cookie over HTTPS
- **SameSite:** `Lax` - Balances security and usability
  - `Strict`: Most secure, cookies only sent for same-site requests
  - `Lax`: Cookies sent for top-level navigation (GET requests)
  - `None`: Cookies sent with all requests (requires Secure=True)

## Authentication Flow

### 1. Initial Page Load

```typescript
// Frontend makes initial request
fetch('http://localhost:8000/api/users/', {
  credentials: 'include',  // Include cookies
});

// Django sets csrftoken cookie
// Response headers:
// Set-Cookie: csrftoken=xxx; Path=/; SameSite=Lax
```

### 2. Login

```typescript
// Frontend submits login
const { csrftoken } = cookie.parse(document.cookie);

fetch('http://localhost:8000/api/auth/login/', {
  method: 'POST',
  credentials: 'include',  // Include cookies
  headers: {
    'Content-Type': 'application/json',
    'X-CSRFToken': csrftoken,  // Include CSRF token
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password',
  }),
});

// Django authenticates and sets session cookie
// Response headers:
// Set-Cookie: sessionid=yyy; Path=/; HttpOnly; SameSite=Lax; Secure
```

### 3. Authenticated Requests

```typescript
// All subsequent requests include both cookies
const { csrftoken } = cookie.parse(document.cookie);

fetch('http://localhost:8000/api/protected-resource/', {
  method: 'POST',
  credentials: 'include',  // Include sessionid cookie
  headers: {
    'Content-Type': 'application/json',
    'X-CSRFToken': csrftoken,  // Include CSRF token
  },
  body: JSON.stringify(data),
});

// Django validates:
// 1. Session cookie (authentication)
// 2. CSRF token (CSRF protection)
```

### 4. Logout

```typescript
const { csrftoken } = cookie.parse(document.cookie);

fetch('http://localhost:8000/api/auth/logout/', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'X-CSRFToken': csrftoken,
  },
});

// Django destroys session
// Session cookie is invalidated
```

## Axios Configuration (Alternative)

If using Axios instead of fetch:

```typescript
import axios from 'axios';
import cookie from 'cookie';

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,  // Include cookies
});

// Request interceptor to add CSRF token
api.interceptors.request.use((config) => {
  const { csrftoken } = cookie.parse(document.cookie);
  if (csrftoken) {
    config.headers['X-CSRFToken'] = csrftoken;
  }
  return config;
});

// Usage
await api.post('/api/users/', userData);
```

## Testing Authentication

### Manual Testing with cURL

```bash
# 1. Get CSRF token
curl -c cookies.txt http://localhost:8000/api/users/

# 2. View cookies
cat cookies.txt
# Look for csrftoken value

# 3. Login
curl -b cookies.txt -c cookies.txt \
  -X POST \
  -H "Content-Type: application/json" \
  -H "X-CSRFToken: <csrftoken-from-cookies>" \
  -d '{"email":"user@example.com","password":"password"}' \
  http://localhost:8000/api/auth/login/

# 4. Make authenticated request
curl -b cookies.txt \
  -H "X-CSRFToken: <csrftoken-from-cookies>" \
  http://localhost:8000/api/protected-resource/
```

### Testing in Browser Console

```javascript
// Get CSRF token
document.cookie.split('; ').find(row => row.startsWith('csrftoken='))?.split('=')[1]

// Make request with fetch
fetch('http://localhost:8000/api/users/', {
  credentials: 'include',
})
.then(res => res.json())
.then(console.log);
```

## Common Issues and Solutions

### Issue: "CSRF token missing or incorrect"

**Causes:**
- CSRF cookie not set
- X-CSRFToken header not included
- Cookie not sent with request (missing `credentials: 'include'`)

**Solutions:**
- Ensure initial GET request to set cookie
- Include `X-CSRFToken` header in POST/PUT/PATCH/DELETE
- Include `credentials: 'include'` in fetch or `withCredentials: true` in Axios

### Issue: "CSRF cookie not set"

**Causes:**
- Request not including credentials
- Cookie blocked by browser
- Incorrect SameSite setting

**Solutions:**
- Add `credentials: 'include'` to requests
- Check browser console for cookie warnings
- Adjust SameSite to 'Lax' for development

### Issue: "CORS policy blocking request"

**Causes:**
- django-cors-headers not installed
- Origin not in CORS_ALLOWED_ORIGINS
- CORS_ALLOW_CREDENTIALS not set

**Solutions:**
- Install and configure django-cors-headers
- Add frontend origin to CORS_ALLOWED_ORIGINS
- Set CORS_ALLOW_CREDENTIALS = True

### Issue: "Cookies not persisting"

**Causes:**
- Browser blocking third-party cookies
- Incorrect domain settings
- HttpOnly preventing JavaScript access (for session)

**Solutions:**
- Use `credentials: 'include'` consistently
- Ensure cookies are first-party (same-site)
- Check browser privacy settings

## Security Best Practices

### 1. Production Checklist

- [ ] `SESSION_COOKIE_SECURE = True`
- [ ] `CSRF_COOKIE_SECURE = True`
- [ ] `SESSION_COOKIE_HTTPONLY = True`
- [ ] `SESSION_COOKIE_SAMESITE = 'Lax'` or `'Strict'`
- [ ] HTTPS enforced
- [ ] CSRF_TRUSTED_ORIGINS configured
- [ ] Strong SECRET_KEY configured
- [ ] No CORS_ALLOW_ALL_ORIGINS in production

### 2. Development vs Production

**Development (.env):**
```env
SESSION_COOKIE_SECURE=False
CSRF_COOKIE_SECURE=False
DJANGO_DEBUG=True
```

**Production (.env):**
```env
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
DJANGO_DEBUG=False
```

### 3. Token Rotation

Django automatically rotates the CSRF token periodically for security. Handle this in your frontend:

```typescript
// Always read fresh token from cookie
const { csrftoken } = cookie.parse(document.cookie);
```

### 4. Logout Best Practice

```python
# In Django logout view
from django.contrib.auth import logout
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_protect

@csrf_protect
@require_POST
def logout_view(request):
    logout(request)
    return JsonResponse({'message': 'Logged out successfully'})
```

## References

- [Django CSRF Protection](https://docs.djangoproject.com/en/5.0/ref/csrf/)
- [Django CORS Headers](https://github.com/adamchainz/django-cors-headers)
- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [MDN: Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [OWASP: CSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)

## Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2024-10-27 | 1.0 | Initial CSRF/CORS documentation | AI Assistant |
