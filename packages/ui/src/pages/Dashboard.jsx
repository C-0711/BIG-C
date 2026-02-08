import { useConfig } from '../config/ConfigProvider';
import { Link } from 'react-router-dom';
import { 
  Bot, Zap, Plug, Upload, Sparkles, MessageSquare, 
  FileText, CheckCircle, Download, Settings 
} from 'lucide-react';

function KPICard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-[#1e1e28] rounded-xl p-6 border border-[#2a2a3a]">
      <div className="flex items-center gap-4">
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ background: `${color}20` }}
        >
          <Icon size={24} style={{ color }} />
        </div>
        <div>
          <div className="text-2xl font-bold text-white">{value}</div>
          <div className="text-sm text-gray-400">{label}</div>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, title, desc, path }) {
  return (
    <Link 
      to={path}
      className="bg-[#1e1e28] rounded-xl p-5 border border-[#2a2a3a] hover:border-green-500 transition-colors group"
    >
      <div className="mb-3 text-gray-400 group-hover:text-green-400 transition-colors">
        <Icon size={28} />
      </div>
      <div className="font-semibold text-white group-hover:text-green-400 transition-colors">{title}</div>
      <div className="text-sm text-gray-500 mt-1">{desc}</div>
    </Link>
  );
}

function RecentActivity({ activities }) {
  return (
    <div className="bg-[#1e1e28] rounded-xl border border-[#2a2a3a] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#2a2a3a] bg-[#16161e]">
        <h3 className="font-semibold text-white">Recent Activity</h3>
      </div>
      <div className="divide-y divide-[#2a2a3a]">
        {activities.map((a, i) => (
          <div key={i} className="px-5 py-3 flex items-center gap-3">
            <span className="text-gray-400">{a.icon}</span>
            <div className="flex-1">
              <div className="text-sm text-white">{a.title}</div>
              <div className="text-xs text-gray-500">{a.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { 
    config, 
    loading, 
    getInstance, 
    getEnabledAgents, 
    getEnabledWorkflows, 
    getDataSources,
    getOutputs,
    getSkills,
    getDashboard,
    getBranding
  } = useConfig();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
      </div>
    );
  }

  const instance = getInstance();
  const agents = getEnabledAgents();
  const workflows = getEnabledWorkflows();
  const dataSources = getDataSources();
  const outputs = getOutputs();
  const skills = getSkills();
  const dashboard = getDashboard();
  const branding = getBranding();

  const kpis = [
    { icon: Bot, label: 'Active Agents', value: agents.length, color: branding.primaryColor || '#22c55e' },
    { icon: Zap, label: 'Workflows', value: workflows.length, color: '#3b82f6' },
    { icon: Plug, label: 'Data Sources', value: dataSources.length, color: '#8b5cf6' },
    { icon: Upload, label: 'Outputs', value: outputs.length, color: '#f59e0b' },
    { icon: Sparkles, label: 'Skills', value: skills.bundled.length + skills.workspace.length, color: '#ec4899' },
  ];

  const quickActions = [
    { icon: MessageSquare, title: 'Chat with Agent', desc: 'Start a conversation', path: '/' },
    { icon: FileText, title: 'View Reports', desc: 'Analytics & insights', path: '/reports' },
    { icon: Zap, title: 'Run Workflow', desc: 'Execute automation', path: '/automation' },
    { icon: Plug, title: 'Integrations', desc: 'Manage connections', path: '/integrations' },
  ];

  const recentActivity = [
    { icon: <CheckCircle size={18} className="text-green-500" />, title: 'Quality check completed', time: '5 min ago' },
    { icon: <Download size={18} className="text-blue-500" />, title: 'Data sync finished', time: '12 min ago' },
    { icon: <Bot size={18} className="text-green-500" />, title: 'Agent product-expert initialized', time: '1 hour ago' },
    { icon: <Zap size={18} className="text-yellow-500" />, title: 'Workflow triggered', time: '2 hours ago' },
  ];

  return (
    <div className="p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          {instance.name || '0711-C Intelligence'}
        </h1>
        <p className="text-gray-400 mt-1">
          Welcome back! Here's your intelligence overview.
        </p>
      </div>

      {/* KPIs */}
      {dashboard.showKPIs !== false && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {kpis.map((kpi, i) => (
            <KPICard key={i} {...kpi} />
          ))}
        </div>
      )}

      {/* Quick Actions */}
      {dashboard.showQuickActions !== false && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, i) => (
              <QuickAction key={i} {...action} />
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity */}
        <div className="lg:col-span-2">
          <RecentActivity activities={recentActivity} />
        </div>

        {/* Agents List */}
        <div className="bg-[#1e1e28] rounded-xl border border-[#2a2a3a] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#2a2a3a] bg-[#16161e]">
            <h3 className="font-semibold text-white">Your Agents</h3>
          </div>
          <div className="divide-y divide-[#2a2a3a]">
            {agents.slice(0, 5).map((agent) => (
              <div key={agent.id} className="px-5 py-3 flex items-center gap-3">
                <span className="text-green-500">
                  <Bot size={20} />
                </span>
                <div className="flex-1">
                  <div className="text-sm text-white font-medium">
                    {agent.identity?.displayName || agent.id}
                  </div>
                  <div className="text-xs text-gray-500">
                    {agent.enabled !== false ? 'Active' : 'Disabled'}
                  </div>
                </div>
                <span className={`w-2 h-2 rounded-full ${agent.enabled !== false ? 'bg-green-500' : 'bg-gray-500'}`} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Admin Link */}
      <div className="mt-8 text-center">
        <a 
          href="/admin" 
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          <Settings size={16} /> Open Admin Dashboard for advanced configuration
        </a>
      </div>
    </div>
  );
}
