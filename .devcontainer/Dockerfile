# Use Python 3.12-bookworm as base image
FROM python:3.12-bookworm

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update && apt-get install -y \
    # Git and version control
    git \
    # Development tools
    curl \
    wget \
    vim \
    nano \
    make \
    # PostgreSQL client tools
    postgresql-client \
    # Build tools
    build-essential \
    # Cleanup
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user
ARG USERNAME=vscode
ARG USER_UID=1000
ARG USER_GID=$USER_UID

RUN groupadd --gid $USER_GID $USERNAME \
    && useradd --uid $USER_UID --gid $USER_GID -m $USERNAME
# Note: Docker group membership handled by DinD feature

# Install Python development tools as root
RUN pip install --no-cache-dir \
    # Django and related packages
    django \
    djangorestframework \
    django-cors-headers \
    django-environ \
    # Database drivers
    psycopg2-binary \
    # Celery
    celery[redis] \
    # Redis
    redis \
    # Development tools
    ipython \
    ruff \
    pytest \
    pytest-django \
    # Type checking
    basedpyright \
    # Debugging
    debugpy

# Set working directory
WORKDIR /workspace

# Install UV (fast Python package installer) for the non-root user
USER $USERNAME
RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/home/$USERNAME/.cargo/bin:$PATH"

# Note: Ports are forwarded via VS Code devcontainer port forwarding
# No need to expose ports in Dockerfile for DinD setup
