# About Time - UV Package Management Guidelines

This document provides detailed guidelines for using UV as our Python package manager throughout the About Time project. All team members must follow these standards to ensure consistent environments and dependency management.

## What is UV?

UV is a modern Python package manager written in Rust, designed to be significantly faster and more reliable than traditional tools like pip or poetry. Key advantages include:

- **Performance**: Much faster dependency resolution and installation
- **Reliability**: More deterministic builds and fewer dependency conflicts
- **Compatibility**: Works with standard Python packaging tools and formats
- **Lock Files**: Precise dependency pinning for consistent environments

## Installation & Setup

### Installing UV

```bash
# macOS or Linux with curl
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows with PowerShell
irm https://astral.sh/uv/install.ps1 | iex
```

Verify installation:

```bash
uv --version
```

### Project Setup

For new virtual environments:

```bash
# Create a new virtual environment
uv venv

# Activate the environment
# On macOS/Linux:
source .venv/bin/activate
# On Windows:
.venv\Scripts\activate

# Install dependencies from pyproject.toml
uv pip install --editable .
```

## Daily Usage

### Installing Packages

Always use UV for installing packages:

```bash
# Install a single package
uv pip install requests

# Install with specific version
uv pip install django==5.2.1

# Install multiple packages
uv pip install pytest black isort

# Install from requirements.txt
uv pip install -r requirements.txt

# Install from pyproject.toml
uv pip install .
```

### Managing Dependencies

When adding new dependencies:

1. Add to pyproject.toml (preferred) or requirements.txt
2. Use UV to install
3. Update lock files
4. Commit both the dependency file AND the lock file

```bash
# After adding to pyproject.toml
uv pip install .

# Generate/update lock file
uv pip freeze > requirements.txt
# or when using pyproject.toml
uv pip compile pyproject.toml -o requirements.txt
```

### Using Virtual Environments

Always use UV for virtual environment management:

```bash
# Create a new virtual environment
uv venv

# Activate (same as regular venv)
source .venv/bin/activate  # Linux/macOS
.venv\Scripts\activate     # Windows
```

## Project Standards

### Dependency Specification

1. **Version Pinning Required**:

   - All production dependencies MUST have specific versions
   - Example: `django==5.2.1` not `django>=5.2`
   - Dev dependencies may use ranges, but specific pins are preferred

2. **Lock Files**:

   - Lock files MUST be committed to version control
   - NEVER ignore lock files
   - Always update lock files when changing dependencies

3. **Dependency Grouping**:

   - Separate core dependencies from development dependencies
   - In pyproject.toml, use appropriate sections:

     ```toml
     [project]
     # Core dependencies
     dependencies = [
         "django==5.2.1",
         "psycopg2-binary==2.9.9",
     ]

     [project.optional-dependencies]
     # Dev dependencies
     dev = [
         "pytest==7.4.0",
         "black==23.7.0",
     ]
     ```

### Security Practices

1. **Regular Security Scanning**:

   ```bash
   # Install safety
   uv pip install safety

   # Scan for vulnerabilities
   safety check
   ```

2. **Update Process**:

   - Weekly security checks
   - Security updates applied immediately
   - Non-security updates applied according to schedule
   - All updates tested in development before updating production

3. **Dependency Review**:
   - All new dependencies must be reviewed
   - Consider license implications
   - Check for maintenance status and community support
   - Prefer well-established packages with good security records

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Python Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: "3.12"

      - name: Install UV
        run: curl -LsSf https://astral.sh/uv/install.sh | sh

      - name: Install dependencies
        run: |
          uv venv
          source .venv/bin/activate
          uv pip install .
          uv pip install -e ".[dev]"

      - name: Lint with Black
        run: |
          source .venv/bin/activate
          black --check backend

      - name: Test with pytest
        run: |
          source .venv/bin/activate
          pytest
```

### Docker Integration

In Dockerfiles, use UV for faster builds:

```dockerfile
FROM python:3.12-slim

WORKDIR /app

# Install UV
RUN curl -LsSf https://astral.sh/uv/install.sh | sh

# Copy dependency files
COPY pyproject.toml requirements.txt* ./

# Install dependencies
RUN uv venv /venv && \
    . /venv/bin/activate && \
    uv pip install -r requirements.txt

# Copy application code
COPY . .

# Set Python path to use the venv
ENV PATH="/venv/bin:$PATH"

# Run application
CMD ["python", "backend/manage.py", "runserver", "0.0.0.0:8000"]
```

## Common Issues and Solutions

### Lock File Conflicts

If you encounter lock file conflicts during merges:

1. Resolve the conflict in the dependency file first (pyproject.toml)
2. Regenerate the lock file using `uv pip freeze > requirements.txt`
3. Commit the resolved files

### UV Not Finding Packages

If UV can't find a package:

1. Check package name spelling
2. Verify the package exists on PyPI
3. Try with explicit index: `uv pip install package-name --index-url https://pypi.org/simple`

### Virtual Environment Issues

If activating the virtual environment fails:

1. Verify the environment exists: `ls -la .venv`
2. Try recreating: `rm -rf .venv && uv venv`
3. Check for permission issues: `chmod -R +x .venv/bin` (Linux/macOS)

## Resources

- [UV Documentation](https://github.com/astral-sh/uv)
- [UV vs. Other Package Managers](https://astral.sh/blog/uv)
- [Python Packaging User Guide](https://packaging.python.org/en/latest/)

## Updating These Guidelines

These guidelines should be reviewed quarterly and updated as needed. All updates must be approved and communicated to the team.
