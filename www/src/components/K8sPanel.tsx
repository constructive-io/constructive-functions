import { useEffect, useState, useCallback } from 'react';
import { api, type K8sNamespace, type K8sPod, type K8sDeployment, type K8sService } from '../lib/api';
import { RefreshCw, Box, Server, Globe, AlertTriangle, CheckCircle, XCircle, Loader } from 'lucide-react';

type K8sResource = 'pods' | 'deployments' | 'services';

export function K8sPanel() {
  const [namespaces, setNamespaces] = useState<K8sNamespace[]>([]);
  const [selectedNs, setSelectedNs] = useState('constructive-functions');
  const [activeResource, setActiveResource] = useState<K8sResource>('pods');
  const [pods, setPods] = useState<K8sPod[]>([]);
  const [deployments, setDeployments] = useState<K8sDeployment[]>([]);
  const [services, setServices] = useState<K8sService[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNamespaces = useCallback(() => {
    api.k8sListNamespaces()
      .then((res) => setNamespaces(res.items || []))
      .catch((err) => setError(err.message));
  }, []);

  const loadResources = useCallback(() => {
    if (!selectedNs) return;
    setLoading(true);
    setError(null);

    const loaders = {
      pods: () => api.k8sListPods(selectedNs).then((r) => setPods(r.items || [])),
      deployments: () => api.k8sListDeployments(selectedNs).then((r) => setDeployments(r.items || [])),
      services: () => api.k8sListServices(selectedNs).then((r) => setServices(r.items || [])),
    };

    loaders[activeResource]()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedNs, activeResource]);

  useEffect(() => { loadNamespaces(); }, [loadNamespaces]);
  useEffect(() => { loadResources(); }, [loadResources]);

  const RESOURCES: { id: K8sResource; label: string; icon: typeof Box }[] = [
    { id: 'pods', label: 'Pods', icon: Box },
    { id: 'deployments', label: 'Deployments', icon: Server },
    { id: 'services', label: 'Services', icon: Globe },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-zinc-300">Kubernetes</h2>
          <select
            value={selectedNs}
            onChange={(e) => setSelectedNs(e.target.value)}
            className="text-xs bg-zinc-900 border border-zinc-700 text-zinc-300 rounded px-2 py-1"
          >
            {namespaces.length === 0 && <option value={selectedNs}>{selectedNs}</option>}
            {namespaces.map((ns) => (
              <option key={ns.metadata.name} value={ns.metadata.name}>
                {ns.metadata.name}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-1 ml-2">
            {RESOURCES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveResource(id)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                  activeResource === id
                    ? 'bg-zinc-700 text-zinc-100'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                <Icon size={12} />
                {label}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={loadResources}
          className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {error && (
          <div className="flex items-center gap-2 rounded border border-amber-800/50 bg-amber-900/20 px-3 py-2 text-sm text-amber-400">
            <AlertTriangle size={14} />
            <span>{error}</span>
            <span className="text-xs text-amber-500/70 ml-auto">
              Ensure <code className="text-amber-400">kubectl proxy --port=8001</code> is running
            </span>
          </div>
        )}

        {!error && !loading && activeResource === 'pods' && pods.length === 0 && (
          <p className="text-zinc-500 text-sm">No pods in {selectedNs}</p>
        )}
        {activeResource === 'pods' && pods.map((pod) => <PodCard key={pod.metadata.uid} pod={pod} />)}
        {activeResource === 'deployments' && deployments.map((d) => <DeploymentCard key={d.metadata.uid} deployment={d} />)}
        {activeResource === 'services' && services.map((s) => <ServiceCard key={s.metadata.uid} service={s} />)}
      </div>
    </div>
  );
}

function PodCard({ pod }: { pod: K8sPod }) {
  const phase = pod.status?.phase || 'Unknown';
  const StatusIcon = phase === 'Running' ? CheckCircle
    : phase === 'Succeeded' ? CheckCircle
    : phase === 'Pending' ? Loader
    : XCircle;
  const statusColor = phase === 'Running' ? 'text-emerald-400'
    : phase === 'Succeeded' ? 'text-blue-400'
    : phase === 'Pending' ? 'text-amber-400'
    : 'text-red-400';

  const containers = pod.status?.containerStatuses || [];

  return (
    <div className="rounded border border-zinc-800 bg-zinc-900/50 p-3 space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusIcon size={14} className={statusColor} />
          <span className="font-mono text-sm text-zinc-200">{pod.metadata.name}</span>
        </div>
        <span className={`text-xs px-1.5 py-0.5 rounded ${
          phase === 'Running' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-zinc-800 text-zinc-400'
        }`}>
          {phase}
        </span>
      </div>
      {containers.length > 0 && (
        <div className="flex flex-wrap gap-2 text-xs text-zinc-500">
          {containers.map((c) => (
            <span key={c.name} className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${c.ready ? 'bg-emerald-400' : 'bg-red-400'}`} />
              {c.name}
              {c.restartCount > 0 && <span className="text-amber-500">({c.restartCount} restarts)</span>}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function DeploymentCard({ deployment }: { deployment: K8sDeployment }) {
  const ready = deployment.status?.readyReplicas ?? 0;
  const desired = deployment.spec?.replicas ?? 0;
  const allReady = ready === desired && desired > 0;

  return (
    <div className="rounded border border-zinc-800 bg-zinc-900/50 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Server size={14} className={allReady ? 'text-emerald-400' : 'text-amber-400'} />
          <span className="font-mono text-sm text-zinc-200">{deployment.metadata.name}</span>
        </div>
        <span className={`text-xs px-1.5 py-0.5 rounded ${
          allReady ? 'bg-emerald-900/50 text-emerald-400' : 'bg-amber-900/50 text-amber-400'
        }`}>
          {ready}/{desired} ready
        </span>
      </div>
    </div>
  );
}

function ServiceCard({ service }: { service: K8sService }) {
  const ports = service.spec?.ports || [];

  return (
    <div className="rounded border border-zinc-800 bg-zinc-900/50 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe size={14} className="text-blue-400" />
          <span className="font-mono text-sm text-zinc-200">{service.metadata.name}</span>
        </div>
        <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
          {service.spec.type}
        </span>
      </div>
      {ports.length > 0 && (
        <div className="flex gap-2 mt-1.5 text-xs text-zinc-500">
          {ports.map((p, i) => (
            <span key={i} className="font-mono">
              {p.port}→{p.targetPort}/{p.protocol}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
