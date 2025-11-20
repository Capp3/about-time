# About Time - Technical Documentation

## Overview

This document captures technical decisions, coding standards, conventions, and implementation details for the About Time project. It serves as a reference for developers working on the codebase and documents the rationale behind key technical choices.

## Table of Contents

1. [Technology Choices](#technology-choices)
2. [Coding Standards](#coding-standards)
3. [Database Design](#database-design)
4. [API Design](#api-design)
5. [Authentication & Security](#authentication--security)
6. [Frontend Architecture](#frontend-architecture)
7. [Testing Strategy](#testing-strategy)
8. [Development Workflow](#development-workflow)
9. [Deployment](#deployment)
10. [Dependencies](#dependencies)

## Technology Choices

### Why Django 5.2+?

**Decision**: Use Django 5.2+ as the backend framework

**Rationale**:
- Mature, well-documented framework with excellent ORM
- Built-in admin interface for rapid development
- Strong security features (CSRF, XSS protection, SQL injection prevention)
- Large ecosystem of packages (DRF, Celery integration, etc.)
- Python's readability and maintainability
- Excellent support for PostgreSQL
- Built-in migration system

**Alternatives Considered**:
- FastAPI: Lighter weight but less feature-complete for admin/auth
- Flask: Too minimal for our needs, would require more custom code
- Rails: Team familiarity with Python ecosystem

### Why React + TypeScript?

**Decision**: Use React 18 with TypeScript for the frontend

**Rationale**:
- React's component model fits our UI requirements
- TypeScript provides type safety and better IDE support
- Large ecosystem of libraries and tools
- Excellent documentation and community support
- Team expertise with React
- Strong typing helps catch errors early

**Alternatives Considered**:
- Vue: Good alternative but less team familiarity
- Svelte: Emerging technology, smaller ecosystem
- Angular: More opinionated, steeper learning curve
- Plain JavaScript: Lack of type safety for larger codebase

### Why Session Auth over JWT?

**Decision**: Use Django session-based authentication

**Rationale**:
- Simpler to implement correctly with Django
- Server-side session invalidation (logout works immediately)
- No token refresh complexity
- Built-in CSRF protection
- Suitable for our scale (single domain, 3-5 concurrent users)
- HttpOnly cookies prevent XSS token theft

**Trade-offs**:
- Less suitable for mobile apps (future consideration)
- Requires session storage (database/Redis)
- Less suitable for microservices (not current requirement)

### Why PostgreSQL 18?

**Decision**: Use PostgreSQL 18 as the primary database

**Rationale**:
- ACID compliance for data integrity
- Excellent JSON support for flexible schemas
- Advanced indexing options
- Strong Django ORM support
- Reliable and battle-tested
- Good performance for our scale

**Alternatives Considered**:
- MySQL: Less advanced features
- SQLite: Not suitable for production
- MongoDB: RDBMS better fits our relational data model

### Why UV for Python Package Management?

**Decision**: Use UV instead of pip/poetry

**Rationale**:
- 10-100x faster than pip
- Built-in lock file support
- Compatible with pip/pip-tools
- Simple configuration
- Modern tooling approach

**Documentation**: See `docs/uv_guidelines.md`

### Why PNPM for Node Package Management?

**Decision**: Use PNPM instead of npm/yarn

**Rationale**:
- Faster installations than npm
- Disk-efficient (content-addressable storage)
- Strict dependency resolution
- Better monorepo support
- Compatible with npm ecosystem

### Why Webpack over Vite?

**Decision**: Continue using Webpack 5 (inherited from boilerplate)

**Current Status**:
- Working configuration
- Integration with Django webpack-loader
- Established build pipeline

**Future Consideration**:
- Vite is faster and simpler
- Consider migration after MVP for improved DX

## Coding Standards

### Python Code Style

**Linter**: Ruff (configured in `pyproject.toml`)

**Key Rules**:
- Line length: 100 characters
- Indentation: 4 spaces
- Target: Python 3.12
- Follow PEP 8 conventions
- Use type hints where beneficial
- Docstrings for public APIs

**Import Organization**:
```python
# Future imports
from __future__ import annotations

# Standard library
import os
from typing import Any

# Django imports
from django.db import models
from django.contrib.auth import get_user_model

# Third-party imports
from rest_framework import viewsets

# Local imports
from common.models import IndexedTimeStampedModel
from .serializers import UserSerializer
```

**Naming Conventions**:
- Classes: `PascalCase` (e.g., `TimeclockEntry`)
- Functions/methods: `snake_case` (e.g., `calculate_overtime`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_LOGIN_ATTEMPTS`)
- Private methods: `_leading_underscore` (e.g., `_internal_helper`)

### TypeScript/JavaScript Code Style

**Linter**: ESLint with TypeScript plugin

**Key Rules**:
- Use TypeScript for all new code
- Prefer functional components over class components
- Use React hooks for state management
- Explicit return types for functions
- Use `const` over `let`, avoid `var`
- Prefer async/await over promises

**Component Structure**:
```typescript
// Imports
import { useState } from 'react';
import type { FC } from 'react';

// Types/Interfaces
interface Props {
  title: string;
  onSubmit: (data: FormData) => void;
}

// Component
export const MyComponent: FC<Props> = ({ title, onSubmit }) => {
  const [state, setState] = useState('');
  
  return (
    <div>{title}</div>
  );
};
```

**File Naming**:
- Components: `PascalCase.tsx` (e.g., `TopNav.tsx`)
- Utilities: `camelCase.ts` (e.g., `urls.ts`)
- Types: `camelCase.d.ts` (e.g., `index.d.ts`)

### Django App Structure

**Standard App Layout**:
```
app_name/
├── __init__.py
├── admin.py          # Django admin configuration
├── apps.py           # App configuration
├── models.py         # Data models
├── views.py          # View logic
├── serializers.py    # DRF serializers
├── routes.py         # API route definitions
├── tasks.py          # Celery tasks
├── managers.py       # Custom model managers (optional)
├── urls.py           # URL patterns (if needed)
├── tests/            # Test files
│   ├── __init__.py
│   ├── test_models.py
│   ├── test_views.py
│   └── test_serializers.py
└── migrations/       # Database migrations
    └── __init__.py
```

## Database Design

### Model Conventions

**Base Model**:
All models should inherit from `IndexedTimeStampedModel`:

```python
from common.models import IndexedTimeStampedModel

class MyModel(IndexedTimeStampedModel):
    # Fields here
    name = models.CharField(max_length=255)
    
    class Meta:
        db_table = 'myapp_mymodel'
        ordering = ['-created']
        indexes = [
            models.Index(fields=['name']),
        ]
```

**Field Conventions**:
- Use `CharField` with explicit `max_length`
- Use `TextField` for unlimited text
- Use `DecimalField` for monetary values (not `FloatField`)
- Use `DateTimeField` with `auto_now_add` for created timestamps
- Use `DateTimeField` with `auto_now` for modified timestamps
- Use `BooleanField` with `default` value
- Use `ForeignKey` with explicit `on_delete` behavior

**Relationship Conventions**:
- Use `on_delete=models.CASCADE` for dependent data
- Use `on_delete=models.PROTECT` to prevent deletion
- Use `on_delete=models.SET_NULL` with `null=True` for optional refs
- Use `related_name` for reverse relations

**Example Model**:
```python
class TimeclockEntry(IndexedTimeStampedModel):
    employee = models.ForeignKey(
        'users.User',
        on_delete=models.PROTECT,
        related_name='timeclock_entries'
    )
    clock_in = models.DateTimeField()
    clock_out = models.DateTimeField(null=True, blank=True)
    break_duration = models.DurationField(default=timedelta(0))
    overtime_hours = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00')
    )
    status = models.CharField(
        max_length=20,
        choices=EntryStatus.choices,
        default=EntryStatus.PENDING
    )
    
    class Meta:
        db_table = 'timeclock_entry'
        ordering = ['-clock_in']
        indexes = [
            models.Index(fields=['employee', '-clock_in']),
            models.Index(fields=['status', '-clock_in']),
        ]
    
    def __str__(self):
        return f"{self.employee} - {self.clock_in.date()}"
```

### Migration Conventions

**Guidelines**:
- Generate migrations after model changes: `python manage.py makemigrations`
- Review migrations before committing
- Name complex migrations descriptively
- Never edit applied migrations
- Test migrations on development data
- Write data migrations for complex changes

**Data Migration Example**:
```python
from django.db import migrations

def forwards_func(apps, schema_editor):
    MyModel = apps.get_model('myapp', 'MyModel')
    # Perform data transformation
    for obj in MyModel.objects.all():
        obj.new_field = obj.old_field.upper()
        obj.save()

def reverse_func(apps, schema_editor):
    # Reverse the transformation
    pass

class Migration(migrations.Migration):
    dependencies = [
        ('myapp', '0001_initial'),
    ]
    
    operations = [
        migrations.RunPython(forwards_func, reverse_func),
    ]
```

## API Design

### REST API Conventions

**URL Structure**:
- Use plural nouns: `/api/users/`, `/api/timeclock-entries/`
- Use hyphens for multi-word resources: `/api/balance-adjustments/`
- Use nested routes sparingly: `/api/users/{id}/entries/`

**HTTP Methods**:
- `GET`: Retrieve resource(s)
- `POST`: Create new resource
- `PUT`: Full update of resource
- `PATCH`: Partial update of resource
- `DELETE`: Delete resource

**Status Codes**:
- `200 OK`: Successful GET, PUT, PATCH, DELETE
- `201 Created`: Successful POST
- `204 No Content`: Successful DELETE with no body
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Authenticated but not authorized
- `404 Not Found`: Resource doesn't exist
- `500 Internal Server Error`: Server error

**Response Format**:
```json
{
  "id": 1,
  "field_name": "value",
  "related_object": {
    "id": 2,
    "name": "Related"
  },
  "created": "2024-01-01T00:00:00Z",
  "modified": "2024-01-01T00:00:00Z"
}
```

**Error Response Format**:
```json
{
  "field_name": ["Error message for field"],
  "non_field_errors": ["General error message"]
}
```

**Pagination**:
- Use DRF's built-in pagination
- Default page size: 25
- Include pagination metadata

### ViewSet Pattern

**Standard ViewSet**:
```python
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

class MyModelViewSet(viewsets.ModelViewSet):
    queryset = MyModel.objects.all()
    serializer_class = MyModelSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Filter based on user
        return super().get_queryset().filter(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def custom_action(self, request, pk=None):
        obj = self.get_object()
        # Custom logic
        return Response({'status': 'success'})
```

### Serializer Conventions

**Standard Serializer**:
```python
from rest_framework import serializers
from .models import MyModel

class MyModelSerializer(serializers.ModelSerializer):
    # Computed fields
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = MyModel
        fields = ['id', 'name', 'full_name', 'created', 'modified']
        read_only_fields = ['id', 'created', 'modified']
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"
    
    def validate_name(self, value):
        if len(value) < 3:
            raise serializers.ValidationError("Name too short")
        return value
```

## Authentication & Security

### Session Configuration

**Settings** (in `settings/base.py`):
```python
# Session configuration
SESSION_ENGINE = 'django.contrib.sessions.backends.db'
SESSION_COOKIE_AGE = 14400  # 4 hours
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SECURE = True  # Production only
SESSION_COOKIE_SAMESITE = 'Lax'
SESSION_SAVE_EVERY_REQUEST = True

# CSRF configuration
CSRF_COOKIE_HTTPONLY = False  # JavaScript needs to read it
CSRF_COOKIE_SECURE = True  # Production only
CSRF_COOKIE_SAMESITE = 'Lax'
CSRF_USE_SESSIONS = False  # Use separate cookie
```

### Password Requirements

**Configuration**:
- Minimum 8 characters
- Must contain letters and numbers
- Common password check enabled
- User attribute similarity check enabled

### CORS Configuration

**For SPA**:
```python
# Allow same-origin requests (frontend and backend on same domain)
# No CORS middleware needed for same-origin
# Different port in development is okay with proper configuration
```

### CSRF Token Handling

**Backend**: Django sets CSRF cookie automatically

**Frontend**: Include token in request header:
```typescript
// In App.tsx
OpenAPI.interceptors.request.use((request) => {
  const { csrftoken } = cookie.parse(document.cookie);
  if (request.headers && csrftoken) {
    request.headers["X-CSRFTOKEN"] = csrftoken;
  }
  return request;
});
```

### API Authentication

**Endpoints**:
- Login: `POST /api/auth/login/` (to be implemented)
- Logout: `POST /api/auth/logout/` (to be implemented)
- Current user: `GET /api/auth/me/` (to be implemented)

### Permission Classes

**Standard Permissions**:
```python
from rest_framework import permissions

# Authenticated users only
permission_classes = [permissions.IsAuthenticated]

# Admin/staff only
permission_classes = [permissions.IsAdminUser]

# Custom permission
class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user == request.user
```

## Frontend Architecture

### Component Guidelines

**Functional Components**:
- Always use functional components with hooks
- Use TypeScript for type safety
- Export as named exports

**Props Interface**:
```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

export const Button: FC<ButtonProps> = ({
  label,
  onClick,
  disabled = false,
  variant = 'primary',
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {label}
    </button>
  );
};
```

### State Management

**Local State**:
```typescript
const [count, setCount] = useState(0);
```

**Form State**:
```typescript
const [formData, setFormData] = useState({
  name: '',
  email: '',
});

const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value,
  });
};
```

**Server State** (via React Router loaders):
```typescript
// In loaders/users.ts
export const usersLoader = async () => {
  const users = await api.getUsers();
  return { users };
};

// In pages/Users.tsx
import { useLoaderData } from 'react-router';

export const Users = () => {
  const { users } = useLoaderData() as { users: User[] };
  return <div>{/* Render users */}</div>;
};
```

### Routing Conventions

**Route Definition**:
```typescript
import { createBrowserRouter } from 'react-router';

const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: 'users', Component: Users, loader: usersLoader },
      { path: 'users/:id', Component: UserDetail, loader: userDetailLoader },
    ],
  },
]);
```

### API Client Usage

**Generated Client**:
```typescript
import { api } from '@/js/api';

// List users
const users = await api.users.list();

// Get specific user
const user = await api.users.retrieve({ id: 1 });

// Create user
const newUser = await api.users.create({
  email: 'user@example.com',
  password: 'password123',
});

// Update user
const updated = await api.users.partialUpdate({
  id: 1,
  email: 'newemail@example.com',
});
```

### Error Handling

**Component Error Boundaries**:
```typescript
<Sentry.ErrorBoundary fallback={<ErrorFallback />}>
  <MyComponent />
</Sentry.ErrorBoundary>
```

**API Error Handling**:
```typescript
try {
  await api.users.create(userData);
} catch (error) {
  if (error.response) {
    // Validation errors
    setErrors(error.response.data);
  } else {
    // Network error
    console.error('Network error:', error);
  }
}
```

## Testing Strategy

### Backend Testing

**Model Tests**:
```python
from django.test import TestCase
from model_bakery import baker

class MyModelTest(TestCase):
    def setUp(self):
        self.obj = baker.make('myapp.MyModel')
    
    def test_str_representation(self):
        self.assertEqual(str(self.obj), self.obj.name)
```

**API Tests**:
```python
from rest_framework.test import APITestCase
from rest_framework import status

class MyViewSetTest(APITestCase):
    def setUp(self):
        self.user = baker.make('users.User')
        self.client.force_authenticate(user=self.user)
    
    def test_list_objects(self):
        response = self.client.get('/api/myobjects/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
```

### Frontend Testing

**Component Tests**:
```typescript
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with label', () => {
    render(<Button label="Click me" onClick={() => {}} />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button label="Click me" onClick={handleClick} />);
    screen.getByText('Click me').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Development Workflow

### Git Workflow

**Branch Naming**:
- Features: `feature/description`
- Bugfixes: `fix/description`
- Hotfixes: `hotfix/description`

**Commit Messages**:
```
type(scope): subject

body (optional)

footer (optional)
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Example**:
```
feat(auth): add session-based authentication

- Implement login/logout views
- Add CSRF token handling
- Configure session settings

Closes #123
```

### Code Review Checklist

- [ ] Code follows style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No security vulnerabilities introduced
- [ ] Performance is acceptable
- [ ] Error handling is appropriate
- [ ] Logging is adequate

### Pre-commit Hooks

**Configured** (in `.pre-commit-config.yaml`):
- Python: Ruff linting
- Frontend: ESLint
- Format checking
- Secrets scanning

## Deployment

### Environment Variables

**Required Environment Variables**:
- `DJANGO_SECRET_KEY`: Django secret key
- `DATABASE_URL`: PostgreSQL connection string
- `DJANGO_SETTINGS_MODULE`: Settings module to use
- `DJANGO_DEBUG`: Debug mode (False in production)
- `DJANGO_ALLOWED_HOSTS`: Comma-separated list
- `CELERY_BROKER_URL`: RabbitMQ URL
- `CELERY_RESULT_BACKEND`: Redis URL
- `SENTRY_DSN`: Sentry error tracking

### Production Checklist

- [ ] `DEBUG = False`
- [ ] Strong `SECRET_KEY` configured
- [ ] `ALLOWED_HOSTS` properly set
- [ ] Database backups configured
- [ ] HTTPS enforced
- [ ] Static files collected and served
- [ ] Celery workers running
- [ ] Monitoring/logging configured
- [ ] Error tracking enabled (Sentry)
- [ ] Database migrations applied
- [ ] Environment variables secured

## Dependencies

### Python Dependencies (Backend)

**Core**:
- Django 5.2+
- djangorestframework 3.14+
- psycopg 3.1+ (PostgreSQL adapter)
- celery[redis] 5.3.6+

**Utilities**:
- python-decouple (environment variables)
- dj-database-url (database URL parsing)
- django-model-utils (model utilities)

**API**:
- drf-spectacular (OpenAPI documentation)

**Security**:
- django-defender (login protection)
- django-csp (Content Security Policy)
- django-permissions-policy

**Development**:
- ruff (linting)
- model-bakery (test fixtures)
- coverage (test coverage)
- pre-commit (git hooks)

### Node Dependencies (Frontend)

**Core**:
- react 18.3.1
- react-dom 18.3.1
- react-router 7.9.0
- typescript 5.4.5

**Build Tools**:
- webpack 5.91.0
- @swc/core (fast compilation)

**Styling**:
- tailwindcss 4.x
- postcss

**API**:
- axios (HTTP client)
- @hey-api/openapi-ts (API client generation)

**Monitoring**:
- @sentry/react (error tracking)

**Development**:
- eslint (linting)
- jest (testing)
- @testing-library/react (component testing)

## References

- [Django Best Practices](https://docs.djangoproject.com/en/5.0/misc/design-philosophies/)
- [DRF Best Practices](https://www.django-rest-framework.org/community/3.0-announcement/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [TypeScript Do's and Don'ts](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)

## Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2024-10-27 | 1.0 | Initial technical documentation | AI Assistant |
