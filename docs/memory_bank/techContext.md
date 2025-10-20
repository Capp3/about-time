# About Time - Technical Context

## Technology Stack

### Frontend
- React 18.3.1
- TypeScript 5.4.5
- Webpack 5.91.0 (build tool)

### Backend
- Python >=3.12
- Django >=5.2
- PostgreSQL >=18
- Celery >=5.3.6
- Redis (for Celery message broker)
- Docker

## Project Structure

```text
about-time/
├── backend/                    # Django backend
│   ├── common/                # Shared Django app
│   ├── users/                 # User management app
│   ├── project_name/          # Main Django project
│   ├── templates/             # Django templates
│   ├── manage.py
│   └── Dockerfile
├── frontend/                   # React frontend
│   ├── js/                    # React components and logic
│   ├── css/                   # Stylesheets
│   ├── assets/                # Static assets
│   └── Dockerfile
├── docs/                      # Documentation
├── docker-compose.yml         # Development environment
├── package.json               # Node.js dependencies
├── pyproject.toml             # Python dependencies
└── README.md
```

## Authentication Flow

- Django session-based authentication with CSRF protection
- SPA-compatible authentication flow
- Session timeout: 4 hours of inactivity
- Password complexity: Minimum 8 characters with letters and numbers

## Data Models

### Core Models
1. **User/Employee**
   - Extended Django User model with OneToOne relationship
   - Fields for contact information, time balances, and role

2. **TimeclockEntry**
   - Fields for date, start time, end time, break minutes, status
   - Calculated fields for total hours and OT hours

3. **Request**
   - Fields for request type (Holiday/Leave/TOIL), start/end dates, duration
   - Status tracking (Pending/Approved/Rejected/Cancelled)

4. **BalanceAdjustment**
   - Audit trail for ad-hoc balance adjustments by managers
   - Fields for adjustment type, amount, reason, and manager

5. **SystemSettings**
   - Singleton model for system-wide settings
   - OT calculation settings, timezone, pay period settings

6. **Notification**
   - In-app notification system
   - Fields for recipient, message, related object, read status

7. **AuditLog**
   - Comprehensive audit trail for compliance
   - Tracks changes to entries, requests, balances, settings, user roles

## Development Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React/TS)    │◄──►│   (Django)      │◄──►│   (PostgreSQL)  │
│   Port: 3000    │    │   Port: 8000    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Redis         │
                       │   (Celery)      │
                       │   Port: 6379    │
                       └─────────────────┘
```

## Technical Constraints

- Modern evergreen browser support (Chrome, Firefox, Safari, Edge - last 2 versions)
- Single PostgreSQL instance (sufficient for MVP user count)
- Single timezone operation (manual handling if needed)
- OT settings changes apply only to new entries (not retroactive)
- Timeclock entries cannot span midnight (hard block enforced)
- Soft-delete for employees (set is_active=False to preserve audit trail)

## Future Technical Considerations (Post-MVP)

- Email/SMS notification integration
- Mobile application support
- Multiple timezone handling
- Employment status tracking
- Settings version history
- Auto-approval workflows
- Automated holiday accrual calculation
