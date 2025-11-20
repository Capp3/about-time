# About Time - Architecture Documentation

## System Overview

**About Time** (formerly Rota Robin) is a timekeeping and time-off management system built as a monorepo application with a clear separation between frontend and backend concerns. The system is designed to support 20-30 employees with 3-5 concurrent users in a broadcast facility environment.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
│                     React 18 + TypeScript                    │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST
                         │ Session Auth + CSRF
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                     Django 5.2 Backend                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   REST API   │  │  Session     │  │   Admin      │      │
│  │ (DRF)        │  │  Management  │  │   Interface  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┬────────────┐
         ↓               ↓               ↓            ↓
    ┌────────┐    ┌──────────┐    ┌─────────┐  ┌──────────┐
    │ Postgres│    │  Redis   │    │RabbitMQ │  │ MailHog  │
    │   18    │    │  (Cache) │    │(Celery) │  │  (Dev)   │
    └────────┘    └──────────┘    └─────────┘  └──────────┘
```

## Technology Stack

### Frontend Stack

- **React 18.3.1**: UI framework
- **TypeScript 5.4.5**: Type-safe JavaScript
- **Webpack 5.91.0**: Module bundler
- **Tailwind CSS 4**: Utility-first CSS framework
- **React Router 7.9.0**: Client-side routing
- **Axios**: HTTP client with CSRF token handling
- **Sentry**: Error tracking and monitoring

### Backend Stack

- **Django 5.2+**: Web framework
- **Django REST Framework**: API development
- **Python 3.12+**: Programming language
- **PostgreSQL 18**: Primary database
- **Redis**: Caching and Celery result backend
- **RabbitMQ**: Celery message broker
- **Celery 5.3.6+**: Asynchronous task processing
- **Gunicorn**: WSGI HTTP server

### Development & Deployment

- **UV**: Fast Python package manager
- **PNPM 10.18.0**: Node.js package manager
- **Docker & Docker Compose**: Containerization
- **GitHub Actions**: CI/CD pipeline
- **Ruff**: Python linting and formatting
- **ESLint**: JavaScript/TypeScript linting
- **Pre-commit**: Git hooks for code quality

## Project Structure

```
about-time/
├── backend/                    # Django backend
│   ├── common/                # Shared Django app
│   │   ├── models.py         # Base models (IndexedTimeStampedModel)
│   │   ├── views.py          # Common views
│   │   ├── routes.py         # API route definitions
│   │   └── utils/            # Shared utilities
│   ├── users/                # User management app
│   │   ├── models.py         # User model (email-based auth)
│   │   ├── views.py          # User views
│   │   ├── routes.py         # User API routes
│   │   ├── managers.py       # Custom user manager
│   │   ├── tasks.py          # Celery tasks
│   │   └── tests/            # User app tests
│   ├── project_name/         # Main Django project
│   │   ├── settings/         # Environment-specific settings
│   │   │   ├── base.py       # Base settings
│   │   │   ├── local_base.py # Local development
│   │   │   ├── production.py # Production
│   │   │   └── test.py       # Testing
│   │   ├── urls.py           # URL configuration
│   │   ├── wsgi.py           # WSGI application
│   │   ├── celery.py         # Celery configuration
│   │   └── celerybeat_schedule.py # Periodic tasks
│   ├── templates/            # Django templates
│   │   ├── base.html         # Base template
│   │   ├── common/           # Common templates
│   │   ├── defender/         # Login protection templates
│   │   └── includes/         # Template partials
│   ├── manage.py             # Django management script
│   ├── pyproject.toml        # Backend dependencies
│   ├── Dockerfile            # Backend container
│   └── .env                  # Environment variables
├── frontend/                 # React frontend
│   ├── js/                   # TypeScript/React code
│   │   ├── App.tsx          # Root component with routing
│   │   ├── index.tsx        # Application entry point
│   │   ├── api/             # API client (generated from OpenAPI)
│   │   ├── components/      # Reusable React components
│   │   │   ├── TopNav.tsx   # Navigation component
│   │   │   └── index.ts     # Component exports
│   │   ├── pages/           # Page components
│   │   │   ├── Home.tsx     # Home page
│   │   │   ├── Users.tsx    # Users listing
│   │   │   └── __tests__/   # Page tests
│   │   ├── routes/          # Route definitions
│   │   │   └── index.ts     # Router configuration
│   │   ├── loaders/         # React Router loaders
│   │   │   ├── users.ts     # User data loader
│   │   │   └── index.ts     # Loader exports
│   │   ├── types/           # TypeScript type definitions
│   │   ├── utils/           # Utility functions
│   │   │   ├── urls.ts      # URL utilities
│   │   │   └── navigation.ts # Navigation helpers
│   │   └── constants/       # Application constants
│   ├── css/                 # Stylesheets
│   │   └── style.css        # Main stylesheet (Tailwind)
│   ├── assets/              # Static assets
│   │   └── images/          # Image files
│   ├── Dockerfile           # Frontend container
│   └── package.json         # Frontend dependencies
├── docs/                     # Project documentation
│   ├── README.md            # Documentation index
│   ├── architecture.md      # This file
│   ├── technical.md         # Technical decisions
│   ├── development.md       # Development guide
│   ├── status.md            # Project status
│   ├── prd.md               # Product requirements
│   ├── projectbrief.md      # Project overview
│   ├── tasks.md             # Task tracking
│   ├── development.md # Development guide and principles
│   ├── questions_and_decisions.md # Decision log
│   ├── feature_parking_lot.md # Future features
│   ├── weekly_cycle.md      # Development workflow
│   ├── uv_guidelines.md     # UV package manager guide
│   └── status.md # Project status tracking
│       ├── activeContext.md # Current context
│       ├── productContext.md # Product information
│       ├── techContext.md   # Technical context
│       ├── systemPatterns.md # System patterns
│       ├── progress.md      # Progress tracking
│       ├── tasks.md         # Memory bank tasks
│       └── creative_decisions/ # Design decisions
├── .cursor/                 # Cursor IDE rules
├── .devcontainer/           # Development container config
├── .github/                 # GitHub workflows and templates
├── pyproject.toml           # Root Python project config
├── package.json             # Root Node.js config
├── docker-compose.yml       # Docker services definition
├── webpack.config.js        # Webpack configuration
├── tsconfig.json            # TypeScript configuration
├── jest.config.js           # Jest test configuration
├── .eslintrc.js             # ESLint configuration
├── .pre-commit-config.yaml  # Pre-commit hooks
├── mkdocs.yml               # Documentation site config
└── README.md                # Project overview
```

## Architectural Patterns

### Backend Architecture

#### Django App Organization

The backend follows Django's app-based architecture with clear separation of concerns:

1. **`common` app**: Shared functionality across the application
   - Base models (IndexedTimeStampedModel)
   - Common views and utilities
   - Shared context processors

2. **`users` app**: User management and authentication
   - Custom User model (email-based authentication)
   - Custom UserManager
   - User-related API endpoints
   - Celery tasks for user operations

3. **`project_name` app**: Project configuration
   - Settings management (base, local, production, test)
   - URL routing
   - Celery configuration
   - WSGI/ASGI application

#### Database Models

**Base Model Pattern**:
All models inherit from `IndexedTimeStampedModel` which provides:
- `created`: Auto-created timestamp field (indexed)
- `modified`: Auto-modified timestamp field (indexed)
- Abstract base class pattern

**User Model**:
- Custom user model extending AbstractBaseUser and PermissionsMixin
- Email-based authentication (USERNAME_FIELD = "email")
- No separate username field
- Managed by custom UserManager

#### API Architecture

**REST API Design**:
- Django REST Framework for API endpoints
- ViewSet-based routing with DefaultRouter
- DRF Spectacular for OpenAPI/Swagger documentation
- Routes defined in separate `routes.py` files per app
- Centralized router registration in main `urls.py`

**API Structure**:
```
/api/                          # REST API root
  /users/                      # User endpoints
  /schema/                     # OpenAPI schema
  /schema/swagger-ui/          # Swagger UI
  /schema/redoc/               # ReDoc UI
/admin/                        # Django admin
/admin/defender/               # Login protection admin
```

#### Authentication & Security

**Session-Based Authentication**:
- Django session authentication (not JWT)
- 4-hour session timeout
- CSRF protection for all state-changing operations
- Django Defender for brute-force login protection
- Content Security Policy (CSP) middleware
- Permissions Policy middleware

**Security Middleware Stack**:
1. GZipMiddleware (compression)
2. SecurityMiddleware (security headers)
3. PermissionsPolicyMiddleware (permissions policy)
4. WhiteNoiseMiddleware (static file serving)
5. SessionMiddleware (session management)
6. CommonMiddleware (common processing)
7. CsrfViewMiddleware (CSRF protection)
8. AuthenticationMiddleware (user authentication)
9. MessageMiddleware (message framework)
10. XFrameOptionsMiddleware (clickjacking protection)
11. CSPMiddleware (content security policy)
12. FailedLoginMiddleware (login protection)
13. GUIDMiddleware (request tracking)

#### Asynchronous Task Processing

**Celery Configuration**:
- RabbitMQ as message broker
- Redis as result backend
- Separate Celery worker service
- Celery Beat for scheduled tasks
- Task definitions in `tasks.py` files

### Frontend Architecture

#### React Application Structure

**Component Organization**:
- Pages: Top-level route components
- Components: Reusable UI components
- Routes: Routing configuration
- Loaders: Data fetching for routes
- API: Generated API client from OpenAPI spec
- Utils: Utility functions
- Types: TypeScript type definitions
- Constants: Application constants

#### Routing Strategy

**React Router 7**:
- Browser-based routing (createBrowserRouter)
- Route loaders for data fetching
- Type-safe navigation utilities
- Nested routing support

**Current Routes**:
- `/` - Home page
- `/users` - Users listing (with loader)

#### State Management

**Current Approach**:
- React Router loaders for server state
- Local component state with useState
- No global state management library (yet)
- Future: Consider React Query for server state

#### API Communication

**API Client**:
- Generated from OpenAPI specification
- Type-safe API methods
- Automatic CSRF token injection via interceptor
- Cookie-based session management
- Axios as HTTP client

**CSRF Token Handling**:
```typescript
OpenAPI.interceptors.request.use((request) => {
  const { csrftoken } = cookie.parse(document.cookie);
  if (request.headers && csrftoken) {
    request.headers["X-CSRFTOKEN"] = csrftoken;
  }
  return request;
});
```

#### Error Handling

**Sentry Integration**:
- Error boundary wrapping entire app
- Automatic error tracking
- User feedback integration
- Performance monitoring

### Data Flow

#### Request Flow (Frontend → Backend)

```
User Action
    ↓
React Component
    ↓
API Client (generated)
    ↓
HTTP Request + CSRF Token
    ↓
Django Middleware Stack
    ↓
URL Router
    ↓
ViewSet/View
    ↓
Serializer Validation
    ↓
Model/Database
    ↓
Serializer Response
    ↓
JSON Response
    ↓
API Client
    ↓
React Component Update
    ↓
UI Re-render
```

#### Background Task Flow

```
API Request (trigger)
    ↓
Django View
    ↓
Celery Task.delay()
    ↓
RabbitMQ (message queue)
    ↓
Celery Worker
    ↓
Task Execution
    ↓
Redis (result storage)
    ↓
Task Completion
    ↓
(Optional) Notification/Callback
```

## Development Environment

### Docker Services

The development environment consists of 8 Docker services:

1. **db**: PostgreSQL 18 database
   - Port: 5432 (internal)
   - Volume: `dbdata` for persistence

2. **pgadmin**: Database management UI
   - Port: 8888 → 80
   - Web UI for database administration

3. **broker**: RabbitMQ message broker
   - Used by Celery for task distribution

4. **result**: Redis cache and result backend
   - Port: 6379
   - Used for caching and Celery results

5. **frontend**: React development server
   - Port: 3000
   - Hot reload enabled
   - Node modules volume

6. **backend**: Django application server
   - Port: 8000
   - Auto-reload enabled
   - Depends on db, broker, result, frontend

7. **celery**: Celery worker
   - Processes background tasks
   - Depends on db, broker, result

8. **mailhog**: Email testing service (development only)
   - SMTP: Port 1025
   - Web UI: Port 8025

### Package Management

**Backend (Python)**:
- **UV**: Modern, fast Python package manager
- Replaces pip/pip-tools/poetry
- Configured in `pyproject.toml`
- Lock file: `uv.lock`

**Frontend (Node.js)**:
- **PNPM 10.18.0**: Fast, disk-efficient package manager
- Lock file: `pnpm-lock.yaml`
- Node version: 20.x

## Configuration Management

### Environment Variables

**Backend** (`backend/.env`):
- `DATABASE_URL`: PostgreSQL connection string
- `DJANGO_SECRET_KEY`: Secret key for cryptographic signing
- `DJANGO_DEBUG`: Debug mode flag
- `DJANGO_ALLOWED_HOSTS`: Allowed host headers
- `CELERY_BROKER_URL`: RabbitMQ connection
- `CELERY_RESULT_BACKEND`: Redis connection
- `SENTRY_DSN`: Sentry error tracking

**Frontend**:
- Configured via webpack DefinePlugin
- API base URL from Django js-reverse

### Settings Organization

Django settings are split by environment:
- `base.py`: Common settings
- `local_base.py`: Local development
- `production.py`: Production deployment
- `test.py`: Testing environment

Environment selection via `DJANGO_SETTINGS_MODULE` environment variable.

## Security Architecture

### Authentication Flow

1. User submits credentials to `/api/auth/login/`
2. Django authenticates and creates session
3. Session cookie returned to browser (HttpOnly, Secure)
4. CSRF token returned in cookie
5. Frontend includes CSRF token in X-CSRFTOKEN header
6. Django validates session and CSRF on each request

### Session Management

- Session timeout: 4 hours of inactivity
- Session stored in database
- HttpOnly cookies (not accessible via JavaScript)
- Secure flag in production (HTTPS only)
- SameSite cookie attribute

### Login Protection

**Django Defender**:
- Monitors failed login attempts
- IP-based and username-based blocking
- Configurable thresholds
- Admin interface for management

### Content Security

- **CSP**: Content Security Policy headers
- **Permissions Policy**: Feature policy headers
- **X-Frame-Options**: Clickjacking protection
- **HTTPS**: Enforced in production
- **HSTS**: HTTP Strict Transport Security

## Database Architecture

### PostgreSQL Configuration

- Version: 18-alpine
- Encoding: UTF-8
- Timezone: UTC
- Connection pooling: pgbouncer (production)

### Migration Strategy

- Django ORM migrations
- Versioned migration files
- Separate migrations per app
- Production migration workflow:
  1. Test migrations in staging
  2. Backup production database
  3. Apply migrations during maintenance window
  4. Verify data integrity

### Data Modeling Principles

1. **Timestamps**: All models have created/modified fields
2. **Indexing**: Strategic indexes on foreign keys and query fields
3. **Soft Deletes**: Consider soft deletes for audit trail
4. **Normalization**: Follow 3NF with pragmatic denormalization
5. **Constraints**: Use database constraints for data integrity

## Deployment Architecture

### Production Stack (Planned)

```
┌─────────────────┐
│   CDN/Cache     │
│   (CloudFlare)  │
└────────┬────────┘
         │
┌────────▼────────┐
│  Load Balancer  │
│   (nginx/ALB)   │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼────┐
│Django │ │Django │
│ App   │ │ App   │
│Server │ │Server │
└───┬───┘ └──┬────┘
    │        │
    └────┬───┘
         │
    ┌────▼────┐
    │PostgreSQL│
    │  (RDS)   │
    └─────────┘
```

### Scaling Considerations

**Horizontal Scaling**:
- Stateless application servers
- Load balancing across multiple instances
- Session storage in database (shared across instances)
- Static files served from CDN

**Vertical Scaling**:
- Database: Increase compute/memory
- Cache: Increase Redis memory
- Workers: Increase Celery worker processes

**Caching Strategy**:
- Redis for session storage
- Database query caching
- Template fragment caching
- API response caching (per endpoint)

## Monitoring & Observability

### Error Tracking

**Sentry**:
- Backend: Python SDK integration
- Frontend: React SDK integration
- Error grouping and deduplication
- Release tracking
- Performance monitoring

### Logging

**Django Logging**:
- Request ID tracking (django-guid)
- Structured logging (JSON format)
- Log levels: DEBUG, INFO, WARNING, ERROR, CRITICAL
- Separate logs for:
  - Application
  - Django
  - Celery
  - Security events

**Log Aggregation** (Planned):
- CloudWatch Logs or equivalent
- Log retention policies
- Alerting on error patterns

### Performance Monitoring

**Metrics to Track**:
- Request latency (p50, p95, p99)
- Database query performance
- Cache hit rates
- Celery task completion times
- Frontend page load times
- API endpoint response times

## API Documentation

### OpenAPI/Swagger

**DRF Spectacular**:
- Automatic schema generation from ViewSets
- Swagger UI at `/api/schema/swagger-ui/`
- ReDoc UI at `/api/schema/redoc/`
- OpenAPI 3.0 schema at `/api/schema/`
- Frontend API client generated from schema

### API Versioning

**Current Strategy**:
- No versioning yet (MVP phase)
- Future: URL-based versioning (`/api/v1/`, `/api/v2/`)
- Maintain backward compatibility where possible

## Testing Strategy

### Backend Testing

**Test Types**:
- Unit tests: Model logic, utilities
- Integration tests: API endpoints, views
- End-to-end tests: Critical user flows

**Test Framework**:
- Django TestCase
- Model Baker for fixtures
- Coverage.py for code coverage

### Frontend Testing

**Test Types**:
- Component tests: React Testing Library
- Integration tests: User interaction flows
- End-to-end tests: Cypress (planned)

**Test Framework**:
- Jest test runner
- React Testing Library
- Testing Library User Event

### CI/CD Pipeline

**GitHub Actions**:
- Run tests on pull requests
- Lint code (Ruff, ESLint)
- Type checking (mypy, TypeScript)
- Build Docker images
- Deploy to staging/production

## Future Architectural Considerations

### Potential Enhancements

1. **API Gateway**: Kong or AWS API Gateway for advanced routing
2. **GraphQL**: Consider GraphQL for complex data fetching
3. **WebSockets**: Real-time notifications (Django Channels)
4. **Microservices**: Split into services if complexity grows
5. **Event Sourcing**: Audit trail and event-driven architecture
6. **CQRS**: Separate read/write models for complex domains

### Scalability Roadmap

1. **Phase 1 (Current)**: Monolithic Django + React
2. **Phase 2**: Add caching, optimize database queries
3. **Phase 3**: Horizontal scaling with load balancer
4. **Phase 4**: Separate services (if needed)
5. **Phase 5**: Microservices architecture (if justified)

## References

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Celery Documentation](https://docs.celeryq.dev/)

## Change Log

| Date | Version | Changes | Author | 
|------|---------|---------|--------|
| 2024-10-27 | 1.0 | Initial architecture documentation | AI Assistant |
