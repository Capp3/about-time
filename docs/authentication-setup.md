# Django Authentication Setup

## Overview

Django authentication has been fully implemented and configured with session management, login/logout views, and admin dashboard access.

## Configuration Summary

### Session Management

- **Session Engine**: Database-backed sessions (`django.contrib.sessions.backends.db`)
- **Session Timeout**: 4 hours (14400 seconds)
- **Session Refresh**: Sessions are refreshed on every request
- **Cookie Settings**:
  - HttpOnly: Enabled (prevents JavaScript access)
  - Secure: Conditional (enabled only when SSL redirect is active)
  - SameSite: None (for Safari 12 compatibility)

### Authentication Settings

- **Login URL**: `/login/`
- **Login Redirect**: `/` (home page after successful login)
- **Logout Redirect**: `/login/` (login page after logout)
- **User Model**: Custom user model (`users.User`) using email as username

### Security Settings

- **CSRF Protection**: Enabled
- **SSL Redirect**: Configurable via `SECURE_SSL_REDIRECT` environment variable (defaults to False for local development)
- **Password Validation**: Django's default validators (can be customized)
- **Login Attempt Protection**: Django Defender configured with:
  - Maximum 3 failed login attempts
  - 5-minute cooloff period
  - Lockout template at `defender/lockout.html`

## Endpoints

### Login

- **URL**: `http://localhost:8000/login/`
- **Method**: GET (display form), POST (submit credentials)
- **Template**: `templates/registration/login.html`
- **Features**:
  - Email-based authentication
  - CSRF protection
  - Error message display
  - "Next" parameter support for redirects
  - Session timeout information display

### Logout

- **URL**: `http://localhost:8000/logout/`
- **Method**: GET or POST
- **Template**: `templates/registration/logged_out.html`
- **Features**:
  - Clears session
  - Displays confirmation message
  - Link to login again

### Admin Dashboard

- **URL**: `http://localhost:8000/admin/`
- **Features**:
  - Full Django admin interface
  - User management
  - Custom User model admin (email-based)
  - Group and permission management
  - Django Defender admin interface at `/admin/defender/`

## Test Credentials

A superuser has been created for testing:

- **Email**: `admin@abouttime.com`
- **Password**: `admin123`

⚠️ **Important**: Change these credentials in production!

## Testing the Authentication System

### 1. Test Login Page

```bash
# Check if login page is accessible
curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/login/
# Expected: 200
```

Open in browser: http://localhost:8000/login/

### 2. Test Login Flow

1. Navigate to http://localhost:8000/login/
2. Enter credentials:
   - Email: `admin@abouttime.com`
   - Password: `admin123`
3. Click "Sign in"
4. You should be redirected to the home page

### 3. Test Admin Dashboard

1. Navigate to http://localhost:8000/admin/
2. If not logged in, you'll be redirected to the admin login page
3. Enter the same credentials as above
4. You should see the Django admin dashboard

### 4. Test Session Timeout

1. Log in successfully
2. Wait 4 hours without any activity
3. Try to access a protected page
4. You should be redirected to the login page

### 5. Test Logout

1. While logged in, navigate to http://localhost:8000/logout/
2. You should see a "Successfully Logged Out" page
3. Click "Sign in again" to return to the login page

## Admin Interface Features

The admin dashboard provides:

1. **User Management**:
   - List all users
   - Search by email
   - Filter by active status, staff status, and groups
   - Create/edit/delete users
   - Manage user permissions

2. **Group Management**:
   - Create user groups
   - Assign permissions to groups
   - Manage group memberships

3. **Django Defender**:
   - View blocked IP addresses
   - Manage access attempts
   - Configure lockout settings

## Files Modified/Created

### Configuration Files

1. **backend/project_name/settings/base.py**:
   - Added session configuration
   - Added login/logout URL settings
   - Configured session timeout (4 hours)

2. **backend/project_name/settings/production.py**:
   - Made SSL redirect conditional
   - Updated security settings for development flexibility

3. **backend/project_name/urls.py**:
   - Added login and logout URL patterns

### Templates

1. **backend/templates/registration/login.html**:
   - Standalone login page
   - Uses Tailwind CSS from CDN
   - Email-based authentication
   - CSRF protection
   - Error message display

2. **backend/templates/registration/logged_out.html**:
   - Logout confirmation page
   - Link to login again

### User Management

1. **Superuser Created**:
   - Email: admin@abouttime.com
   - Password: admin123
   - Superuser, staff, and active flags set

## Environment Variables

### Optional Variables for Production

Add to `backend/.env` for production deployment:

```bash
# Enable SSL redirect in production
SECURE_SSL_REDIRECT=True

# Set HSTS max age (in seconds)
SECURE_HSTS_SECONDS=31536000
```

## Next Steps

1. ✅ **Backend authentication is complete**
2. ⏭️ **Next**: Implement React login page and authentication state management
3. ⏭️ **Next**: Configure CSRF token handling between Django and React
4. ⏭️ **Next**: Implement protected routes in React
5. ⏭️ **Next**: Add user profile management

## Troubleshooting

### Login Page Returns 500 Error

- **Issue**: Webpack loader error
- **Solution**: Login templates are now standalone and don't require webpack
- **Verification**: Check that templates don't extend base.html

### Session Not Persisting

- **Check**: Ensure `SESSION_COOKIE_HTTPONLY = True` in settings
- **Check**: Verify database migrations are applied
- **Check**: Check that `django.contrib.sessions` is in INSTALLED_APPS

### Admin Login Separate from Custom Login

- **Note**: Django admin has its own login at `/admin/login/`
- **Behavior**: Admin login uses Django's built-in authentication views
- **Option**: You can customize the admin login template if needed

### SSL Redirect Issues in Development

- **Issue**: Getting 301 redirects to HTTPS
- **Solution**: Set `SECURE_SSL_REDIRECT=False` in `.env` (already done)
- **Verification**: Check production.py settings

## Security Considerations

1. **Change Default Credentials**: The test superuser should be changed or deleted in production
2. **Enable SSL in Production**: Set `SECURE_SSL_REDIRECT=True` when deployed with HTTPS
3. **Session Security**: Sessions are HttpOnly to prevent XSS attacks
4. **CSRF Protection**: All forms include CSRF tokens
5. **Password Validation**: Django's default validators are active
6. **Login Attempt Limits**: Django Defender protects against brute force attacks

## Technical Details

### Authentication Backend

Django uses its default authentication backend:

```python
AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
]
```

### Custom User Model

The project uses a custom user model with email as the username:

```python
# users/models.py
class User(AbstractBaseUser, PermissionsMixin, IndexedTimeStampedModel):
    email = models.EmailField(max_length=255, unique=True)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    USERNAME_FIELD = "email"
```

### Session Storage

Sessions are stored in the database:

```python
SESSION_ENGINE = "django.contrib.sessions.backends.db"
```

This allows for:
- Persistent sessions across server restarts
- Easy session management through admin interface
- Better security than cookie-based sessions

## References

- [Django Authentication System](https://docs.djangoproject.com/en/stable/topics/auth/)
- [Django Sessions](https://docs.djangoproject.com/en/stable/topics/http/sessions/)
- [Django Defender](https://django-defender.readthedocs.io/)
- [Django Security](https://docs.djangoproject.com/en/stable/topics/security/)
