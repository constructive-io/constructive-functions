import { useState } from 'react';
import { StatusBar } from './components/StatusBar';
import { FunctionsPanel } from './components/FunctionsPanel';
import { SecretsPanel } from './components/SecretsPanel';
import { JobsPanel } from './components/JobsPanel';
import { InvocationsPanel } from './components/InvocationsPanel';
import { K8sPanel } from './components/K8sPanel';
import { FlowsPanel } from './components/FlowsPanel';
import { UsagePanel } from './components/UsagePanel';
import { Terminal } from './components/Terminal';
import { CommandBar } from './components/CommandBar';
import { TerminalSquare, Cpu, Key, Briefcase, Activity, Wrench, Container, Workflow, BarChart3 } from 'lucide-react';

type Tab = 'functions' | 'flows' | 'secrets' | 'jobs' | 'invocations' | 'usage' | 'k8s' | 'commands' | 'terminal';

const TABS: { id: Tab; label: string; icon: typeof Cpu }[] = [
  { id: 'functions', label: 'Functions', icon: Cpu },
  { id: 'flows', label: 'Flows', icon: Workflow },
  { id: 'secrets', label: 'Secrets', icon: Key },
  { id: 'jobs', label: 'Jobs', icon: Briefcase },
  { id: 'invocations', label: 'Invocations', icon: Activity },
  { id: 'usage', label: 'Usage', icon: BarChart3 },
  { id: 'k8s', label: 'K8s', icon: Container },
  { id: 'commands', label: 'Commands', icon: Wrench },
  { id: 'terminal', label: 'Terminal', icon: TerminalSquare },
];

export function App() {
  const [activeTab, setActiveTab] = useState<Tab>('functions');

  const navigateToTab = (tab: Tab) => setActiveTab(tab);

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800 bg-zinc-950">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <h1 className="text-sm font-semibold text-zinc-200 tracking-tight">
            Constructive Platform
          </h1>
        </div>
        <nav className="flex items-center gap-1 ml-6">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                activeTab === id
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </nav>
      </header>

      <StatusBar />

      <main className="flex-1 overflow-hidden">
        {activeTab === 'functions' && <FunctionsPanel onNavigate={navigateToTab} />}
        {activeTab === 'flows' && <FlowsPanel />}
        {activeTab === 'secrets' && <SecretsPanel />}
        {activeTab === 'jobs' && <JobsPanel />}
        {activeTab === 'invocations' && <InvocationsPanel />}
        {activeTab === 'usage' && <UsagePanel />}
        {activeTab === 'k8s' && <K8sPanel />}
        {activeTab === 'commands' && (
          <div className="p-4 h-full overflow-y-auto">
            <CommandBar />
          </div>
        )}
        {activeTab === 'terminal' && <Terminal />}
      </main>
    </div>
  );
}
