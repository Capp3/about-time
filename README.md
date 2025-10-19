# Rota Robin

A timekeeping and time-off management system for business units, built with React and Django.

## 📋 Project Status

**Current Phase**: MVP Backend & API Setup  
**Focus**: Minimal Django backend with session auth, Postgres, and React frontend integration

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js (for frontend)
- Python 3.12+ (managed by uv)

### Development Setup

1. **Clone and setup**

   ```bash
   git clone <YOUR_GIT_URL>
   cd rota-round
   ```

2. **Start backend services**

   ```bash
   cd backend
   docker compose up -d
   ```

3. **Start frontend**

   ```bash
   npm install
   npm run dev  # Vite on http://localhost:8080
   ```

4. **View docs locally**
   ```bash
   uv add --group dev mkdocs mkdocstrings[python]
   uv run mkdocs serve --config-file mkdocs.yml --dev-addr 127.0.0.1:9000
   ```

## 📚 Documentation

- **[📖 Full Documentation](https://capp3.github.io/rota-round/)** - Published docs
- **[🏗️ Architecture](docs/architecture.md)** - System overview and decisions
- **[⚙️ Development Guide](docs/development.md)** - Setup and workflows
- **[🔧 Technical Decisions](docs/technical.md)** - Standards and conventions
- **[🔒 CSRF/CORS Guide](docs/csrf-cors.md)** - Session auth configuration
- **[📋 Product Requirements](docs/prd.md)** - Complete specification

## 🛠️ Technology Stack

### Frontend

- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS + shadcn/ui
- React Router DOM, TanStack Query

### Backend

- Django 5.2+ (session auth)
- PostgreSQL 18
- Redis (cache/queue)
- Celery (background tasks)
- uv (Python package manager)

### Infrastructure

- Docker & Docker Compose
- GitHub Actions (CI/CD)
- GitHub Pages (docs)
- Dependabot (dependency updates)

## 🔧 Services (Development)



## 📁 Project Structure



## 🎯 MVP Scope

- Employee timeclock entry and approval
- Holiday/Leave/TOIL request management
- Manager dashboard and employee management
- Time balance tracking
- Django session authentication
- PostgreSQL database

## 🤝 Contributing

1. Follow the [Development Guide](docs/development.md)
2. Update documentation for any changes
3. Use `uv` for Python dependencies
4. Keep backend changes minimal for MVP

## 📄 License

GNU v3
