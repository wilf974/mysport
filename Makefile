.PHONY: help install build up down logs restart clean deploy

# Colors
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m # No Color

help:
	@echo "$(BLUE)╔════════════════════════════════════╗$(NC)"
	@echo "$(BLUE)║     MySport Docker Commands         ║$(NC)"
	@echo "$(BLUE)╚════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(GREEN)Installation:$(NC)"
	@echo "  $(YELLOW)make install$(NC)        - Install dependencies & build"
	@echo "  $(YELLOW)make deploy$(NC)         - Full VPS deployment"
	@echo ""
	@echo "$(GREEN)Development:$(NC)"
	@echo "  $(YELLOW)make build$(NC)          - Build Docker images"
	@echo "  $(YELLOW)make up$(NC)             - Start all containers"
	@echo "  $(YELLOW)make down$(NC)           - Stop all containers"
	@echo "  $(YELLOW)make restart$(NC)        - Restart all containers"
	@echo "  $(YELLOW)make logs$(NC)           - Show all logs (follow)"
	@echo ""
	@echo "$(GREEN)Monitoring:$(NC)"
	@echo "  $(YELLOW)make logs-backend$(NC)   - Show backend logs"
	@echo "  $(YELLOW)make logs-frontend$(NC)  - Show frontend logs"
	@echo "  $(YELLOW)make logs-nginx$(NC)     - Show nginx logs"
	@echo "  $(YELLOW)make ps$(NC)             - Show running containers"
	@echo "  $(YELLOW)make stats$(NC)          - Show container stats"
	@echo ""
	@echo "$(GREEN)Database:$(NC)"
	@echo "  $(YELLOW)make seed$(NC)           - Seed database with test data"
	@echo "  $(YELLOW)make backup$(NC)         - Backup database"
	@echo "  $(YELLOW)make restore$(NC)        - Restore from backup"
	@echo ""
	@echo "$(GREEN)Maintenance:$(NC)"
	@echo "  $(YELLOW)make clean$(NC)          - Remove containers & volumes"
	@echo "  $(YELLOW)make update$(NC)         - Pull latest code & rebuild"
	@echo "  $(YELLOW)make ssl-renew$(NC)      - Renew SSL certificate"
	@echo "  $(YELLOW)make ssl-status$(NC)     - Check SSL certificate status"
	@echo ""
	@echo "$(GREEN)Testing:$(NC)"
	@echo "  $(YELLOW)make test-frontend$(NC)  - Test application frontend"
	@echo "  $(YELLOW)make test-backend$(NC)   - Test API endpoints"
	@echo "  $(YELLOW)make test-ssl$(NC)       - Test SSL/TLS configuration"
	@echo ""

install: build up seed
	@echo "$(GREEN)✅ Installation completed!$(NC)"

deploy:
	@echo "$(BLUE)🚀 Starting VPS deployment...$(NC)"
	sudo chmod +x docker-deploy.sh
	sudo ./docker-deploy.sh

build:
	@echo "$(BLUE)🔨 Building Docker images...$(NC)"
	docker-compose build --no-cache

up:
	@echo "$(BLUE)🚀 Starting containers...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)✅ Containers started$(NC)"

down:
	@echo "$(YELLOW)⛔ Stopping containers...$(NC)"
	docker-compose down

restart:
	@echo "$(YELLOW)🔄 Restarting containers...$(NC)"
	docker-compose restart
	@echo "$(GREEN)✅ Containers restarted$(NC)"

logs:
	@echo "$(BLUE)📋 Showing all logs...$(NC)"
	docker-compose logs -f

logs-backend:
	@echo "$(BLUE)📋 Showing backend logs...$(NC)"
	docker-compose logs -f backend

logs-frontend:
	@echo "$(BLUE)📋 Showing frontend logs...$(NC)"
	docker-compose logs -f frontend

logs-nginx:
	@echo "$(BLUE)📋 Showing nginx logs...$(NC)"
	docker-compose logs -f nginx

ps:
	@echo "$(BLUE)📊 Container status:$(NC)"
	docker-compose ps

stats:
	@echo "$(BLUE)📊 Container stats:$(NC)"
	docker stats --no-stream

seed:
	@echo "$(BLUE)🌱 Seeding database...$(NC)"
	docker-compose exec -T backend npm run seed
	@echo "$(GREEN)✅ Database seeded$(NC)"

backup:
	@echo "$(BLUE)💾 Backing up database...$(NC)"
	@mkdir -p backups
	@docker-compose exec -T backend cp /app/mysport.db /tmp/backup.db
	@docker cp mysport-backend:/tmp/backup.db ./backups/mysport-backup-$$(date +%Y%m%d-%H%M%S).db
	@echo "$(GREEN)✅ Database backed up$(NC)"

restore:
	@echo "$(RED)⚠️  This will overwrite your database!$(NC)"
	@read -p "Enter backup file path: " backup_file; \
	if [ -f "$$backup_file" ]; then \
		docker cp $$backup_file mysport-backend:/app/mysport.db; \
		docker-compose restart backend; \
		echo "$(GREEN)✅ Database restored$(NC)"; \
	else \
		echo "$(RED)❌ File not found$(NC)"; \
	fi

clean:
	@echo "$(RED)🗑️  Removing containers and volumes...$(NC)"
	docker-compose down -v
	@echo "$(GREEN)✅ Cleanup completed$(NC)"

update:
	@echo "$(BLUE)🔄 Updating application...$(NC)"
	git pull origin claude/workout-planner-app-013kA8V9MD5VBUb7SYSb2NBx
	docker-compose build --no-cache
	docker-compose up -d
	@echo "$(GREEN)✅ Application updated$(NC)"

ssl-renew:
	@echo "$(BLUE)🔒 Renewing SSL certificate...$(NC)"
	./renew-ssl.sh
	@echo "$(GREEN)✅ SSL certificate renewed$(NC)"

ssl-status:
	@echo "$(BLUE)🔒 SSL certificate status:$(NC)"
	certbot certificates

test-frontend:
	@echo "$(BLUE)🧪 Testing frontend...$(NC)"
	@curl -I https://mysport.woutils.com/
	@echo "$(GREEN)✅ Frontend responding$(NC)"

test-backend:
	@echo "$(BLUE)🧪 Testing backend API...$(NC)"
	@curl -I https://mysport.woutils.com/api/exercises/1
	@echo "$(GREEN)✅ API responding$(NC)"

test-ssl:
	@echo "$(BLUE)🧪 Testing SSL/TLS...$(NC)"
	@openssl s_client -connect mysport.woutils.com:443 </dev/null 2>/dev/null | grep -A 2 "subject="
	@echo "$(GREEN)✅ SSL/TLS verified$(NC)"

.DEFAULT_GOAL := help
