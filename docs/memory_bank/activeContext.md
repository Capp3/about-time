# About Time - Active Context

## Current Focus

The current focus is on project initialization and establishing the foundation for the About Time application. This includes setting up the Memory Bank structure, reviewing the codebase, and preparing for the implementation of core features.

## Project Status

- **Phase**: Initialization
- **Current Sprint**: Setup and planning
- **Next Milestone**: Core infrastructure (auth, base models, DRF foundation)

## Technical Status

### Frontend
- React 18.3.1 with TypeScript 5.4.5
- Webpack 5.91.0 for building
- Basic directory structure established (js/, css/, assets/)

### Backend
- Django 5.2+ with Python 3.12+
- PostgreSQL 18+ for database
- Celery 5.3.6+ with Redis for async tasks
- Basic directory structure established (common/, users/, project_name/, templates/)

## Key Decisions

1. **Authentication**: Using Django session-based authentication with CSRF protection
2. **Database Models**: Extended Django User model with OneToOne relationship for Employee data
3. **Frontend Structure**: React functional components with TypeScript
4. **API Design**: RESTful API using Django REST Framework
5. **Development Environment**: Docker Compose for local development

## Upcoming Implementation Order

1. **Authentication System**
   - Django user authentication setup
   - Login page implementation
   - CSRF protection for SPA

2. **Core Database Models**
   - User/Employee model
   - TimeclockEntry model
   - Request model
   - Other supporting models

3. **Basic Frontend Structure**
   - Component organization
   - Routing setup
   - API client configuration
   - Authentication flow

4. **Employee Dashboard**
   - Time balances display
   - Quick actions
   - Recent activity

## Current Challenges

- Ensuring proper CSRF/CORS handling for SPA authentication
- Setting up the foundation for the timezone and OT calculation logic
- Planning the database schema to support all MVP requirements

## Open Questions

- Best approach for implementing the calculated fields for OT hours
- Strategy for handling the singleton SystemSettings model
- Most efficient way to implement the approval workflows
