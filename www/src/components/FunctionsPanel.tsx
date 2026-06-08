import { useState } from 'react';
import { RefreshCw, Zap, Lock, Settings, Play, X, CheckCircle, AlertCircle, Loader, ExternalLink } from 'lucide-react';
import { useAllPlatformFunctions, useCreateJob } from '../generated/hooks';
import type { PlatformFunctionDefinition } from '../generated/types';

function parseRequirements(raw: string): Array<{ name: string; required: boolean }> {
  if (!raw || raw === '{}') return [];
  const inner = raw.slice(1, -1);
  const items: Array<{ name: string; required: boolean }> = [];
  for (const match of inner.matchAll(/"?\(([^,]+),(t|f)\)"?/g)) {
    items.push({ name: match[1], required: match[2] === 't' });
  }
  return items;
}

type Tab = 'functions' | 'flows' | 'secrets' | 'jobs' | 'invocations' | 'k8s' | 'commands' | 'terminal';

export function FunctionsPanel({ onNavigate }: { onNavigate?: (tab: Tab) => void }) {
  const { data: functions = [], isLoading, refetch } = useAllPlatformFunctions({
    refetchInterval: false,
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-300">Functions</h2>
        <button
          onClick={() => refetch()}
          className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {functions.map((fn) => (
          <FunctionCard key={fn.name} fn={fn} onNavigate={onNavigate} />
        ))}
        {!isLoading && functions.length === 0 && (
          <p className="text-zinc-500 text-sm">No functions found. Run <code className="text-amber-400">make up</code> to deploy.</p>
        )}
      </div>
    </div>
  );
}

const DEFAULT_PAYLOADS: Record<string, Record<string, unknown>> = {
  'send-email': {
    to: 'test@example.com',
    subject: 'Hello from Platform UI',
    html: '<p>Test email sent via compute-worker</p>',
  },
  'send-verification-link': {
    email_type: 'email_verification',
    email: 'test@example.com',
    email_id: '00000000-0000-0000-0000-000000000001',
    verification_token: 'test-token-123',
  },
};

interface TriggerResult {
  status: 'idle' | 'sending' | 'success' | 'error';
  message?: string;
  jobId?: string;
}

function FunctionCard({ fn, onNavigate }: { fn: PlatformFunctionDefinition; onNavigate?: (tab: Tab) => void }) {
  const secrets = parseRequirements(fn.requiredSecrets);
  const configs = parseRequirements(fn.requiredConfigs);
  const [showTrigger, setShowTrigger] = useState(false);
  const [payload, setPayload] = useState('');
  const [result, setResult] = useState<TriggerResult>({ status: 'idle' });

  const createJob = useCreateJob();

  const openTrigger = () => {
    const defaultPayload = DEFAULT_PAYLOADS[fn.taskIdentifier] || { key: 'value' };
    setPayload(JSON.stringify(defaultPayload, null, 2));
    setResult({ status: 'idle' });
    setShowTrigger(true);
  };

  const closeTrigger = () => {
    setShowTrigger(false);
    setResult({ status: 'idle' });
  };

  const handleTrigger = async () => {
    setResult({ status: 'sending' });
    try {
      const parsed = JSON.parse(payload);
      const job = await createJob.mutateAsync({ taskIdentifier: fn.taskIdentifier, payload: parsed });
      setResult({
        status: 'success',
        message: `Job #${job.id.slice(0, 8)} created`,
        jobId: job.id,
      });
    } catch (err: any) {
      setResult({
        status: 'error',
        message: err.message || 'Failed to create job',
      });
    }
  };

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap size={14} className={fn.isInvocable ? 'text-emerald-400' : 'text-zinc-600'} />
          <span className="font-mono text-sm text-zinc-200">{fn.name}</span>
        </div>
        <div className="flex items-center gap-2">
          {fn.isInvocable && !showTrigger && (
            <button
              onClick={openTrigger}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-emerald-700 hover:bg-emerald-600 text-white transition-colors"
            >
              <Play size={10} />
              Trigger
            </button>
          )}
          <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
            {fn.scope}
          </span>
        </div>
      </div>
      {fn.description && (
        <p className="text-xs text-zinc-500">{fn.description}</p>
      )}
      <div className="flex items-center gap-3 text-xs text-zinc-500">
        <span className="font-mono">{fn.taskIdentifier}</span>
        {secrets.length > 0 && (
          <span className="flex items-center gap-1">
            <Lock size={10} />
            {secrets.length} secret{secrets.length !== 1 ? 's' : ''}
          </span>
        )}
        {configs.length > 0 && (
          <span className="flex items-center gap-1">
            <Settings size={10} />
            {configs.length} config{configs.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Inline trigger form */}
      {showTrigger && (
        <div className="mt-2 border-t border-zinc-800 pt-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Trigger Job</span>
            <button
              onClick={closeTrigger}
              className="p-0.5 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <X size={12} />
            </button>
          </div>
          <div>
            <label className="text-[11px] text-zinc-500 mb-1 block">Payload (JSON)</label>
            <textarea
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              rows={6}
              spellCheck={false}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-600 transition-colors resize-y"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleTrigger}
              disabled={result.status === 'sending'}
              className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                result.status === 'sending'
                  ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {result.status === 'sending' ? (
                <><Loader size={10} className="animate-spin" /> Sending…</>
              ) : (
                <><Play size={10} /> Create Job</>
              )}
            </button>
            {result.status === 'success' && (
              <span className="flex items-center gap-1 text-xs text-emerald-400">
                <CheckCircle size={12} />
                {result.message}
                {onNavigate && (
                  <button
                    onClick={() => onNavigate('invocations')}
                    className="ml-2 flex items-center gap-0.5 text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <ExternalLink size={10} />
                    Invocations
                  </button>
                )}
              </span>
            )}
            {result.status === 'error' && (
              <span className="flex items-center gap-1 text-xs text-red-400">
                <AlertCircle size={12} />
                {result.message}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
