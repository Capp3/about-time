# About Time - Development Guide

## Overview

This guide provides comprehensive instructions for setting up your development environment, running the application locally, and contributing to the project.

## Development Principles

These core principles guide our development process and must be followed throughout the project lifecycle.

### 1. Slow and Deliberate Development

We value quality over speed. Moving slowly and deliberately produces better results than rushing.

**Why Move Slowly?**
- **Reduced Technical Debt**: Taking time to implement features properly means less refactoring later
- **Higher Quality**: Careful implementation leads to fewer bugs and better user experience
- **Better Architecture**: Time to think through design decisions leads to more maintainable code
- **More Complete Testing**: Thorough testing requires time but prevents future issues
- **Comprehensive Documentation**: Well-documented code and features improve long-term maintainability

**Implementation Guidelines**
- **Weekly Iterations**: Focus on small, manageable chunks of work each week
- **Daily Code Review**: All code must be reviewed before merging
- **Testing First**: Write tests before or alongside implementation
- **Document Everything**: Update documentation with each feature
- **No Shortcuts**: Don't take implementation shortcuts to save time

### 2. Zero Tolerance for Feature Creep

We commit to building exactly what's in the PRD - nothing more, nothing less.

**Anti-Feature Creep Rules**
1. **PRD as Source of Truth**: All features must be explicitly defined in the PRD
2. **Formal Change Process**: Any change to requirements requires formal approval
3. **Parking Lot**: Capture good ideas for future consideration without implementing them now
4. **Regular Scope Review**: Weekly review to ensure we're still on track with original scope
5. **"No" as Default**: The default answer to new feature requests during MVP is "no"

### 3. Ask Questions Before Implementing

We maintain a culture of questioning and clarity.

**Question Guidelines**
- **Question Ambiguities**: Identify and question any ambiguous requirements
- **Document Decisions**: Record all clarifications and decisions in the appropriate docs
- **Verify Understanding**: Confirm understanding before starting implementation
- **Challenge Assumptions**: Don't assume - ask and verify

## Prerequisites

### Required Software

- **Docker** (version 20.10+) and **Docker Compose** (version 2.0+)
  - [Install Docker Desktop](https://www.docker.com/products/docker-desktop/)
  
- **Python** (version 3.12+)
  - The project uses UV for package management, which will be installed automatically
  
- **Node.js** (version 20.x)
  - [Install Node.js](https://nodejs.org/)
  
- **PNPM** (version 10.18.0+)
  - Install via: `npm install -g pnpm@10.18.0`

### Recommended Tools

- **Git** (version 2.30+)
- **VS Code** or **Cursor** IDE with recommended extensions:
  - Python
  - ESLint
  - Prettier
  - Docker
  - PostgreSQL
- **pgAdmin** or **DBeaver** for database management (optional, PgAdmin included in Docker)

## Initial Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd about-time
```

### 2. Create Docker Volumes

The application requires persistent Docker volumes for PostgreSQL and PgAdmin:

```bash
docker volume create about-time_dbdata
docker volume create about-time_pgadmin-data
```

### 3. Backend Setup

#### Environment Configuration

Create the backend environment file:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your configuration:

```env
# Database
DATABASE_URL=postgresql://about-time:password@db:5432/about-time

# Django
DJANGO_SECRET_KEY=your-secret-key-here
DJANGO_DEBUG=True
DJANGO_SETTINGS_MODULE=project_name.settings.local_base
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0

# Celery
CELERY_BROKER_URL=amqp://broker:5672
CELERY_RESULT_BACKEND=redis://result:6379/0

# Email (Development - MailHog)
EMAIL_HOST=mailhog
EMAIL_PORT=1025
EMAIL_USE_TLS=False

# Sentry (optional, for error tracking)
SENTRY_DSN=

# Security (Development)
SESSION_COOKIE_SECURE=False
CSRF_COOKIE_SECURE=False
```

#### Install Python Dependencies

The project uses **UV** for Python package management. See `docs/uv_guidelines.md` for detailed information.

```bash
# Install UV (if not already installed)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Create virtual environment and install dependencies
cd backend
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
uv pip install -e .
```

#### Run Initial Migrations

```bash
# Start database service
docker compose up -d db

# Run migrations
cd backend
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

### 4. Frontend Setup

#### Install Node Dependencies

```bash
# From project root
pnpm install
```

#### Generate API Client (Optional)

If the backend API schema is available:

```bash
# Start backend server first
# Then generate API client
pnpm run openapi-ts
```

## Running the Application

### Using Docker Compose (Recommended)

Start all services with Docker Compose:

```bash
# Start all services
docker compose up

# Or run in background
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

This starts:
- **Database** (PostgreSQL) on port 5432
- **PgAdmin** on http://localhost:8888
- **Backend** (Django) on http://localhost:8000
- **Frontend** (React) on http://localhost:3000
- **Redis** on port 6379
- **RabbitMQ** (Celery broker)
- **Celery Worker**
- **MailHog** (Email testing) on http://localhost:8025

### Running Services Individually

#### Backend (Django)

```bash
cd backend
source .venv/bin/activate  # Activate virtual environment
python manage.py runserver 0.0.0.0:8000
```

Access the backend at:
- Application: http://localhost:8000
- Admin interface: http://localhost:8000/admin/
- API documentation: http://localhost:8000/api/schema/swagger-ui/

#### Frontend (React)

```bash
# From project root
pnpm run dev
```

Access the frontend at: http://localhost:3000

#### Celery Worker

```bash
cd backend
source .venv/bin/activate
celery -A project_name worker --loglevel=info
```

#### Celery Beat (Scheduled Tasks)

```bash
cd backend
source .venv/bin/activate
celery -A project_name beat --loglevel=info
```

## Development Workflow

### 1. Creating a New Feature

#### Start a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

#### Backend Development

**Create a new Django app:**

```bash
cd backend
python manage.py startapp app_name
```

**Add to `INSTALLED_APPS`** in `backend/project_name/settings/base.py`:

```python
INSTALLED_APPS = [
    # ...
    'app_name',
]
```

**Create models** in `app_name/models.py`:

```python
from common.models import IndexedTimeStampedModel
from django.db import models

class MyModel(IndexedTimeStampedModel):
    name = models.CharField(max_length=255)
    
    class Meta:
        db_table = 'app_name_mymodel'
        ordering = ['-created']
```

**Generate and run migrations:**

```bash
python manage.py makemigrations
python manage.py migrate
```

**Create serializer** in `app_name/serializers.py`:

```python
from rest_framework import serializers
from .models import MyModel

class MyModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = MyModel
        fields = ['id', 'name', 'created', 'modified']
        read_only_fields = ['id', 'created', 'modified']
```

**Create viewset** in `app_name/views.py`:

```python
from rest_framework import viewsets, permissions
from .models import MyModel
from .serializers import MyModelSerializer

class MyModelViewSet(viewsets.ModelViewSet):
    queryset = MyModel.objects.all()
    serializer_class = MyModelSerializer
    permission_classes = [permissions.IsAuthenticated]
```

**Register routes** in `app_name/routes.py`:

```python
from .views import MyModelViewSet

routes = [
    {
        "regex": "mymodels",
        "viewset": MyModelViewSet,
        "basename": "mymodel"
    }
]
```

**Import routes** in `backend/project_name/urls.py`:

```python
from app_name.routes import routes as app_name_routes

routes = common_routes + users_routes + app_name_routes
```

#### Frontend Development

**Create a new page component:**

```typescript
// frontend/js/pages/MyPage.tsx
import type { FC } from 'react';

export const MyPage: FC = () => {
  return (
    <div>
      <h1>My Page</h1>
    </div>
  );
};

export default MyPage;
```

**Create a loader** (if needed):

```typescript
// frontend/js/loaders/mypage.ts
import { api } from '@/js/api';

export const myPageLoader = async () => {
  const data = await api.mymodels.list();
  return { data };
};
```

**Add route:**

```typescript
// frontend/js/routes/index.ts
import { myPageLoader } from '@/js/loaders';
import MyPage from '@/js/pages/MyPage';

const router = createBrowserRouter([
  // ... existing routes
  { 
    path: 'mypage', 
    Component: MyPage, 
    loader: myPageLoader 
  },
]);
```

### 2. Running Tests

#### Backend Tests

```bash
cd backend
source .venv/bin/activate

# Run all tests
python manage.py test

# Run specific app tests
python manage.py test app_name

# Run with coverage
coverage run --source='.' manage.py test
coverage report
coverage html  # Generate HTML report in htmlcov/
```

#### Frontend Tests

```bash
# Run all tests
pnpm test

# Run in watch mode
pnpm test:watch

# Update snapshots
pnpm test:update

# Run with coverage
pnpm coverage
```

### 3. Code Quality

#### Linting

**Python (Backend):**

```bash
cd backend
ruff check .
ruff format .
```

**TypeScript/JavaScript (Frontend):**

```bash
pnpm lint
```

#### Type Checking

**TypeScript:**

```bash
pnpm tsc
```

#### Pre-commit Hooks

The project uses pre-commit hooks to ensure code quality:

```bash
# Install pre-commit hooks
pre-commit install

# Run manually
pre-commit run --all-files
```

### 4. Database Management

#### Creating Migrations

```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

#### Viewing Migrations

```bash
# Show migration status
python manage.py showmigrations

# View SQL for a migration
python manage.py sqlmigrate app_name 0001
```

#### Database Shell

```bash
# Django shell
python manage.py shell

# Database shell
python manage.py dbshell
```

#### PgAdmin Access

Access PgAdmin at http://localhost:8888

- **Email:** admin@admin.com (default)
- **Password:** admin_password (default)

**Add server connection:**
- Host: db
- Port: 5432
- Database: about-time
- Username: about-time
- Password: password

### 5. API Development

#### Viewing API Documentation

- **Swagger UI:** http://localhost:8000/api/schema/swagger-ui/
- **ReDoc:** http://localhost:8000/api/schema/redoc/
- **OpenAPI Schema:** http://localhost:8000/api/schema/

#### Generating Frontend API Client

After making backend API changes:

```bash
# Ensure backend is running
# Generate TypeScript client
pnpm run openapi-ts
```

This creates type-safe API methods in `frontend/js/api/`.

#### Testing API Endpoints

**Using curl:**

```bash
# Get CSRF token
curl -c cookies.txt http://localhost:8000/api/users/

# Login (example)
curl -b cookies.txt -c cookies.txt \
  -X POST \
  -H "Content-Type: application/json" \
  -H "X-CSRFToken: <token-from-cookie>" \
  -d '{"email":"user@example.com","password":"password"}' \
  http://localhost:8000/api/auth/login/

# Make authenticated request
curl -b cookies.txt \
  -H "X-CSRFToken: <token-from-cookie>" \
  http://localhost:8000/api/users/
```

**Using httpie:**

```bash
# Install httpie
pip install httpie

# Make request
http GET http://localhost:8000/api/users/
```

### 6. Background Tasks (Celery)

#### Creating a Task

```python
# In app_name/tasks.py
from celery import shared_task

@shared_task
def my_background_task(param):
    # Task logic here
    return result
```

#### Running a Task

```python
# In views or elsewhere
from app_name.tasks import my_background_task

# Run asynchronously
result = my_background_task.delay(param)

# Get result
result.get(timeout=10)
```

#### Monitoring Tasks

**Celery Flower** (optional monitoring tool):

```bash
pip install flower
celery -A project_name flower
```

Access at http://localhost:5555

## Debugging

### Backend Debugging

#### Using Django Debug Toolbar

Install and configure django-debug-toolbar for development:

```bash
uv pip install django-debug-toolbar
```

#### Using Python Debugger (pdb)

Add breakpoint in code:

```python
import pdb; pdb.set_trace()
```

Or use Python 3.7+ built-in:

```python
breakpoint()
```

#### Logging

View Django logs:

```bash
# If using Docker
docker compose logs -f backend

# If running locally
# Logs are output to console
```

### Frontend Debugging

#### Browser DevTools

- Use React DevTools extension
- Check Console for errors
- Use Network tab for API requests

#### Debug Configuration

Add to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/frontend"
    }
  ]
}
```

## Common Tasks

### Reset Database

```bash
# Stop services
docker compose down

# Remove database volume
docker volume rm about-time_dbdata
docker volume create about-time_dbdata

# Restart and migrate
docker compose up -d db
cd backend
python manage.py migrate
python manage.py createsuperuser
```

### Clear Cache

```bash
# Redis
docker compose exec result redis-cli FLUSHALL

# Django cache
cd backend
python manage.py shell
>>> from django.core.cache import cache
>>> cache.clear()
```

### Update Dependencies

#### Python (Backend)

```bash
cd backend
uv pip install --upgrade <package>
uv pip compile pyproject.toml -o requirements.txt
```

#### Node (Frontend)

```bash
pnpm update <package>
# Or update all
pnpm update
```

## Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Find process using port
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Kill process or change port in docker-compose.yml
```

#### Docker Volume Permission Issues

```bash
# Fix permissions
sudo chown -R $USER:$USER .
```

#### Database Connection Error

```bash
# Check if database is running
docker compose ps

# Restart database
docker compose restart db

# Check logs
docker compose logs db
```

#### Frontend Not Hot Reloading

```bash
# Restart frontend service
docker compose restart frontend

# Or run frontend locally
pnpm run dev
```

#### Migration Conflicts

```bash
# Merge migrations
python manage.py makemigrations --merge
```

## Additional Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [UV Documentation](https://docs.astral.sh/uv/)
- [PNPM Documentation](https://pnpm.io/)

## Getting Help

- Review project documentation in `docs/`
- Check existing issues in the repository
- Ask questions in team communication channels
- Consult the technical lead

## Next Steps

After setup:
1. Review the [Architecture Documentation](architecture.md)
2. Read the [Technical Documentation](technical.md)
3. Check current [Tasks](tasks.md)
4. Review the [PRD](prd.md) for product requirements

Happy coding! 🚀
