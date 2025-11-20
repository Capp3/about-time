# About Time - Backend

Django 5.2+ backend for the About Time timekeeping and time-off management system.

## Overview

This backend provides a REST API for the About Time application, built with Django and Django REST Framework. It handles:
- User authentication and authorization
- Timeclock entry management
- Time-off request processing
- Balance tracking and calculations
- Background task processing with Celery

## Technology Stack

- **Django 5.2+** - Web framework
- **Django REST Framework** - API development
- **PostgreSQL 18** - Database
- **Celery 5.3.6+** - Background task processing
- **Redis** - Cache and Celery result backend
- **RabbitMQ** - Celery message broker

## Project Structure

```
backend/
├── common/                    # Shared Django app
│   ├── models.py             # Base models (IndexedTimeStampedModel)
│   ├── views.py              # Common views
│   ├── routes.py             # API route definitions
│   ├── serializers.py        # Common serializers
│   ├── context_processors.py # Template context processors
│   └── utils/                # Shared utilities
├── users/                    # User management app
│   ├── models.py             # Custom User model (email-based auth)
│   ├── managers.py           # Custom UserManager
│   ├── views.py              # User views
│   ├── routes.py             # User API routes
│   ├── serializers.py        # User serializers
│   ├── tasks.py              # User-related Celery tasks
│   ├── admin.py              # Django admin configuration
│   └── tests/                # User app tests
├── project_name/             # Main Django project
│   ├── settings/             # Environment-specific settings
│   │   ├── base.py          # Base settings
│   │   ├── local_base.py    # Local development
│   │   ├── production.py    # Production
│   │   └── test.py          # Testing
│   ├── urls.py               # URL routing configuration
│   ├── wsgi.py               # WSGI application
│   ├── celery.py             # Celery configuration
│   └── celerybeat_schedule.py # Periodic tasks configuration
├── templates/                # Django templates
│   ├── base.html            # Base template
│   ├── common/              # Common templates
│   ├── defender/            # Login protection templates
│   └── includes/            # Template partials
├── manage.py                 # Django management script
├── pyproject.toml            # Python dependencies
├── Dockerfile                # Docker container configuration
├── .env                      # Environment variables (not in git)
└── README.md                 # This file
```

## Django Apps

### common
Shared functionality used across the application:
- **Base Models**: `IndexedTimeStampedModel` (provides created/modified timestamps)
- **Common Views**: Shared view logic
- **Utilities**: Helper functions and utilities
- **Context Processors**: Custom template context

### users
User management and authentication:
- **Custom User Model**: Email-based authentication (no username)
- **Authentication**: Login/logout, session management
- **Authorization**: Role-based permissions
- **Profile Management**: User profile and settings
- **Background Tasks**: User-related async operations

### project_name
Main Django project configuration:
- **Settings**: Environment-specific configuration
- **URL Routing**: Central URL configuration
- **WSGI/ASGI**: Application server interfaces
- **Celery**: Background task configuration

## Database Models

### Base Model Pattern

All models inherit from `IndexedTimeStampedModel`:

```python
from common.models import IndexedTimeStampedModel

class MyModel(IndexedTimeStampedModel):
    # Your fields here
    pass
    
# Automatically includes:
# - created: DateTimeField (indexed)
# - modified: DateTimeField (indexed)
```

### User Model

Custom user model with email-based authentication:

```python
from users.models import User

# Fields:
# - email: EmailField (unique, used for login)
# - is_staff: BooleanField
# - is_active: BooleanField
# - password: (hashed)
# - created: DateTimeField
# - modified: DateTimeField
```

## API Structure

### REST API Endpoints

```
/api/                          # API root
  /users/                      # User management
  /schema/                     # OpenAPI schema (JSON)
  /schema/swagger-ui/          # Swagger UI documentation
  /schema/redoc/               # ReDoc UI documentation
/admin/                        # Django admin interface
/admin/defender/               # Login protection admin
```

### API Response Format

**Success Response:**
```json
{
  "id": 1,
  "field_name": "value",
  "created": "2024-01-01T00:00:00Z",
  "modified": "2024-01-01T00:00:00Z"
}
```

**Error Response:**
```json
{
  "field_name": ["Error message"],
  "non_field_errors": ["General error"]
}
```

### API Authentication

- **Method**: Django session-based authentication
- **Session Duration**: 4 hours of inactivity
- **CSRF Protection**: Required for all state-changing requests
- **Cookie Settings**: HttpOnly, Secure (production), SameSite=Lax

## Development Setup

### Prerequisites

- Python 3.12+
- PostgreSQL 18
- Redis (for Celery)
- RabbitMQ (for Celery)
- UV (Python package manager)

### Installation

```bash
# Install UV (if not already installed)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Create virtual environment
cd backend
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
uv pip install -e .
```

### Environment Configuration

Create `.env` file:

```env
# Database
DATABASE_URL=postgresql://about-time:password@localhost:5432/about-time

# Django
DJANGO_SECRET_KEY=your-secret-key-here
DJANGO_DEBUG=True
DJANGO_SETTINGS_MODULE=project_name.settings.local_base
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

# Celery
CELERY_BROKER_URL=amqp://localhost:5672
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# Email (Development)
EMAIL_HOST=localhost
EMAIL_PORT=1025

# Sentry (optional)
SENTRY_DSN=
```

### Database Setup

```bash
# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Load initial data (if any)
python manage.py loaddata initial_data
```

### Running the Development Server

```bash
# Start Django server
python manage.py runserver 0.0.0.0:8000

# Access application
# - API: http://localhost:8000/api/
# - Admin: http://localhost:8000/admin/
# - API Docs: http://localhost:8000/api/schema/swagger-ui/
```

### Running Celery

```bash
# Terminal 1: Start Celery worker
celery -A project_name worker --loglevel=info

# Terminal 2: Start Celery Beat (scheduled tasks)
celery -A project_name beat --loglevel=info

# Optional: Start Flower (monitoring)
celery -A project_name flower
```

## Testing

### Running Tests

```bash
# Run all tests
python manage.py test

# Run specific app
python manage.py test users

# Run with coverage
coverage run --source='.' manage.py test
coverage report
coverage html
```

### Writing Tests

```python
from django.test import TestCase
from model_bakery import baker

class MyModelTest(TestCase):
    def setUp(self):
        self.user = baker.make('users.User')
    
    def test_something(self):
        self.assertIsNotNone(self.user)
```

## Code Quality

### Linting

```bash
# Check code
ruff check .

# Format code
ruff format .
```

### Type Checking

```bash
# Install mypy
uv pip install mypy django-stubs djangorestframework-stubs

# Run type checking
mypy .
```

## Management Commands

### Common Django Commands

```bash
# Create new app
python manage.py startapp app_name

# Make migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Shell
python manage.py shell

# Database shell
python manage.py dbshell

# Collect static files
python manage.py collectstatic

# Show URLs
python manage.py show_urls  # if django-extensions installed
```

### Custom Management Commands

Create custom commands in `app_name/management/commands/`:

```python
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'Description of command'
    
    def handle(self, *args, **options):
        # Command logic here
        self.stdout.write(self.style.SUCCESS('Success!'))
```

Run with: `python manage.py command_name`

## Deployment

### Production Checklist

- [ ] Set `DEBUG = False`
- [ ] Configure strong `SECRET_KEY`
- [ ] Set `ALLOWED_HOSTS`
- [ ] Enable HTTPS
- [ ] Set `SESSION_COOKIE_SECURE = True`
- [ ] Set `CSRF_COOKIE_SECURE = True`
- [ ] Configure database backups
- [ ] Set up error tracking (Sentry)
- [ ] Configure logging
- [ ] Run `collectstatic`
- [ ] Apply all migrations
- [ ] Start Celery workers

### Environment Variables

Required for production:
- `DATABASE_URL`
- `DJANGO_SECRET_KEY`
- `DJANGO_SETTINGS_MODULE=project_name.settings.production`
- `DJANGO_ALLOWED_HOSTS`
- `CELERY_BROKER_URL`
- `CELERY_RESULT_BACKEND`
- `SENTRY_DSN`

## API Documentation

### Generating OpenAPI Schema

```bash
# Generate schema file
python manage.py spectacular --color --file schema.yml

# View in browser
# Swagger UI: http://localhost:8000/api/schema/swagger-ui/
# ReDoc: http://localhost:8000/api/schema/redoc/
```

### Updating Frontend API Client

After API changes:

```bash
# From project root
pnpm run openapi-ts
```

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
psql -U about-time -d about-time

# Reset database
python manage.py flush
python manage.py migrate
```

### Migration Issues

```bash
# Show migration status
python manage.py showmigrations

# Fake a migration
python manage.py migrate --fake app_name migration_name

# Merge conflicting migrations
python manage.py makemigrations --merge
```

### Celery Issues

```bash
# Purge all tasks
celery -A project_name purge

# Inspect active workers
celery -A project_name inspect active

# Check Celery configuration
celery -A project_name inspect conf
```

## References

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Celery Documentation](https://docs.celeryq.dev/)
- [UV Documentation](https://docs.astral.sh/uv/)
- [Project Documentation](../docs/README.md)

## Contributing

See [Development Guide](../docs/development.md) for contribution guidelines.

## License

GNUv3
