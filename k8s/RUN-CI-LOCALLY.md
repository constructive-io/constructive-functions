# 本地跑 CI Test K8s

可以。按下面步骤在本地复现 `.github/workflows/test-k8s-deployment.yaml` 的 K8s 测试。

## 前提

- Docker 已安装并运行
- 已安装 [kind](https://kind.sigs.k8s.io/) 和 kubectl
- Node 20+、pnpm

## 步骤

### 1. 创建 kind 集群（与 CI 同名 `local`）

```bash
kind create cluster --name local
```

若已有其他名字的集群，后面所有 `KIND_CLUSTER_NAME` 都改成你的集群名。

### 2. 安装 Knative（仅 Serving + Kourier）

```bash
cd k8s/scripts/setup
make operators-knative-only
cd ../../..
```

等待 Knative 就绪（约 2–5 分钟），可：

```bash
kubectl get pods -n knative-serving
kubectl get pods -n kourier-system
```

### 3. 应用 CI overlay（含 test-runner RBAC）

```bash
cd k8s
kubectl kustomize overlays/ci --load-restrictor=LoadRestrictionsNone | kubectl apply -f -
cd ..
```

### 4. 等待并安装依赖

```bash
sleep 30
pnpm install --no-frozen-lockfile
```

### 5. 构建并加载 test-runner 镜像到 kind

```bash
make build-test-runner KIND_CLUSTER_NAME=local
```

### 6. 跑 K8s 测试（与 CI 一致）

只跑 send-email-link：

```bash
pnpm exec ts-node scripts/test-runner.ts --function send-email-link
```

只跑 simple-email：

```bash
pnpm exec ts-node scripts/test-runner.ts --function simple-email
```

两个都跑（不传 `--function`）：

```bash
pnpm exec ts-node scripts/test-runner.ts
```

## 注意

- CI 里集群名是 `local`，若你用的不是 `local`，请在所有需要的地方加上 `KIND_CLUSTER_NAME=<你的集群名>`（例如 `make build-test-runner KIND_CLUSTER_NAME=interweb-local`）。
- 根目录 Makefile 默认 `KIND_CLUSTER_NAME ?= interweb-local`，若你建的集群是 `local`，跑 `make build-test-runner` 时请显式传 `KIND_CLUSTER_NAME=local`。
- 测试会在 default namespace 创建 Job/Pod，用完后可用 `make k8s-clean` 清理残留 Job/Pod。
