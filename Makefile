.PHONY: build clean lint docker-build docker-build-simple-email docker-build-send-email-link docker-push docker-push-simple-email docker-push-send-email-link

REGISTRY := ghcr.io/constructive-io/constructive-functions

build:
	pnpm run build

clean:
	pnpm run clean

lint:
	pnpm run lint

docker-build:
	@echo "Building Docker images for functions..."
	@for fn in functions/*; do \
		if [ -f "$$fn/Dockerfile" ]; then \
			echo "Building $$fn..."; \
			docker build -t "$(REGISTRY)/$$(basename $$fn):latest" "$$fn"; \
		fi \
	done

docker-build-simple-email:
	docker build -t $(REGISTRY)/simple-email:latest functions/simple-email

docker-build-send-email-link:
	docker build -t $(REGISTRY)/send-email-link:latest functions/send-email-link

docker-push:
	@echo "Pushing Docker images to $(REGISTRY)..."
	@for fn in functions/*; do \
		if [ -f "$$fn/Dockerfile" ]; then \
			echo "Pushing $$fn..."; \
			docker push "$(REGISTRY)/$$(basename $$fn):latest"; \
		fi \
	done

docker-push-simple-email:
	docker push $(REGISTRY)/simple-email:latest

docker-push-send-email-link:
	docker push $(REGISTRY)/send-email-link:latest
