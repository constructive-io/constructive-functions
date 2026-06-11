import { compute } from '@constructive-functions/constructive-functions-hooks';
import { RefreshCw, CheckCircle, XCircle, Clock, Loader } from 'lucide-react';

const INVOCATION_FIELDS = {
  id: true,
  taskIdentifier: true,
  jobId: true,
  status: true,
  startedAt: true,
  completedAt: true,
  durationMs: true,
  error: true,
  createdAt: true,
} as const;

export function InvocationsPanel() {
  const { data, isLoading, refetch, isFetching } = compute.usePlatformFunctionInvocationsQuery({
    selection: {
      fields: INVOCATION_FIELDS,
      orderBy: ['CREATED_AT_DESC'],
    },
    refetchInterval: 3000,
  });

  const invocations = data?.platformFunctionInvocations?.nodes ?? [];
  const loading = isLoading || isFetching;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-300">Invocations</h2>
        <button
          onClick={() => refetch()}
          className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {invocations.map((inv) => (
          <InvocationRow key={inv.id} inv={inv} />
        ))}
        {!loading && invocations.length === 0 && (
          <p className="text-zinc-500 text-sm">No invocations yet. Trigger a job to see them here.</p>
        )}
      </div>
    </div>
  );
}

type InvocationNode = {
  id?: string | null;
  taskIdentifier?: string | null;
  jobId?: string | null;
  status?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  durationMs?: number | null;
  error?: string | null;
};

function InvocationRow({ inv }: { inv: InvocationNode }) {
  const status = inv.status ?? 'pending';
  const StatusIcon = {
    completed: CheckCircle,
    failed: XCircle,
    running: Loader,
    pending: Clock,
  }[status] || Clock;

  const statusColor = {
    completed: 'text-emerald-400',
    failed: 'text-red-400',
    running: 'text-blue-400',
    pending: 'text-zinc-500',
  }[status] || 'text-zinc-500';

  return (
    <div className="flex items-center gap-3 rounded border border-zinc-800 bg-zinc-900/30 px-3 py-2 text-sm">
      <StatusIcon size={14} className={`${statusColor} ${status === 'running' ? 'animate-spin' : ''}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-zinc-200">{inv.taskIdentifier}</span>
          <span className="text-xs text-zinc-600">job #{inv.jobId}</span>
        </div>
        {inv.error && (
          <p className="text-xs text-red-400 truncate mt-0.5">{inv.error}</p>
        )}
      </div>
      <div className="flex items-center gap-2 text-xs text-zinc-500 shrink-0">
        {inv.durationMs != null && <span>{inv.durationMs}ms</span>}
        <span className={`px-1.5 py-0.5 rounded ${statusColor} bg-zinc-800`}>
          {status}
        </span>
      </div>
    </div>
  );
}
