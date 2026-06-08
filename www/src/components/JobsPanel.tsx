import { useState, useEffect } from 'react';
import { RefreshCw, Plus, Send, Clock, AlertCircle, ChevronDown } from 'lucide-react';
import { useJobsQuery, usePlatformFunctionDefinitionsQuery, useAddJobMutation } from '../generated/hooks';
import type { Job } from '../generated/types';

export function JobsPanel() {
  const { data, isLoading, refetch } = useJobsQuery({
    selection: {
      fields: {
        id: true,
        taskIdentifier: true,
        attempts: true,
        maxAttempts: true,
        lastError: true,
        lockedBy: true,
        createdAt: true,
        payload: true,
      },
      orderBy: ['CREATED_AT_DESC'],
      first: 50,
    },
    refetchInterval: 3000,
  });
  const jobs = (data?.jobs?.nodes ?? []) as Job[];
  const [showForm, setShowForm] = useState(false);

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
            onClick={() => refetch()}
            className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>
      {showForm && <NewJobForm onCreated={() => { setShowForm(false); refetch(); }} />}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {jobs.map((job) => (
          <JobRow key={job.id} job={job} />
        ))}
        {!isLoading && jobs.length === 0 && (
          <p className="text-zinc-500 text-sm">No jobs yet. Click <strong>+</strong> to create one.</p>
        )}
      </div>
    </div>
  );
}

const DEFAULT_PAYLOADS: Record<string, Record<string, unknown>> = {
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

function NewJobForm({ onCreated }: { onCreated: () => void }) {
  const { data: fnData } = usePlatformFunctionDefinitionsQuery({
    selection: {
      fields: {
        name: true,
        taskIdentifier: true,
        isInvocable: true,
        description: true,
      },
    },
  });
  const functions = (fnData?.platformFunctionDefinitions?.nodes ?? []) as Array<{
    name: string;
    taskIdentifier: string;
    isInvocable: boolean;
    description: string;
  }>;
  const invocable = functions.filter((f) => f.isInvocable);

  const [taskId, setTaskId] = useState('');
  const [payload, setPayload] = useState('{\n  "key": "value"\n}');
  const [error, setError] = useState<string | null>(null);

  const addJob = useAddJobMutation({
    selection: {
      fields: {
        result: { select: { id: true } },
      },
    },
    onSuccess: () => onCreated(),
    onError: (err: Error) => setError(err.message || 'Failed to create job'),
  });

  useEffect(() => {
    if (invocable.length > 0 && !taskId) {
      const first = invocable[0];
      setTaskId(first.taskIdentifier);
      const defaultPayload = DEFAULT_PAYLOADS[first.taskIdentifier] || { key: 'value' };
      setPayload(JSON.stringify(defaultPayload, null, 2));
    }
  }, [invocable, taskId]);

  const handleFunctionChange = (newTaskId: string) => {
    setTaskId(newTaskId);
    const defaultPayload = DEFAULT_PAYLOADS[newTaskId] || { key: 'value' };
    setPayload(JSON.stringify(defaultPayload, null, 2));
    setError(null);
  };

  const submit = () => {
    setError(null);
    try {
      const parsed = JSON.parse(payload);
      addJob.mutate({ input: { identifier: taskId, payload: parsed } });
    } catch (err: any) {
      setError(err.message || 'Invalid JSON');
    }
  };

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
            {invocable.map((fn) => (
              <option key={fn.taskIdentifier} value={fn.taskIdentifier}>
                {fn.name} — {fn.description || fn.taskIdentifier}
              </option>
            ))}
            {invocable.length === 0 && (
              <option disabled>No invocable functions</option>
            )}
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
        </div>
      </div>
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
        disabled={addJob.isPending || !taskId}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded text-sm text-white transition-colors"
      >
        <Send size={12} />
        {addJob.isPending ? 'Creating...' : 'Create Job'}
      </button>
    </div>
  );
}

function JobRow({ job }: { job: Job }) {
  const isLocked = !!job.lockedBy;
  const hasError = !!job.lastError;
  const age = timeSince(new Date(job.createdAt ?? ''));

  return (
    <div className="flex items-center gap-3 rounded border border-zinc-800 bg-zinc-900/30 px-3 py-2 text-sm">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-zinc-200">{job.taskIdentifier}</span>
          <span className="text-xs text-zinc-600">#{job.id}</span>
        </div>
        {hasError && (
          <div className="flex items-center gap-1 text-xs text-red-400 mt-0.5">
            <AlertCircle size={10} />
            <span className="truncate">{job.lastError}</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 text-xs text-zinc-500 shrink-0">
        <span>{job.attempts}/{job.maxAttempts}</span>
        {isLocked && (
          <span className="px-1.5 py-0.5 rounded bg-amber-900/50 text-amber-400">locked</span>
        )}
        <span className="flex items-center gap-1">
          <Clock size={10} />
          {age}
        </span>
      </div>
    </div>
  );
}

function timeSince(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}
