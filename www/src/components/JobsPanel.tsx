import { useState } from 'react';
import { RefreshCw, Plus, Send, Clock, AlertCircle } from 'lucide-react';
import { useJobsQuery, useAddJobMutation } from '../generated/hooks';
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
          <p className="text-zinc-500 text-sm">No jobs yet.</p>
        )}
      </div>
    </div>
  );
}

function NewJobForm({ onCreated }: { onCreated: () => void }) {
  const [taskId, setTaskId] = useState('send-email');
  const [to, setTo] = useState('test@example.com');
  const [subject, setSubject] = useState('Hello from Platform UI');
  const [html, setHtml] = useState('<p>Test email from the constructive platform UI</p>');

  const addJob = useAddJobMutation({
    selection: {
      fields: {
        result: { select: { id: true } },
      },
    },
    onSuccess: () => onCreated(),
  });

  const submit = () => {
    addJob.mutate({ input: { identifier: taskId, payload: { to, subject, html } } });
  };

  return (
    <div className="border-b border-zinc-800 p-4 space-y-3 bg-zinc-900/50">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-zinc-500 mb-1">Task</label>
          <select
            value={taskId}
            onChange={(e) => setTaskId(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="send-email">send-email</option>
            <option value="send-verification-link">send-verification-link</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-1">To</label>
          <input
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs text-zinc-500 mb-1">Subject</label>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-xs text-zinc-500 mb-1">HTML Body</label>
        <textarea
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          rows={3}
          className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
        />
      </div>
      <button
        onClick={submit}
        disabled={addJob.isPending}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded text-sm text-white transition-colors"
      >
        <Send size={12} />
        {addJob.isPending ? 'Sending...' : 'Create Job'}
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
