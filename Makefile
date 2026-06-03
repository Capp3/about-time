DETECTED_HOST := $(shell hostname)
HOST ?= $(DETECTED_HOST)
SCRIPTS_DIR := ./scripts
TEMP_DIR := ./temp
USERNAME := $(USER)
SHELL := /bin/bash

.ONESHELL:
.SHELLFLAGS := -e -u -o pipefail -c
.DEFAULT_GOAL := help

ARG := $(word 2, $(MAKECMDGOALS) )

.PHONY: help clean test test-reset format lint \
	install sync setup setup-docker up down restart logs build rebuild \
	shell shell-backend shell-frontend \
	migrate makemigrations schema api serve build-docs deploy-docs \
	update-memory-bank update-rules

help: ## Show available commands
	@echo "Available targets:"
	@fgrep -h "##" $(MAKEFILE_LIST) | grep -v fgrep | sed -e 's/\([^:]*\):[^#]*##\(.*\)/  \1|\2/' | column -t -s '|'

clean: ## Remove Python cache files
	@echo "[clean] Removing Python cache files..."
	@find . -name "*.pyc" -exec rm -rf {} \;
	@find . -name "__pycache__" -delete
	@rm -rf site/ .cache/
	@echo "[clean] Complete"

test: ## Run tests with keepdb
	@echo "[test] Running tests..."
	@uv run backend/manage.py test backend/ $(ARG) --parallel --keepdb

test-reset: ## Run tests with fresh database
	@echo "[test-reset] Running tests with fresh database..."
	@uv run backend/manage.py test backend/ $(ARG) --parallel

format: ## Format Python code with black
	@echo "[format] Formatting Python code..."
	@black backend
	@echo "[format] Complete"

lint: ## Run Python linting
	@echo "[lint] Running linting..."
	@black --check backend
	@echo "[lint] Complete"

setup: ## Setup local development environment
	@echo "[setup] Creating virtual environment..."
	@uv venv
	@echo "[setup] Installing dependencies with all extras..."
	@uv sync --all-extras
	@echo "[setup] Complete"

setup-docker: ## Initial Docker setup
	@echo "[setup-docker] Creating Docker volume..."
	@docker volume create about-time_dbdata
	@echo "[setup-docker] Building containers..."
	@docker compose build --no-cache backend frontend
	@echo "[setup-docker] Generating API schema..."
	@docker compose run --rm backend python manage.py spectacular --color --file schema.yml
	@echo "[setup-docker] Generating TypeScript client..."
	@docker compose run --rm frontend pnpm run openapi-ts
	@echo "[setup-docker] Complete"

up: ## Start Docker services
	@echo "[up] Starting services..."
	@docker compose up -d
	@echo "[up] Services running"

down: ## Stop Docker services
	@echo "[down] Stopping services..."
	@docker compose down
	@echo "[down] Services stopped"

restart: down up ## Restart Docker services

logs: ## View Docker logs (usage: make logs [service])
	@docker compose logs -f $(ARG)

build: ## Rebuild and restart services
	@echo "[build] Rebuilding services..."
	@docker compose down
	@docker compose up -d --build
	@echo "[build] Complete"

rebuild: ## Full rebuild with no cache
	@echo "[rebuild] Full rebuild..."
	@docker compose build --no-cache
	@docker compose up -d
	@echo "[rebuild] Complete"

shell: shell-backend ## Open backend shell (default)

shell-backend: ## Open backend shell
	@echo "[shell] Opening backend shell..."
	@docker compose run --rm backend bash

shell-frontend: ## Open frontend shell
	@echo "[shell] Opening frontend shell..."
	@docker compose run --rm frontend sh

migrate: ## Run Django migrations
	@echo "[migrate] Running migrations..."
	@docker compose run --rm backend python manage.py migrate
	@echo "[migrate] Complete"

makemigrations: ## Create Django migrations
	@echo "[makemigrations] Creating migrations..."
	@docker compose run --rm backend python manage.py makemigrations
	@echo "[makemigrations] Complete"

schema: ## Update API schema
	@echo "[schema] Generating API schema..."
	@docker compose run --rm backend python manage.py spectacular --color --file schema.yml
	@echo "[schema] Complete"

api: schema ## Update TypeScript API client
	@echo "[api] Generating TypeScript client..."
	@docker compose run --rm frontend pnpm run openapi-ts
	@echo "[api] Complete"

install: ## Install uv package manager
	@echo "[install] Installing uv..."
	@curl -LsSf https://astral.sh/uv/install.sh | sh
	@echo "[install] Complete"

sync: ## Sync dependencies with uv
	@echo "[sync] Syncing dependencies..."
	@uv sync --all-extras
	@echo "[sync] Complete"

serve: ## Start MkDocs development server
	@echo "[serve] Starting MkDocs server..."
	@uvx mkdocs serve

build-docs: ## Build MkDocs static site
	@echo "[build-docs] Building documentation..."
	@uvx mkdocs build
	@echo "[build-docs] Complete"

deploy-docs: build-docs ## Build docs for deployment
	@echo "[deploy-docs] Site built in 'site/' directory"

update-memory-bank: ## Update Cursor Memory Bank
	@echo "[update-memory-bank] Updating..."
	@mkdir -p $(TEMP_DIR)
	@if git clone --depth 1 https://github.com/vanzan01/cursor-memory-bank.git $(TEMP_DIR)/cursor-memory-bank 2>/dev/null; then \
		if [ -d "$(TEMP_DIR)/cursor-memory-bank/.cursor/commands" ]; then \
			mkdir -p .cursor/commands; \
			cp -R $(TEMP_DIR)/cursor-memory-bank/.cursor/commands/* .cursor/commands/ && \
			echo "[update-memory-bank] Commands updated"; \
		fi; \
		if [ -d "$(TEMP_DIR)/cursor-memory-bank/.cursor/rules/isolation_rules" ]; then \
			mkdir -p .cursor/rules/isolation_rules; \
			cp -R $(TEMP_DIR)/cursor-memory-bank/.cursor/rules/isolation_rules/* .cursor/rules/isolation_rules/ && \
			echo "[update-memory-bank] Rules updated"; \
		fi; \
		rm -rf $(TEMP_DIR)/cursor-memory-bank; \
		echo "[update-memory-bank] Complete"; \
	else \
		echo "[update-memory-bank] Error: Failed to clone repository"; \
		exit 1; \
	fi

update-rules: ## Update Awesome Cursor Rules
	@echo "[update-rules] Updating..."
	@mkdir -p $(TEMP_DIR)
	@if git clone --depth 1 https://github.com/PatrickJS/awesome-cursorrules.git $(TEMP_DIR)/awesome-cursorrules 2>/dev/null; then \
		if [ -d "$(TEMP_DIR)/awesome-cursorrules/rules-new" ]; then \
			mkdir -p .cursor/rules; \
			cp -R $(TEMP_DIR)/awesome-cursorrules/rules-new/* .cursor/rules/ && \
			echo "[update-rules] Rules updated"; \
		fi; \
		rm -rf $(TEMP_DIR)/awesome-cursorrules; \
		echo "[update-rules] Complete"; \
	else \
		echo "[update-rules] Error: Failed to clone repository"; \
		exit 1; \
	fi
