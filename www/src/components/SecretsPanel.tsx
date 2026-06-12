import { useEffect, useState, useCallback, useMemo } from 'react';
import { compute, api as apiHooks } from '@constructive-functions/constructive-functions-hooks';
import { api } from '../lib/api';
import { RefreshCw, Key, Globe, Save, Eye, EyeOff, CheckCircle, AlertTriangle, FileText, Database, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

interface FunctionRequirement {
  name?: string;
  required?: boolean;
}

type SecretEdits = Record<string, string>;

const SECRET_FIELDS = {
  id: true,
  name: true,
  description: true,
  isBuiltIn: true,
  createdAt: true,
  updatedAt: true,
} as const;

const NAMESPACE_FIELDS = {
  id: true,
  name: true,
  namespaceName: true,
  description: true,
  isActive: true,
} as const;

export function SecretsPanel() {
  const { data: secretsData, refetch: refetchSecrets } = compute.usePlatformSecretDefinitionsQuery({
    selection: { fields: SECRET_FIELDS },
  });
  const { data: namespacesData, refetch: refetchNamespaces } = apiHooks.usePlatformNamespacesQuery({
    selection: { fields: NAMESPACE_FIELDS },
  });

  const secrets = secretsData?.platformSecretDefinitions?.nodes ?? [];
  const namespaces = namespacesData?.platformNamespaces?.nodes ?? [];

  // Fetch function requirement data via REST (composite types not yet supported by ORM)
  const [restFunctions, setRestFunctions] = useState<import('../lib/api').PlatformFunction[]>([]);
  const loadFunctions = useCallback(() => {
    api.getFunctions().then(setRestFunctions).catch(() => {});
  }, []);
  useEffect(() => { loadFunctions(); }, [loadFunctions]);

  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [envPath, setEnvPath] = useState('');
  const [envExists, setEnvExists] = useState(false);
  const [edits, setEdits] = useState<SecretEdits>({});
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState<'from-db' | 'to-db' | null>(null);
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const loadEnv = useCallback(() => {
    setLoading(true);
    api.getEnv()
      .then((env) => {
        setEnvVars(env.vars);
        setEnvPath(env.path);
        setEnvExists(env.exists);
        setEdits({});
        setSaveMsg(null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadEnv(); }, [loadEnv]);

  const refresh = useCallback(() => {
    refetchSecrets();
    refetchNamespaces();
    loadFunctions();
    loadEnv();
  }, [refetchSecrets, refetchNamespaces, loadFunctions, loadEnv]);

  const secretUsage = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const fn of restFunctions) {
      const reqs = [
        ...(fn.required_secrets ?? []),
        ...(fn.required_configs ?? []),
      ];
      for (const r of reqs) {
        if (!r.name) continue;
        if (!map[r.name]) map[r.name] = [];
        map[r.name].push(fn.name ?? '');
      }
    }
    return map;
  }, [restFunctions]);

  const allKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const s of secrets) if (s.name) keys.add(s.name);
    for (const fn of restFunctions) {
      for (const s of (fn.required_secrets ?? [])) if (s.name) keys.add(s.name);
      for (const c of (fn.required_configs ?? [])) if (c.name) keys.add(c.name);
    }
    for (const k of Object.keys(envVars)) keys.add(k);
    return Array.from(keys).sort();
  }, [secrets, restFunctions, envVars]);

  const secretDefs = useMemo(() => {
    const map: Record<string, typeof secrets[number]> = {};
    for (const s of secrets) if (s.name) map[s.name] = s;
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

  const handleSyncFromDb = async () => {
    setSyncing('from-db');
    setSaveMsg(null);
    try {
      const result = await api.syncFromDb();
      setSaveMsg({ ok: true, text: `Synced ${result.synced} DB values → .env (${result.total} total)` });
      refresh();
    } catch (err: any) {
      setSaveMsg({ ok: false, text: err.message });
    } finally {
      setSyncing(null);
    }
  };

  const handleSyncToDb = async () => {
    setSyncing('to-db');
    setSaveMsg(null);
    try {
      const result = await api.syncToDb();
      setSaveMsg({ ok: true, text: `Synced ${result.synced} .env values → DB` });
    } catch (err: any) {
      setSaveMsg({ ok: false, text: err.message });
    } finally {
      setSyncing(null);
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

  const fnCoverage = useMemo(() => {
    return functions
      .filter((fn) => fn.isInvocable)
      .map((fn) => {
        const allReqs = [
          ...((fn.requiredSecrets ?? []) as FunctionRequirement[]),
          ...((fn.requiredConfigs ?? []) as FunctionRequirement[]),
        ];
        const vals = { ...envVars, ...edits };
        const set = allReqs.filter((r) => r.name && vals[r.name] && vals[r.name] !== '').length;
        return { name: fn.name ?? '', total: allReqs.length, set, missing: allReqs.length - set };
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
            onClick={handleSyncFromDb}
            disabled={syncing !== null}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:text-zinc-500 disabled:cursor-not-allowed"
            title="Read configured values from DB and write them to .env"
          >
            <ArrowDownToLine size={12} />
            {syncing === 'from-db' ? 'Syncing…' : 'Sync from DB'}
          </button>
          <button
            onClick={handleSyncToDb}
            disabled={syncing !== null}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:text-zinc-500 disabled:cursor-not-allowed"
            title="Read .env values and write them to DB"
          >
            <ArrowUpFromLine size={12} />
            {syncing === 'to-db' ? 'Syncing…' : 'Sync to DB'}
          </button>
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
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <FileText size={12} />
            <span className="font-mono">{envPath || '.env'}</span>
            {envExists ? (
              <span className="px-1.5 py-0.5 rounded bg-emerald-900/50 text-emerald-400">exists</span>
            ) : (
              <span className="px-1.5 py-0.5 rounded bg-amber-900/50 text-amber-400">will be created on save</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Database size={12} />
            <span>platform_secrets + platform_config</span>
            <span className="px-1.5 py-0.5 rounded bg-blue-900/50 text-blue-400">bidirectional sync</span>
          </div>
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
                  <span className="text-xs text-zinc-600 ml-2">({ns.namespaceName})</span>
                  {ns.description && (
                    <p className="text-xs text-zinc-500 mt-0.5">{ns.description}</p>
                  )}
                </div>
                <span className={`px-1.5 py-0.5 rounded text-xs ${
                  ns.isActive ? 'bg-emerald-900/50 text-emerald-400' : 'bg-zinc-800 text-zinc-500'
                }`}>
                  {ns.isActive ? 'active' : 'inactive'}
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
                    {def?.isBuiltIn && (
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
