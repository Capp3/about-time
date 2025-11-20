#!/bin/bash

# Post-create script for About Time dev container
echo "🚀 Setting up About Time development environment..."

# Debug: Check if workspace is mounted and list contents
echo "🔍 Debugging workspace mount..."
echo "Current directory: $(pwd)"
echo "Workspace contents:"
ls -la /workspace || echo "❌ Cannot access /workspace directory"
echo ""

# Ensure we're in the workspace directory
cd /workspace

# Install UV if not available
echo "🐍 Installing UV package manager..."
if ! command -v uv &> /dev/null; then
    echo "📦 Installing UV..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    source $HOME/.cargo/env
    echo "✅ UV installed successfully"
else
    echo "ℹ️  UV already installed"
fi

# Set up UV virtual environment if it doesn't exist
echo "🐍 Setting up UV virtual environment..."
if [ ! -d ".venv" ]; then
    echo "📦 Creating UV virtual environment..."
    uv venv
    echo "✅ UV virtual environment created"
else
    echo "ℹ️  UV virtual environment already exists"
fi

# Sync dependencies from pyproject.toml
echo "📋 Syncing Python dependencies..."
uv sync
echo "✅ Dependencies synced successfully"

# Install pnpm for Node.js package management
echo "📦 Installing pnpm package manager..."
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm@10.18.0
    echo "✅ pnpm installed successfully"
else
    echo "ℹ️  pnpm already installed"
fi

# Install Node.js dependencies
echo "📋 Installing Node.js dependencies..."
if [ -f "package.json" ]; then
    pnpm install
    echo "✅ Node.js dependencies installed successfully"
else
    echo "⚠️  No package.json found, skipping Node.js dependencies"
fi

# Create useful aliases
echo "🔗 Setting up development aliases..."
cat >> ~/.bashrc << 'EOF'

# About Time Development Aliases
alias dc="docker compose"
alias dcu="docker compose up -d"
alias dcd="docker compose down"
alias dcl="docker compose logs -f"
alias dcb="docker compose build"
alias dce="docker compose exec"

# Django specific aliases
alias dm="python manage.py migrate"
alias dmm="python manage.py makemigrations"
alias dsu="python manage.py createsuperuser"
alias ds="python manage.py shell"
alias dr="python manage.py runserver 0.0.0.0:8000"

# Quick navigation
alias cdbackend="cd /workspace/backend"
alias cdfrontend="cd /workspace/frontend"

# Development shortcuts
alias start-dev="cd /workspace && docker compose up -d && echo 'Services starting...'"
alias stop-dev="cd /workspace && docker compose down && echo 'Services stopped'"
alias logs="docker compose logs -f"

EOF

# Reload bashrc
source ~/.bashrc

echo "✅ Development environment setup complete!"
echo ""
echo "🎯 Quick start commands:"
echo "  • start-dev    - Start all services"
echo "  • stop-dev     - Stop all services"
echo "  • logs         - View service logs"
echo "  • cdbackend    - Navigate to backend"
echo "  • cdfrontend   - Navigate to frontend"
echo ""
echo "📚 Next steps:"
echo "  1. Run 'start-dev' to start the services"
echo "  2. VS Code will forward ports (3000, 8000, 8888)"
echo "  3. Services will be available at:"
echo "     • Frontend:    http://localhost:3000"
echo "     • Django API:  http://localhost:8000"
echo "     • PgAdmin:     http://localhost:8888"
echo ""
echo "🐍 Python environment:"
echo "  • UV virtual environment: .venv/"
echo "  • Activate with: source .venv/bin/activate"
echo "  • Dependencies synced from pyproject.toml"
echo ""
echo "📦 Node.js environment:"
echo "  • Package manager: pnpm"
echo "  • Dependencies installed from package.json"
echo "  • Run with: pnpm dev (frontend) or pnpm build"
echo ""
