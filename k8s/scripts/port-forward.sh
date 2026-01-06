#!/usr/bin/env bash
set -euo pipefail

# Simple helper for port-forwarding core services:
# - constructive-server (API)
# - explorer (GraphQL explorer, same Service different port)
# - dashboard (Next.js dashboard)
# - pgadmin (pgAdmin UI)
#
# Usage:
#   NAMESPACE=default ./k8s/scripts/port-forward.sh start
#   NAMESPACE=default ./k8s/scripts/port-forward.sh stop
#
# You can override:
#   - NAMESPACE       (defaults to "default")
#   - K8S_PF_DIR      (defaults to "$K8S_DIR/.pf")

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
K8S_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
PF_DIR="${K8S_PF_DIR:-"${K8S_DIR}/.pf"}"
NAMESPACE="${NAMESPACE:-default}"

mkdir -p "${PF_DIR}"

usage() {
  cat <<EOF
Usage: $(basename "$0") {start|stop}

Environment:
  NAMESPACE   Kubernetes namespace (default: default)
  K8S_PF_DIR  Directory for PID/log files (default: ${PF_DIR})

Services forwarded:
  - dashboard: localhost:3000 -> svc/dashboard:3000
  - pgadmin:   localhost:3001 -> svc/pgadmin:80
  - server:    localhost:8080 -> svc/constructive-server:3000
  - explorer:  localhost:8081 -> svc/constructive-server:3001
EOF
}

start_pf() {
  local name="$1" local_port="$2" service="$3" service_port="$4"
  local pid_file="${PF_DIR}/${name}.pid"
  local log_file="${PF_DIR}/${name}.log"

  if [[ -f "${pid_file}" ]]; then
    local pid
    pid="$(cat "${pid_file}")"
    if kill -0 "${pid}" 2>/dev/null; then
      echo "[${name}] already running (pid ${pid})"
      return 0
    else
      rm -f "${pid_file}"
    fi
  fi

  echo "[${name}] forwarding localhost:${local_port} -> svc/${service}:${service_port} (ns=${NAMESPACE})"
  kubectl -n "${NAMESPACE}" port-forward "svc/${service}" "${local_port}:${service_port}" >"${log_file}" 2>&1 &
  echo $! > "${pid_file}"
}

stop_pf() {
  local name="$1"
  local pid_file="${PF_DIR}/${name}.pid"

  if [[ ! -f "${pid_file}" ]]; then
    echo "[${name}] no pid file (${pid_file}), nothing to stop"
    return 0
  fi

  local pid
  pid="$(cat "${pid_file}")"
  if kill -0 "${pid}" 2>/dev/null; then
    echo "[${name}] stopping pid ${pid}"
    kill "${pid}" 2>/dev/null || true
  else
    echo "[${name}] pid ${pid} not running"
  fi

  rm -f "${pid_file}"
}

cmd="${1:-}"
case "${cmd}" in
  start)
    start_pf "dashboard" 3000 dashboard           3000
    start_pf "pgadmin"   3001 pgadmin             80
    start_pf "server"    8080 constructive-server 3000
    start_pf "explorer"  8081 constructive-server 3001
    ;;
  stop)
    stop_pf "server"
    stop_pf "explorer"
    stop_pf "dashboard"
    stop_pf "pgadmin"
    ;;
  ""|-h|--help|help)
    usage
    ;;
  *)
    echo "Unknown command: ${cmd}" >&2
    usage >&2
    exit 1
    ;;
esac
