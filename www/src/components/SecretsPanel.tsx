import { useEffect, useState, useCallback } from 'react';
import { api, type PlatformSecret, type PlatformNamespace } from '../lib/api';
import { RefreshCw, Key, Globe } from 'lucide-react';

export function SecretsPanel() {
  const [secrets, setSecrets] = useState<PlatformSecret[]>([]);
  const [namespaces, setNamespaces] = useState<PlatformNamespace[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    Promise.all([api.getSecrets(), api.getNamespaces()])
      .then(([s, n]) => { setSecrets(s); setNamespaces(n); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-300">Secrets &amp; Namespaces</h2>
        <button
          onClick={refresh}
          className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <section>
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Globe size={12} />
            Namespaces
          </h3>
          {namespaces.length === 0 && !loading && (
            <p className="text-zinc-500 text-sm">No namespaces defined.</p>
          )}
          <div className="space-y-2">
            {namespaces.map((ns) => (
              <div key={ns.id} className="flex items-center gap-3 rounded border border-zinc-800 bg-zinc-900/30 px-3 py-2 text-sm">
                <div className="flex-1">
                  <span className="font-mono text-zinc-200">{ns.name}</span>
                  <span className="text-xs text-zinc-600 ml-2">({ns.namespace_name})</span>
                  {ns.description && (
                    <p className="text-xs text-zinc-500 mt-0.5">{ns.description}</p>
                  )}
                </div>
                <span className={`px-1.5 py-0.5 rounded text-xs ${
                  ns.is_active ? 'bg-emerald-900/50 text-emerald-400' : 'bg-zinc-800 text-zinc-500'
                }`}>
                  {ns.is_active ? 'active' : 'inactive'}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Key size={12} />
            Secret Definitions ({secrets.length})
          </h3>
          {secrets.length === 0 && !loading && (
            <p className="text-zinc-500 text-sm">No secret definitions seeded.</p>
          )}
          <div className="space-y-2">
            {secrets.map((secret) => (
              <div key={secret.name} className="flex items-center gap-3 rounded border border-zinc-800 bg-zinc-900/30 px-3 py-2 text-sm">
                <Key size={14} className="text-amber-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="font-mono text-zinc-200">{secret.name}</span>
                  {secret.description && (
                    <p className="text-xs text-zinc-500 mt-0.5">{secret.description}</p>
                  )}
                </div>
                {secret.is_built_in && (
                  <span className="px-1.5 py-0.5 rounded bg-blue-900/50 text-blue-400 text-xs shrink-0">
                    built-in
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
