#!/bin/bash
set -e

echo "=== Starting entrypoint script ==="

# Ensure we're in the app directory
cd /home/user/app

# Check if venv exists and is functional (volume mount may have removed/emptied it)
NEED_INSTALL=false
if [ ! -d ".venv" ]; then
    echo "Virtual environment not found, creating..."
    uv venv
    NEED_INSTALL=true
elif [ ! -f ".venv/bin/python" ] || [ ! -f ".venv/bin/gunicorn" ]; then
    echo "Virtual environment exists but appears incomplete, reinstalling..."
    rm -rf .venv
    uv venv
    NEED_INSTALL=true
fi

if [ "$NEED_INSTALL" = true ]; then
    echo "Installing dependencies..."
    cd /home/user/app
    uv pip install --python .venv/bin/python "Django>=5.0,<6.0" \
        "celery[redis]>=5.3.6,<6.0" \
        "celery-redbeat>=2.1.1,<3.0" \
        "django-model-utils>=4.3.1,<5.0" \
        "django-webpack-loader>=3.1.0,<4.0" \
        "django-js-reverse>=0.10.2,<1.0" \
        "django-import-export>=3.3.5,<4.0" \
        "djangorestframework>=3.14.0,<4.0" \
        "python-decouple>=3.8,<4.0" \
        "psycopg>=3.1.19,<4.0" \
        "brotlipy>=0.7.0,<1.0" \
        "django-log-request-id>=2.1.0,<3.0" \
        "dj-database-url>=2.1.0,<3.0" \
        "gunicorn>=21.2.0,<22.0" \
        "whitenoise>=6.6.0,<7.0" \
        "ipython>=8.18.1,<9.0" \
        "sentry-sdk>=1.39.1,<2.0" \
        "setuptools>=69.0.2,<70.0" \
        "django-permissions-policy>=4.18.0,<5.0" \
        "django-csp>=3.7,<4.0" \
        "django-defender>=0.9.7,<1.0" \
        "django-guid>=3.4.0,<4.0" \
        "drf-spectacular>=0.27.2,<1.0"
fi

echo "Virtual environment ready at: .venv"

# Verify gunicorn exists before proceeding
if [ ! -f "/home/user/app/.venv/bin/gunicorn" ]; then
    echo "ERROR: gunicorn not found in venv, this should not happen!"
    ls -la /home/user/app/.venv/bin/ || echo "venv/bin directory does not exist"
    exit 1
fi

# Activate virtual environment by setting PATH
export PATH="/home/user/app/.venv/bin:$PATH"
export VIRTUAL_ENV="/home/user/app/.venv"

# Verify PATH is set correctly
echo "PATH: $PATH"
echo "Checking gunicorn location:"
which gunicorn || echo "WARNING: gunicorn not found in PATH"

# Go to backend directory
cd /home/user/app/backend

echo "=== Ready to execute command: $@ ==="

# Execute the command passed to docker run
exec "$@"
