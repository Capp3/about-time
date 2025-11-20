FROM python:3.12-slim

ENV PYTHONFAULTHANDLER=1 \
  PYTHONUNBUFFERED=1 \
  PYTHONHASHSEED=random \
  PIP_NO_CACHE_DIR=off \
  PIP_DISABLE_PIP_VERSION_CHECK=on \
  PIP_DEFAULT_TIMEOUT=100

RUN groupadd user && useradd --create-home --home-dir /home/user -g user user

# Install system dependencies
RUN apt-get update && apt-get install python3-dev gcc build-essential libpq-dev -y

# install python dependencies
RUN pip install uv

WORKDIR /home/user/app/

# Create venv
RUN uv venv

# Set virtual environment path
ENV VIRTUAL_ENV=/home/user/app/.venv
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Copy pyproject.toml and README.md
COPY pyproject.toml README.md /tmp/

# Install dependencies only (skip building local package)
WORKDIR /tmp
RUN uv pip install "Django>=5.0,<6.0" \
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

WORKDIR /home/user/app/

WORKDIR /home/user/app/backend
COPY backend/ /home/user/app/backend

# Copy entrypoint script
COPY backend/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

USER user
ENTRYPOINT ["/entrypoint.sh"]
CMD ["gunicorn", "project_name.wsgi", "--log-file", "-", "-b", "0.0.0.0:8000", "--reload"]
