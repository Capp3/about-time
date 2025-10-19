# About Time — Project Brief

## Overview

About Time is a professional timekeeping and time‑off management system for a single business unit. It supports 20–30 employees with 3–5 concurrent users, providing employee timeclock entry, holiday/leave/TOIL request workflows, balance tracking, approvals, and reporting.

## Objectives

- Deliver a reliable MVP focused on core timekeeping and time‑off management
- Provide distinct Employee and Manager experiences with role‑appropriate permissions
- Ensure accurate OT calculation and balance adjustments with a clear audit trail
- Ship a maintainable React + Django codebase with strong documentation

## Scope (MVP)

- Authentication: Django session‑based auth (SPA with CSRF)
- Timeclock: Create/edit entries, manager approvals, OT calculation rules
- Requests: Holiday/Leave/TOIL submission, approvals, cancellations, balance updates
- Management: Employee management, balance adjustments with audit trail
- Reporting: Timecard and balance reports; CSV import/export
- Settings: Overtime method, thresholds, payout, timezone, pay period

## Out of Scope (MVP)

- Event management, rota/schedule creation, and shift assignment (Phase 2)
- Mobile apps (responsive web only)
- Email/SMS notifications (in‑app only for MVP)
- Multi‑tenant support and custom roles beyond Employee/Manager
- Automated holiday accrual and biometric time clock integration

## Users & Roles

- Employee: Submit and manage own time entries and requests; view balances/history
- Manager: All Employee permissions plus approvals, balance adjustments, settings, and reporting

## Success Criteria

- 100% of time entries submitted through the system; paper/spreadsheets eliminated
- Approvals completed within 7 days; accurate OT and balance calculations
- Page loads under 2s; supports 3–5 concurrent users without degradation

## Technology

- Frontend: React 18.3.1 with TypeScript 5.4.5, Webpack 5.91.0
- Backend: Django 5.2+, PostgreSQL >=18, Redis, Celery >=5.3.6
- Infra: Docker, GitHub Actions, GitHub Pages for docs

## Architecture (Dev)

```text
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

## Milestones (Target 9 weeks)

1. Core infrastructure (auth, base models, DRF foundation)
2. Timeclock functionality (entry, OT calculation, approvals)
3. Request management (Holiday/Leave/TOIL) and balance tracking
4. Reports (timecard, balances), CSV import/export, notifications, settings
5. Testing, polish, and launch

## Risks & Mitigations

- Timezone/OT complexity → Enforce UTC backend; clear settings; thorough validation
- Auth/CSRF friction in SPA → Follow `docs/csrf-cors.md`; test cross‑site cookie flow early
- Scope creep → Strict adherence to MVP; schedule/rota features deferred

## Key Assumptions (MVP)

- Single timezone operation (manual handling if multiple timezones needed)
- All managers have equal permissions (no admin-level distinction in MVP)
- Standard 160 hours/year holiday accrual (customizable per employee by managers)
- Settings changes apply to new entries only (not retroactive)
- Timeclock entries cannot span midnight (single-day entries only)
- Modern evergreen browser support (Chrome, Firefox, Safari, Edge - last 2 versions)
- Single PostgreSQL instance sufficient for 20-30 employees, 3-5 concurrent users

See `docs/prd.md` "Assumptions & Open Questions Register" section for complete list of 27 assumptions and validation requirements.

## References

- Product Requirements: `docs/prd.md` (includes detailed assumptions, validation requirements, and Phase 2 specifications)
- PRD Status: 27 assumptions made, 30 TODOs identified (12 validation required, 11 Phase 2 deferred, 7 design phase)
