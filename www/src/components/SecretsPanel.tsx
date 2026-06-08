import { useEffect, useState, useCallback, useMemo } from 'react';
import { api, type PlatformSecret, type PlatformFunction, type PlatformNamespace } from '../lib/api';
import { RefreshCw, Key, Globe, Save, Eye, EyeOff, CheckCircle, AlertTriangle, FileText } from 'lucide-react';

type SecretEdits = Record<string, string>;

export function SecretsPanel() {
  const [secrets, setSecrets] = useState<PlatformSecret[]>([]);
  const [functions, setFunctions] = useState<PlatformFunction[]>([]);
  const [namespaces, setNamespaces] = useState<PlatformNamespace[]>([]);
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [envPath, setEnvPath] = useState('');
  const [envExists, setEnvExists] = useState(false);
  const [edits, setEdits] = useState<SecretEdits>({});
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const refresh = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.getSecrets(),
      api.getFunctions(),
      api.getNamespaces(),
      api.getEnv(),
    ])
      .then(([s, f, n, env]) => {
        setSecrets(s);
        setFunctions(f);
        setNamespaces(n);
        setEnvVars(env.vars);
        setEnvPath(env.path);
        setEnvExists(env.exists);
        setEdits({});
        setSaveMsg(null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // Build a map: secretName → which functions require it
  const secretUsage = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const fn of functions) {
      for (const s of fn.required_secrets) {
        if (!map[s.name]) map[s.name] = [];
        map[s.name].push(fn.name);
      }
      for (const c of fn.required_configs) {
        if (!map[c.name]) map[c.name] = [];
        map[c.name].push(fn.name);
      }
    }
    return map;
  }, [functions]);

  // All keys: union of secrets from DB + keys from .env + keys from function requirements
  const allKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const s of secrets) keys.add(s.name);
    for (const fn of functions) {
      for (const s of fn.required_secrets) keys.add(s.name);
      for (const c of fn.required_configs) keys.add(c.name);
    }
    for (const k of Object.keys(envVars)) keys.add(k);
    return Array.from(keys).sort();
  }, [secrets, functions, envVars]);

  const secretDefs = useMemo(() => {
    const map: Record<string, PlatformSecret> = {};
    for (const s of secrets) map[s.name] = s;
    return map;
  }, [secrets]);

  const currentValue = (key: string) => edits[key] ?? envVars[key] ?? '';
  const isDirty = Object.keys(edits).length > 0;

  const handleChange = (key: string, value: string) => {
    setEdits((prev) => {
      const next = { ...prev };
      if (value === (envVars[key] ?? '')) {
        delete next[key];
      } else {
        next[key] = value;
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!isDirty) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      const merged = { ...envVars, ...edits };
      const result = await api.saveEnv(merged);
      setSaveMsg({ ok: true, text: `Saved ${result.count} vars to ${result.path}` });
      // Refresh to pick up saved values
      const env = await api.getEnv();
      setEnvVars(env.vars);
      setEnvPath(env.path);
      setEnvExists(env.exists);
      setEdits({});
    } catch (err: any) {
      setSaveMsg({ ok: false, text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const toggleReveal = (key: string) => {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Coverage stats per function
  const fnCoverage = useMemo(() => {
    return functions
      .filter((fn) => fn.is_invocable)
      .map((fn) => {
        const allReqs = [...fn.required_secrets, ...fn.required_configs];
        const vals = { ...envVars, ...edits };
        const set = allReqs.filter((r) => vals[r.name] && vals[r.name] !== '').length;
        return { name: fn.name, total: allReqs.length, set, missing: allReqs.length - set };
      });
  }, [functions, envVars, edits]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-300">Secrets &amp; Config Editor</h2>
        <div className="flex items-center gap-2">
          {saveMsg && (
            <span className={`text-xs ${saveMsg.ok ? 'text-emerald-400' : 'text-red-400'}`}>
              {saveMsg.text}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={!isDirty || saving}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              isDirty
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            <Save size={12} />
            {saving ? 'Saving…' : `Save to .env${isDirty ? ` (${Object.keys(edits).length})` : ''}`}
          </button>
          <button
            onClick={refresh}
            className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* .env file status */}
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <FileText size={12} />
          <span className="font-mono">{envPath || '.env'}</span>
          {envExists ? (
            <span className="px-1.5 py-0.5 rounded bg-emerald-900/50 text-emerald-400">exists</span>
          ) : (
            <span className="px-1.5 py-0.5 rounded bg-amber-900/50 text-amber-400">will be created on save</span>
          )}
        </div>

        {/* Function coverage summary */}
        {fnCoverage.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              Function Coverage
            </h3>
            <div className="flex flex-wrap gap-2">
              {fnCoverage.map((fn) => (
                <div
                  key={fn.name}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-xs ${
                    fn.missing === 0
                      ? 'border-emerald-800 bg-emerald-900/20 text-emerald-400'
                      : 'border-amber-800 bg-amber-900/20 text-amber-400'
                  }`}
                >
                  {fn.missing === 0 ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                  <span className="font-mono">{fn.name}</span>
                  <span className="text-zinc-500">
                    {fn.set}/{fn.total}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Namespaces */}
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

        {/* Secrets / Config editor */}
        <section>
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Key size={12} />
            Secrets &amp; Config ({allKeys.length})
          </h3>
          <div className="space-y-1.5">
            {allKeys.map((key) => {
              const def = secretDefs[key];
              const val = currentValue(key);
              const isEdited = key in edits;
              const isRevealed = revealed.has(key);
              const usedBy = secretUsage[key] || [];
              const isSensitive = key.toLowerCase().includes('password') ||
                key.toLowerCase().includes('secret') ||
                key.toLowerCase().includes('key') ||
                key.toLowerCase().includes('token');

              return (
                <div
                  key={key}
                  className={`rounded border px-3 py-2 ${
                    isEdited
                      ? 'border-blue-700 bg-blue-900/10'
                      : val
                        ? 'border-zinc-800 bg-zinc-900/30'
                        : 'border-amber-800/50 bg-amber-900/10'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Key size={12} className={val ? 'text-emerald-500' : 'text-amber-500'} />
                    <span className="font-mono text-xs text-zinc-200">{key}</span>
                    {def?.is_built_in && (
                      <span className="px-1 py-0.5 rounded bg-blue-900/50 text-blue-400 text-[10px]">built-in</span>
                    )}
                    {isEdited && (
                      <span className="px-1 py-0.5 rounded bg-blue-900/50 text-blue-400 text-[10px]">modified</span>
                    )}
                    {usedBy.length > 0 && (
                      <span className="text-[10px] text-zinc-600">
                        used by: {usedBy.join(', ')}
                      </span>
                    )}
                  </div>
                  {def?.description && (
                    <p className="text-[11px] text-zinc-500 mb-1.5 ml-5">{def.description}</p>
                  )}
                  <div className="flex items-center gap-1 ml-5">
                    <input
                      type={isSensitive && !isRevealed ? 'password' : 'text'}
                      value={val}
                      onChange={(e) => handleChange(key, e.target.value)}
                      placeholder="not set"
                      className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-600 transition-colors"
                    />
                    {isSensitive && (
                      <button
                        onClick={() => toggleReveal(key)}
                        className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
                        title={isRevealed ? 'Hide value' : 'Show value'}
                      >
                        {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
