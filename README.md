# constructive-functions

Playground for constructive functions with Kubernetes deployment support.

## Structure

```
constructive-functions/
├── functions/          # Functions directory
│   ├── examples/      # Example functions
│   └── README.md      # Functions documentation
├── k8s/               # Kubernetes configurations
│   ├── namespace.yaml
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── configmap.yaml
│   ├── ingress.yaml
│   └── README.md      # Kubernetes deployment guide
└── README.md          # This file
```

## Getting Started

### Functions

The `functions/` directory contains all the serverless functions for this playground. Each function is self-contained and can be deployed independently.

See [functions/README.md](functions/README.md) for more details.

### Kubernetes Deployment

The `k8s/` directory contains Kubernetes manifests for deploying the functions runtime to a cluster.

Quick start:

```bash
# Deploy to Kubernetes
kubectl apply -f k8s/

# Check deployment status
kubectl get all -n constructive-functions
```

See [k8s/README.md](k8s/README.md) for detailed deployment instructions.

## Development

Add new functions to the `functions/` directory. Each function should:
- Be self-contained
- Include a README with usage examples
- Follow the established patterns in `functions/examples/`

## License

See [LICENSE](LICENSE) for details.
