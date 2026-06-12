import { useState } from 'react';
import { compute } from '@constructive-functions/constructive-functions-hooks';
import { RefreshCw, BarChart3, Clock, CheckCircle, XCircle, Activity } from 'lucide-react';

const USAGE_DAILY_FIELDS = {
  id: true,
  taskIdentifier: true,
  date: true,
  totalCalls: true,
  successful: true,
  failed: true,
  totalDurationMs: true,
  minDurationMs: true,
  maxDurationMs: true,
} as const;

const COMPUTE_LOG_FIELDS = {
  id: true,
  taskIdentifier: true,
  status: true,
  durationMs: true,
  completedAt: true,
  jobId: true,
  error: true,
} as const;

type ViewMode = 'daily' | 'log';

export function UsagePanel() {
  const [view, setView] = useState<ViewMode>('daily');

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-zinc-300">Usage</h2>
          <div className="flex items-center gap-1 bg-zinc-900 rounded p-0.5">
            <button
              onClick={() => setView('daily')}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                view === 'daily' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Daily Rollup
            </button>
            <button
              onClick={() => setView('log')}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                view === 'log' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Raw Log
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        {view === 'daily' ? <DailyView /> : <LogView />}
      </div>
    </div>
  );
}

function DailyView() {
  const { data, isLoading, refetch, isFetching } = compute.usePlatformUsageDailiesQuery({
    selection: {
      fields: USAGE_DAILY_FIELDS,
      orderBy: ['DATE_DESC'],
    },
    refetchInterval: 5000,
  });

  const rows = data?.platformUsageDailies?.nodes ?? [];
  const loading = isLoading || isFetching;

  const totals = rows.reduce(
    (acc, r) => ({
      calls: acc.calls + (Number(r.totalCalls) || 0),
      ok: acc.ok + (Number(r.successful) || 0),
      fail: acc.fail + (Number(r.failed) || 0),
      ms: acc.ms + (Number(r.totalDurationMs) || 0),
    }),
    { calls: 0, ok: 0, fail: 0, ms: 0 }
  );

  return (
    <div className="flex flex-col h-full">
      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-3 px-4 py-3 border-b border-zinc-800">
        <SummaryCard icon={Activity} label="Total Calls" value={totals.calls} />
        <SummaryCard icon={CheckCircle} label="Successful" value={totals.ok} color="text-emerald-400" />
        <SummaryCard icon={XCircle} label="Failed" value={totals.fail} color="text-red-400" />
        <SummaryCard icon={Clock} label="Total Duration" value={`${(totals.ms / 1000).toFixed(1)}s`} />
      </div>

      {/* Table */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800">
        <span className="text-xs text-zinc-500">{rows.length} day(s)</span>
        <button
          onClick={() => refetch()}
          className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-zinc-500 border-b border-zinc-800">
              <th className="text-left px-4 py-2 font-medium">Date</th>
              <th className="text-left px-4 py-2 font-medium">Function</th>
              <th className="text-right px-4 py-2 font-medium">Calls</th>
              <th className="text-right px-4 py-2 font-medium">OK</th>
              <th className="text-right px-4 py-2 font-medium">Fail</th>
              <th className="text-right px-4 py-2 font-medium">Avg (ms)</th>
              <th className="text-right px-4 py-2 font-medium">Min</th>
              <th className="text-right px-4 py-2 font-medium">Max</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const calls = Number(r.totalCalls) || 0;
              const avg = calls > 0 ? Math.round((Number(r.totalDurationMs) || 0) / calls) : 0;
              return (
                <tr key={r.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/30">
                  <td className="px-4 py-2 text-zinc-300 font-mono">{r.date}</td>
                  <td className="px-4 py-2 text-zinc-200 font-mono">{r.taskIdentifier}</td>
                  <td className="px-4 py-2 text-right text-zinc-300">{calls}</td>
                  <td className="px-4 py-2 text-right text-emerald-400">{r.successful}</td>
                  <td className="px-4 py-2 text-right text-red-400">{r.failed}</td>
                  <td className="px-4 py-2 text-right text-zinc-400">{avg}</td>
                  <td className="px-4 py-2 text-right text-zinc-500">{r.minDurationMs ?? '—'}</td>
                  <td className="px-4 py-2 text-right text-zinc-500">{r.maxDurationMs ?? '—'}</td>
                </tr>
              );
            })}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-zinc-500">
                  No usage data yet. Dispatch a job to start tracking.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LogView() {
  const { data, isLoading, refetch, isFetching } = compute.usePlatformComputeLogsQuery({
    selection: {
      fields: COMPUTE_LOG_FIELDS,
      orderBy: ['COMPLETED_AT_DESC'],
    },
    refetchInterval: 3000,
  });

  const logs = data?.platformComputeLogs?.nodes ?? [];
  const loading = isLoading || isFetching;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800">
        <span className="text-xs text-zinc-500">{logs.length} log entry(ies)</span>
        <button
          onClick={() => refetch()}
          className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {logs.map((entry) => (
          <LogRow key={entry.id} entry={entry} />
        ))}
        {!loading && logs.length === 0 && (
          <p className="text-zinc-500 text-sm">No compute log entries yet. Dispatch a job to start logging.</p>
        )}
      </div>
    </div>
  );
}

type LogNode = {
  id?: string | null;
  taskIdentifier?: string | null;
  status?: string | null;
  durationMs?: number | null;
  completedAt?: string | null;
  jobId?: string | null;
  error?: string | null;
};

function LogRow({ entry }: { entry: LogNode }) {
  const status = entry.status ?? 'unknown';
  const isOk = status === 'completed';

  return (
    <div className="flex items-center gap-3 rounded border border-zinc-800 bg-zinc-900/30 px-3 py-2 text-sm">
      {isOk ? (
        <CheckCircle size={14} className="text-emerald-400 shrink-0" />
      ) : (
        <XCircle size={14} className="text-red-400 shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-zinc-200">{entry.taskIdentifier}</span>
          <span className="text-xs text-zinc-600">job #{entry.jobId}</span>
        </div>
        {entry.error && (
          <p className="text-xs text-red-400 truncate mt-0.5">{entry.error}</p>
        )}
      </div>
      <div className="flex items-center gap-2 text-xs text-zinc-500 shrink-0">
        {entry.durationMs != null && <span>{entry.durationMs}ms</span>}
        {entry.completedAt && (
          <span>{new Date(entry.completedAt).toLocaleTimeString()}</span>
        )}
        <span className={`px-1.5 py-0.5 rounded ${isOk ? 'text-emerald-400' : 'text-red-400'} bg-zinc-800`}>
          {status}
        </span>
      </div>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  color = 'text-zinc-200',
}: {
  icon: typeof BarChart3;
  label: string;
  value: number | string;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded border border-zinc-800 bg-zinc-900/30 px-3 py-2">
      <Icon size={14} className="text-zinc-500 shrink-0" />
      <div>
        <div className={`text-sm font-semibold ${color}`}>{value}</div>
        <div className="text-xs text-zinc-500">{label}</div>
      </div>
    </div>
  );
}
