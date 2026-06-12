import { useEffect, useState, useCallback } from 'react';
import { compute } from '@constructive-functions/constructive-functions-hooks';
import { api, type Job } from '../lib/api';
import { RefreshCw, Plus, Send, Clock, AlertCircle, ChevronDown } from 'lucide-react';

interface FunctionRequirement {
  name?: string;
  required?: boolean;
}

type FunctionNode = {
  name?: string | null;
  taskIdentifier?: string | null;
  isInvocable?: boolean | null;
  description?: string | null;
  requiredSecrets?: FunctionRequirement[] | null;
  requiredConfigs?: FunctionRequirement[] | null;
};

export function JobsPanel() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const refresh = useCallback(() => {
    setLoading(true);
    api.getJobs().then(setJobs).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 3000);
    return () => clearInterval(id);
  }, [refresh]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-300">Jobs</h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowForm(!showForm)}
            className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
            title="New job"
          >
            <Plus size={14} />
          </button>
          <button
            onClick={refresh}
            className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>
      {showForm && <NewJobForm onCreated={() => { setShowForm(false); refresh(); }} />}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {jobs.map((job) => (
          <JobRow key={job.id} job={job} />
        ))}
        {!loading && jobs.length === 0 && (
          <p className="text-zinc-500 text-sm">No jobs yet. Click <strong>+</strong> to create one.</p>
        )}
      </div>
    </div>
  );
}

const HARDCODED_PAYLOADS: Record<string, Record<string, unknown>> = {
  'send-email': {
    to: 'test@example.com',
    subject: 'Hello from Platform UI',
    html: '<p>Test email</p>',
  },
  'send-verification-link': {
    email_type: 'email_verification',
    email: 'test@example.com',
    email_id: '00000000-0000-0000-0000-000000000001',
    verification_token: 'test-token-123',
  },
};

function getDefaultPayload(fn: FunctionNode): Record<string, unknown> {
  if (fn.taskIdentifier && HARDCODED_PAYLOADS[fn.taskIdentifier]) return HARDCODED_PAYLOADS[fn.taskIdentifier];
  return { key: 'value' };
}

const JOB_FUNCTION_FIELDS = {
  id: true,
  name: true,
  taskIdentifier: true,
  isInvocable: true,
  description: true,
  // requiredSecrets/requiredConfigs are composite types not yet supported by ORM
} as const;

function NewJobForm({ onCreated }: { onCreated: () => void }) {
  const { data } = compute.usePlatformFunctionDefinitionsQuery({
    selection: { fields: JOB_FUNCTION_FIELDS },
  });

  const allFunctions = data?.platformFunctionDefinitions?.nodes ?? [];
  const functions = allFunctions.filter((f) => f.isInvocable);

  const [taskId, setTaskId] = useState('');
  const [payload, setPayload] = useState('{\n  "key": "value"\n}');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized && functions.length > 0) {
      const first = functions[0];
      setTaskId(first.taskIdentifier ?? '');
      setPayload(JSON.stringify(getDefaultPayload(first), null, 2));
      setInitialized(true);
    }
  }, [functions, initialized]);

  const handleFunctionChange = (newTaskId: string) => {
    setTaskId(newTaskId);
    const fn = functions.find((f) => f.taskIdentifier === newTaskId);
    setPayload(JSON.stringify(fn ? getDefaultPayload(fn) : { key: 'value' }, null, 2));
    setError(null);
  };

  const submit = async () => {
    setSending(true);
    setError(null);
    try {
      const parsed = JSON.parse(payload);
      await api.createJob(taskId, parsed);
      onCreated();
    } catch (err: any) {
      setError(err.message || 'Failed to create job');
    } finally {
      setSending(false);
    }
  };

  const selectedFn = functions.find((f) => f.taskIdentifier === taskId);
  const secrets = ((selectedFn?.requiredSecrets ?? []) as FunctionRequirement[]);
  const configs = ((selectedFn?.requiredConfigs ?? []) as FunctionRequirement[]);

  return (
    <div className="border-b border-zinc-800 p-4 space-y-3 bg-zinc-900/50">
      <div>
        <label className="block text-xs text-zinc-500 mb-1">Function</label>
        <div className="relative">
          <select
            value={taskId}
            onChange={(e) => handleFunctionChange(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none pr-8"
          >
            {functions.map((fn) => (
              <option key={fn.taskIdentifier} value={fn.taskIdentifier ?? ''}>
                {fn.name} — {fn.description || fn.taskIdentifier}
              </option>
            ))}
            {functions.length === 0 && (
              <option disabled>No invocable functions</option>
            )}
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
        </div>
      </div>
      {selectedFn && (secrets.length > 0 || configs.length > 0) && (
        <div className="flex gap-3 text-xs text-zinc-500">
          {secrets.length > 0 && (
            <span>{secrets.length} secret(s)</span>
          )}
          {configs.length > 0 && (
            <span>{configs.length} config(s)</span>
          )}
        </div>
      )}
      <div>
        <label className="block text-xs text-zinc-500 mb-1">Payload (JSON)</label>
        <textarea
          value={payload}
          onChange={(e) => setPayload(e.target.value)}
          rows={5}
          className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
          spellCheck={false}
        />
      </div>
      {error && (
        <div className="flex items-center gap-1 text-xs text-red-400">
          <AlertCircle size={10} />
          {error}
        </div>
      )}
      <button
        onClick={submit}
        disabled={sending || !taskId}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded text-sm text-white transition-colors"
      >
        <Send size={12} />
        {sending ? 'Creating...' : 'Create Job'}
      </button>
    </div>
  );
}

function JobRow({ job }: { job: Job }) {
  const isLocked = !!job.locked_by;
  const hasError = !!job.last_error;
  const age = timeSince(new Date(job.created_at));

  return (
    <div className="flex items-center gap-3 rounded border border-zinc-800 bg-zinc-900/30 px-3 py-2 text-sm">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-zinc-200">{job.task_identifier}</span>
          <span className="text-xs text-zinc-600">#{job.id}</span>
        </div>
        {hasError && (
          <div className="flex items-center gap-1 text-xs text-red-400 mt-0.5">
            <AlertCircle size={10} />
            <span className="truncate">{job.last_error}</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-3 text-xs text-zinc-500 shrink-0">
        <span>attempt {job.attempts}/{job.max_attempts}</span>
        {isLocked && (
          <span className="px-1.5 py-0.5 rounded bg-blue-900/50 text-blue-400">locked</span>
        )}
        <span title={job.created_at}>{age}</span>
      </div>
    </div>
  );
}

function timeSince(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
