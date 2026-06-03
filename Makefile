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

.PHONY: help up down

help: ## Show available commands
	@echo "Available targets:"
	@fgrep -h "##" $(MAKEFILE_LIST) | grep -v fgrep | sed -e 's/\([^:]*\):[^#]*##\(.*\)/  \1|\2/' | column -t -s '|'

up: ## Start Docker services
	@echo "[up] Starting services..."
	@docker compose up -d
	@echo "[up] Services running"

down: ## Stop Docker services
	@echo "[down] Stopping services..."
	@docker compose down
	@echo "[down] Services stopped"
