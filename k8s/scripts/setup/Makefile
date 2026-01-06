SHELL := /bin/bash

SCRIPT_DIR := $(CURDIR)

.PHONY: help cluster operators operators-knative-only all cleanup

help:
	@echo "Kubernetes setup helpers (run from k8s/scripts/setup)"
	@echo ""
	@echo "Targets:"
	@echo "  cluster    - install cluster infrastructure (cert-manager, ingress-nginx, optional monitoring)"
	@echo "  operators  - install operators (CloudNativePG, Knative)"
	@echo "  operators-knative-only - install only Knative Serving + Kourier (no CNPG)"
	@echo "  all        - run cluster + operators"
	@echo "  cleanup    - run full cleanup script (99-cleanup.sh)"
	@echo ""
	@echo "Examples:"
	@echo "  make cluster"
	@echo "  make operators"
	@echo "  make operators-knative-only"
	@echo "  make all"
	@echo "  make cleanup"

cluster:
	@echo "Running 00-cluster-setup.sh..."
	@bash "$(SCRIPT_DIR)/00-cluster-setup.sh"

operators:
	@echo "Running 01-install-operators.sh..."
	@bash "$(SCRIPT_DIR)/01-install-operators.sh"

operators-knative-only:
	@echo "Running 01-install-operators.sh --knative-only..."
	@bash "$(SCRIPT_DIR)/01-install-operators.sh" --knative-only

all: cluster operators

cleanup:
	@echo "Running 99-cleanup.sh..."
	@bash "$(SCRIPT_DIR)/99-cleanup.sh"
