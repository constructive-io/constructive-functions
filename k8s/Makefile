KUBECTL ?= kubectl
K8S_DIR ?= $(CURDIR)
BASE_DIR ?= $(K8S_DIR)/base
CNPG_DIR ?= $(BASE_DIR)/cnpg
CONSTRUCTIVE_DIR ?= $(BASE_DIR)/constructive
FUNCTIONS_DIR ?= $(BASE_DIR)/functions
CONSTRUCTIVE_NS ?= interweb
DOMAIN ?= web.interweb.launchql.dev
DB_NS ?= postgres-db
CLIENT_DIR ?= $(abspath $(K8S_DIR)/../packages/client)
PF_DIR ?= $(K8S_DIR)/.pf

ifneq (,$(wildcard ./.env))
	include .env
	export
endif

.PHONY: setup install-pg teardown uninstall-pg check-crds

setup:
	pnpm --prefix $(CLIENT_DIR) run operators:setup

teardown:
	pnpm --prefix $(CLIENT_DIR) run operators:teardown

install-pg:
	$(KUBECTL) apply -f $(CNPG_DIR)/namespace.yaml
	$(KUBECTL) apply -f $(CNPG_DIR)/secret.yaml
	$(KUBECTL) apply -f $(CNPG_DIR)/cnpg-cluster.yaml

uninstall-pg:
	$(KUBECTL) delete -f $(CNPG_DIR)/cnpg-cluster.yaml --ignore-not-found --force
	$(KUBECTL) delete -f $(CNPG_DIR)/secret.yaml --ignore-not-found --force
	$(KUBECTL) delete -f $(CNPG_DIR)/namespace.yaml --ignore-not-found --force

.PHONY: operators-knative-only

# Install only Knative Serving + Kourier (no CNPG) for local/CI use.
operators-knative-only:
	@echo "Running k8s/scripts/setup/Makefile operators-knative-only..."
	$(MAKE) -C $(K8S_DIR)/scripts/setup operators-knative-only

check-crds:
	@echo "CloudNativePG CRDs" && \
	$(KUBECTL) get crd | grep postgresql.cnpg.io || echo "\t(none found)";

######## Kustomize-based deployments ########

.PHONY: kustomize-dev kustomize-staging render-dev render-staging

# Apply the full stack to the current context using the dev overlay.
# Use this against your dev cluster/context.
kustomize-dev:
	$(KUBECTL) apply -n $(CONSTRUCTIVE_NS) -k $(K8S_DIR)/overlays/dev

# Apply the full stack to the current context using the staging overlay.
# Use this against your staging cluster/context.
kustomize-staging:
	$(KUBECTL) apply -n $(CONSTRUCTIVE_NS) -k $(K8S_DIR)/overlays/staging

# Render overlays to single YAML files (no apply).
# Rendered manifests go under k8s/manifests, which is gitignored because
# rendered output may contain Secret objects.
MANIFESTS_DIR ?= $(K8S_DIR)/manifests

render-dev:
	mkdir -p $(MANIFESTS_DIR)
	kubectl kustomize $(K8S_DIR)/overlays/dev > $(MANIFESTS_DIR)/interweb-dev.yaml

render-staging:
	mkdir -p $(MANIFESTS_DIR)
	kubectl kustomize $(K8S_DIR)/overlays/staging > $(MANIFESTS_DIR)/interweb-staging.yaml

.PHONY: kustomize-local kustomize-local-delete render-local

# Local overlay for a kind/minikube-style cluster.
kustomize-local:
	$(KUBECTL) kustomize $(K8S_DIR)/overlays/local --load-restrictor=LoadRestrictionsNone | $(KUBECTL) apply -f -

# Delete the local namespace and all its resources from the current context.
# This is intended for local/kind/minikube clusters only.
kustomize-local-delete:
	$(KUBECTL) kustomize $(K8S_DIR)/overlays/local --load-restrictor=LoadRestrictionsNone | $(KUBECTL) delete -f - --ignore-not-found=true

# Render local overlay to a single YAML file.
render-local:
	mkdir -p $(MANIFESTS_DIR)
	$(KUBECTL) kustomize $(K8S_DIR)/overlays/local --load-restrictor=LoadRestrictionsNone > $(MANIFESTS_DIR)/interweb-local.yaml

render-ci:
	mkdir -p $(MANIFESTS_DIR)
	$(KUBECTL) kustomize $(K8S_DIR)/overlays/ci --load-restrictor=LoadRestrictionsNone > $(MANIFESTS_DIR)/interweb-ci.yaml

render-all: render-local render-ci render-dev render-staging

k8s-pull-secret:
	@echo "Create GHCR pull secret ghcr-pull in default namespace"; \
	if [ -z "$(GH_USERNAME)" ] || [ -z "$(GH_PAT_TOKEN)" ]; then \
		echo "Set GH_USERNAME and GH_PAT_TOKEN env vars (and optional GH_EMAIL)"; \
		exit 1; \
	fi; \
	$(KUBECTL) -n default create secret docker-registry ghcr-pull \
		--docker-server=ghcr.io \
		--docker-username=$(GH_USERNAME) \
		--docker-password=$(GH_PAT_TOKEN) \
		--docker-email=$(GH_EMAIL)

# Diagnose TLS/ACME for Ingress and cert-manager
.PHONY: tls-diagnose
tls-diagnose:
	@NS=$(CONSTRUCTIVE_NS) \
	ING=interweb-ingress \
	DOMAIN=$(DOMAIN) \
	bash $(K8S_DIR)/scripts/diag-tls.sh

######## Local port-forwards (run in separate terminals; Ctrl+C to stop) ########

.PHONY: proxy-server proxy-explorer proxy-web proxy-db proxy-all proxy-stop

# Constructive Server -> localhost:8080 -> service/constructive-server:3000
proxy-server:
	@echo "Forwarding constructive-server to http://localhost:8080 (namespace $(CONSTRUCTIVE_NS))"; \
	$(KUBECTL) -n $(CONSTRUCTIVE_NS) port-forward svc/constructive-server 8080:3000

# Explorer -> localhost:8081 -> service/constructive-server:3001
proxy-explorer:
	@echo "Forwarding explorer (via constructive-server) to http://localhost:8081 (namespace $(CONSTRUCTIVE_NS))"; \
	$(KUBECTL) -n $(CONSTRUCTIVE_NS) port-forward svc/constructive-server 8081:3001

# Dashboard -> localhost:3000 -> service/dashboard:3000
proxy-web:
	@echo "Forwarding dashboard to http://localhost:3000 (namespace $(CONSTRUCTIVE_NS))"; \
	$(KUBECTL) -n $(CONSTRUCTIVE_NS) port-forward svc/dashboard 3000:3000

# Proxy all core services using the helper script:
# - dashboard → localhost:3000
# - pgadmin   → localhost:3001
# - server    → localhost:8080
# - explorer  → localhost:8081
proxy-all:
	@echo "Starting port-forwards for server, explorer, dashboard and pgadmin (namespace $(CONSTRUCTIVE_NS))"; \
	NAMESPACE="$(CONSTRUCTIVE_NS)" "$(K8S_DIR)/scripts/port-forward.sh" start

proxy-stop:
	@echo "Stopping port-forwards for server, explorer, dashboard and pgadmin (namespace $(CONSTRUCTIVE_NS))"; \
	NAMESPACE="$(CONSTRUCTIVE_NS)" "$(K8S_DIR)/scripts/port-forward.sh" stop

######## Helper commands ########

ZONE_ID ?= REPLACE_WITH_ROUTE53_ZONE_ID
LB_IP ?= REPLACE_WITH_LOAD_BALANCER_IP
AWS_PROFILE ?= default
DNS_RECORD_NAME ?= REPLACE_WITH_DNS_RECORD_NAME
ROUTE53_SECRET_NAME ?= certmgr-route53
UPLOADS_BUCKET ?= REPLACE_WITH_S3_BUCKET_NAME
UPLOADS_IAM_USER ?= REPLACE_WITH_S3_IAM_USER
AWS_REGION ?= us-east-1

aws-route53:
	aws route53 change-resource-record-sets \
		--profile ${AWS_PROFILE} \
		--hosted-zone-id ${ZONE_ID} \
		--change-batch "{ \"Changes\": [ {\"Action\":\"UPSERT\",\"ResourceRecordSet\":{\"Name\":\"${DNS_RECORD_NAME}\",\"Type\":\"A\",\"TTL\":60,\"ResourceRecords\":[{\"Value\":\"${LB_IP}\"}]}} ] }"

k8s-iam-user-secret:
	$(KUBECTL) -n $(CONSTRUCTIVE_NS) create secret generic $(ROUTE53_SECRET_NAME) \
		--from-literal=AWS_ACCESS_KEY_ID=$(AWS_ACCESS_KEY_ID) \
		--from-literal=AWS_SECRET_ACCESS_KEY=$(AWS_SECRET_ACCESS_KEY)

### aws s3 bucket used for uploads
create-bucket-user:
	./scripts/create-uploads-bucket-user-policy.sh $(UPLOADS_BUCKET) $(UPLOADS_IAM_USER) $(AWS_REGION) $(AWS_PROFILE)
