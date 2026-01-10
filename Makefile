.PHONY: help setup backend frontend docker-up docker-down clean

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

setup: ## Initial setup - install dependencies
	@echo "Setting up project..."
	cd backend && go mod download
	cd frontend && npm install
	@echo "Setup complete!"

docker-up: ## Start Docker services (PostgreSQL, Redis)
	docker-compose up -d
	@echo "Docker services started!"

docker-down: ## Stop Docker services
	docker-compose down
	@echo "Docker services stopped!"

docker-logs: ## View Docker logs
	docker-compose logs -f

backend: ## Run backend server
	cd backend && go run cmd/server/main.go

frontend: ## Run frontend server
	cd frontend && npm run dev

clean: ## Clean build artifacts
	cd backend && go clean
	cd frontend && rm -rf .next node_modules
	@echo "Clean complete!"

reset-db: ## Reset database (WARNING: deletes all data)
	docker-compose down -v
	docker-compose up -d
	@echo "Database reset complete!"
