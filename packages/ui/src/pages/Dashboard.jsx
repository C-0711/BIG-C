import { useConfig } from '../config/ConfigProvider';
import { Link } from 'react-router-dom';

function KPICard({ icon, label, value, color }) {
  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 border border-gray-200 dark:border-white/10">
      <div className="flex items-center gap-4">
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
          style={{ background: `${color}20` }}
        >
          {icon}
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon, title, desc, path }) {
  return (
    <Link 
      to={path}
      className="bg-white dark:bg-[#1a1a1a] rounded-xl p-5 border border-gray-200 dark:border-white/10 hover:border-green-500 dark:hover:border-green-500 transition-colors group"
    >
      <div className="text-3xl mb-3">{icon}</div>
      <div className="font-semibold text-gray-900 dark:text-white group-hover:text-green-500 transition-colors">{title}</div>
      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{desc}</div>
    </Link>
  );
}

function RecentActivity({ activities }) {
  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200 dark:border-white/10">
        <h3 className="font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-white/5">
        {activities.map((a, i) => (
          <div key={i} className="px-5 py-3 flex items-center gap-3">
            <span className="text-lg">{a.icon}</span>
            <div className="flex-1">
              <div className="text-sm text-gray-900 dark:text-white">{a.title}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{a.time}</div>
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
    { icon: '🤖', label: 'Active Agents', value: agents.length, color: branding.primaryColor || '#22c55e' },
    { icon: '⚡', label: 'Workflows', value: workflows.length, color: '#3b82f6' },
    { icon: '🔌', label: 'Data Sources', value: dataSources.length, color: '#8b5cf6' },
    { icon: '📤', label: 'Outputs', value: outputs.length, color: '#f59e0b' },
    { icon: '✨', label: 'Skills', value: skills.bundled.length + skills.workspace.length, color: '#ec4899' },
  ];

  const quickActions = [
    { icon: '💬', title: 'Chat with Agent', desc: 'Start a conversation', path: '/' },
    { icon: '📊', title: 'View Reports', desc: 'Analytics & insights', path: '/reports' },
    { icon: '⚡', title: 'Run Workflow', desc: 'Execute automation', path: '/automation' },
    { icon: '🔌', title: 'Integrations', desc: 'Manage connections', path: '/integrations' },
  ];

  const recentActivity = [
    { icon: '✅', title: 'Quality check completed', time: '5 min ago' },
    { icon: '📥', title: 'Data sync finished', time: '12 min ago' },
    { icon: '🤖', title: 'Agent product-expert initialized', time: '1 hour ago' },
    { icon: '⚡', title: 'Workflow triggered', time: '2 hours ago' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {instance.name || '0711-C Intelligence'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
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

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        {dashboard.showQuickActions !== false && (
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {quickActions.map((action, i) => (
                <QuickAction key={i} {...action} />
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {dashboard.showRecentActivity !== false && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Activity</h2>
            <RecentActivity activities={recentActivity} />
          </div>
        )}
      </div>

      {/* Agents Overview */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Agents</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {agents.map(agent => (
            <Link
              key={agent.id}
              to={`/workspaces`}
              className="bg-white dark:bg-[#1a1a1a] rounded-xl p-5 border border-gray-200 dark:border-white/10 hover:border-green-500 dark:hover:border-green-500 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{agent.identity?.emoji || '🤖'}</span>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {agent.identity?.name || agent.id}
                  </div>
                  <div className="text-xs text-green-500">● Active</div>
                </div>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {agent.skills?.length || 0} skills · {agent.dataSources?.length || 0} sources
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Admin Link */}
      <div className="mt-8 p-4 bg-gray-100 dark:bg-white/5 rounded-xl text-center">
        <a 
          href="/admin" 
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-green-500 transition-colors"
        >
          ⚙️ Open Admin Dashboard for advanced configuration
        </a>
      </div>
    </div>
  );
}
