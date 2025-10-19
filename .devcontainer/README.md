# Dev Container Setup

This directory contains the configuration for the Rota Round development container.

## What's Included

### TRUE Docker-in-Docker Setup

- **Base Image**: Python 3.12-bookworm
- **Complete Isolation**: Isolated Docker daemon (no socket binding)
- **Network Isolation**: Backend services run in isolated Docker network
- **Non-root user**: Secure development environment

### Pre-installed Tools

- **Python 3.12** with pip
- **Django & DRF** for API development
- **PostgreSQL client** tools
- **Celery & Redis** for background tasks
- **Development tools**: black, flake8, pytest, ipython

### VS Code Extensions

- Python development tools
- Django support
- Docker integration
- Database tools (PostgreSQL)
- Git integration

## Quick Start

1. **Open in Dev Container**:

   - Open VS Code
   - Install "Dev Containers" extension
   - Open command palette (Ctrl+Shift+P)
   - Run "Dev Containers: Reopen in Container"

2. **Start Services**:

   ```bash
   start-dev  # Custom alias to start all services
   ```

3. **Access Services**:
   - **GUI Services** (forwarded): PgAdmin, Frontend
   - **Backend Services** (isolated): Django API, PostgreSQL, Redis
   - Check the "PORTS" tab in VS Code for forwarded URLs
   - PgAdmin: http://localhost:10122 (forwarded from container 8888)
   - Frontend: http://localhost:10123 (forwarded from container 5173 when implemented)
   - Backend services: Only accessible within container network

## Development Aliases

The container includes helpful aliases:

| Alias       | Command                            | Purpose                        |
| ----------- | ---------------------------------- | ------------------------------ |
| `dc`        | `docker compose`                   | Docker Compose shortcut        |
| `dcu`       | `docker compose up -d`             | Start services                 |
| `dcd`       | `docker compose down`              | Stop services                  |
| `dcl`       | `docker compose logs -f`           | View logs                      |
| `dm`        | `python manage.py migrate`         | Django migrations              |
| `dmm`       | `python manage.py makemigrations`  | Create migrations              |
| `dsu`       | `python manage.py createsuperuser` | Create admin user              |
| `start-dev` | Custom                             | Start all development services |
| `stop-dev`  | Custom                             | Stop all development services  |

## Environment Variables

The post-create script automatically creates a `.env` file in the `backend/` directory with development defaults. You can modify this file as needed.

## Port Forwarding

VS Code forwards only GUI services for external access (mapped to avoid host conflicts):

- **10122**: PgAdmin (HTTP) - Database management UI (container port 8888)
- **10123**: Frontend (Vite HTTP) - React development server (container port 5173)

**Backend services remain isolated** (no port forwarding):

- **8000**: Django API - Only accessible within container network
- **5432**: PostgreSQL - Only accessible within container network
- **6379**: Redis - Only accessible within container network

**TRUE Docker-in-Docker**: Complete network isolation with isolated Docker daemon.

## File Structure

```
.devcontainer/
├── Dockerfile                    # Container definition
├── devcontainer.json            # VS Code dev container config
├── post-create.sh               # Setup script
├── docker-compose.override.yml  # Development overrides
└── README.md                    # This file
```

## Troubleshooting

### Container Won't Start

- Ensure Docker Desktop is running
- Check that ports 8000, 5432, 6379, 8888, 5173 are available
- Try rebuilding: "Dev Containers: Rebuild Container"

### Docker-in-Docker Issues

- The container runs TRUE Docker-in-Docker with isolated daemon
- Use `docker compose` commands inside the container
- No Docker socket binding - complete network isolation
- Backend services only accessible within container network

### Permission Issues

- The container runs as a non-root user (`vscode`)
- All necessary permissions are configured automatically

## Customization

### Adding Extensions

Edit `.devcontainer/devcontainer.json` and add to the `extensions` array.

### Adding Tools

Edit `.devcontainer/Dockerfile` and add packages to the appropriate RUN commands.

### Environment Variables

Edit `.devcontainer/post-create.sh` to modify the default `.env` file creation.
