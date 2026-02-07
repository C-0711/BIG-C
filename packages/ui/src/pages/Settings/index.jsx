import { useState } from "react";
import { Settings as SettingsIcon, Database, Bot, GitBranch, Wrench, Palette } from "lucide-react";

const TABS = [
  { id: "general", label: "General", Icon: SettingsIcon },
  { id: "datasources", label: "Data Sources", Icon: Database },
  { id: "agents", label: "Agents", Icon: Bot },
  { id: "workflows", label: "Workflows", Icon: GitBranch },
  { id: "tools", label: "Tools", Icon: Wrench },
  { id: "branding", label: "Branding", Icon: Palette },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("datasources");

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <header className="bg-white border-b border-[#e2e8f0] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[#1e293b]">Settings</h1>
            <p className="text-sm text-[#64748b]">Configure your intelligence platform</p>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Tabs */}
        <nav className="w-56 bg-white border-r border-[#e2e8f0] min-h-[calc(100vh-73px)]">
          <div className="p-4">
            {TABS.map((tab) => {
              const Icon = tab.Icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-left transition-colors
                    ${activeTab === tab.id 
                      ? "bg-[#0066cc] text-white" 
                      : "text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#1e293b]"
                    }`}
                >
                  <Icon size={18} />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Content */}
        <main className="flex-1 p-6">
          {activeTab === "datasources" && <DataSourcesTab />}
          {activeTab === "agents" && <AgentsTab />}
          {activeTab === "workflows" && <WorkflowsTab />}
          {activeTab === "tools" && <ToolsTab />}
          {activeTab === "general" && <GeneralTab />}
          {activeTab === "branding" && <BrandingTab />}
        </main>
      </div>
    </div>
  );
}

function DataSourcesTab() {
  const [sources] = useState([]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-[#1e293b]">Data Sources</h2>
          <p className="text-sm text-[#64748b]">Connect and manage your data sources</p>
        </div>
        <button className="px-4 py-2 bg-[#0066cc] text-white rounded-lg hover:bg-[#0052a3] flex items-center gap-2">
          <Database size={18} />
          Add Data Source
        </button>
      </div>

      {sources.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-12 text-center">
          <Database size={48} className="mx-auto text-[#94a3b8] mb-4" />
          <h3 className="text-lg font-medium text-[#1e293b] mb-2">No data sources connected</h3>
          <p className="text-[#64748b] mb-6">Connect your first data source to start importing data</p>
          <button className="px-6 py-3 bg-[#0066cc] text-white rounded-lg hover:bg-[#0052a3]">
            Add Your First Data Source
          </button>
          <div className="mt-8 grid grid-cols-4 gap-4 max-w-2xl mx-auto">
            {["CSV / Excel", "REST API", "PostgreSQL", "BMEcat"].map((type) => (
              <div key={type} className="p-4 border border-[#e2e8f0] rounded-lg text-center hover:border-[#0066cc] cursor-pointer transition-colors">
                <div className="text-sm font-medium text-[#64748b]">{type}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Source list would go here */}
        </div>
      )}
    </div>
  );
}

function AgentsTab() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-[#1e293b]">Agents</h2>
          <p className="text-sm text-[#64748b]">Configure AI agents for your workflows</p>
        </div>
        <button className="px-4 py-2 bg-[#0066cc] text-white rounded-lg hover:bg-[#0052a3] flex items-center gap-2">
          <Bot size={18} />
          Create Agent
        </button>
      </div>
      <div className="bg-white rounded-xl border border-[#e2e8f0] p-12 text-center">
        <Bot size={48} className="mx-auto text-[#94a3b8] mb-4" />
        <h3 className="text-lg font-medium text-[#1e293b] mb-2">No agents configured</h3>
        <p className="text-[#64748b]">Create agents to power your intelligence workflows</p>
      </div>
    </div>
  );
}

function WorkflowsTab() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-[#1e293b]">Workflows</h2>
          <p className="text-sm text-[#64748b]">Build automated data processing pipelines</p>
        </div>
        <button className="px-4 py-2 bg-[#0066cc] text-white rounded-lg hover:bg-[#0052a3] flex items-center gap-2">
          <GitBranch size={18} />
          Create Workflow
        </button>
      </div>
      <div className="bg-white rounded-xl border border-[#e2e8f0] p-12 text-center">
        <GitBranch size={48} className="mx-auto text-[#94a3b8] mb-4" />
        <h3 className="text-lg font-medium text-[#1e293b] mb-2">No workflows created</h3>
        <p className="text-[#64748b]">Create workflows to automate your data processing</p>
      </div>
    </div>
  );
}

function ToolsTab() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-[#1e293b]">Tools & MCP</h2>
          <p className="text-sm text-[#64748b]">Connect external tools via MCP</p>
        </div>
        <button className="px-4 py-2 bg-[#0066cc] text-white rounded-lg hover:bg-[#0052a3] flex items-center gap-2">
          <Wrench size={18} />
          Add Tool
        </button>
      </div>
      <div className="bg-white rounded-xl border border-[#e2e8f0] p-12 text-center">
        <Wrench size={48} className="mx-auto text-[#94a3b8] mb-4" />
        <h3 className="text-lg font-medium text-[#1e293b] mb-2">No tools connected</h3>
        <p className="text-[#64748b]">Connect MCP servers to extend agent capabilities</p>
      </div>
    </div>
  );
}

function GeneralTab() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-[#1e293b] mb-6">General Settings</h2>
      <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-[#1e293b] mb-2">Instance Name</label>
          <input type="text" defaultValue="My Intelligence" 
            className="w-full px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#0066cc]" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1e293b] mb-2">API Base URL</label>
          <input type="text" defaultValue="/api" 
            className="w-full px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#0066cc]" />
        </div>
      </div>
    </div>
  );
}

function BrandingTab() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-[#1e293b] mb-6">Branding</h2>
      <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-[#1e293b] mb-2">Display Name</label>
          <input type="text" defaultValue="Intelligence" 
            className="w-full px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#0066cc]" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1e293b] mb-2">Primary Color</label>
          <div className="flex gap-3">
            <input type="color" defaultValue="#0066cc" className="w-12 h-10 rounded border border-[#e2e8f0]" />
            <input type="text" defaultValue="#0066cc" 
              className="flex-1 px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#0066cc]" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1e293b] mb-2">Logo</label>
          <div className="border-2 border-dashed border-[#e2e8f0] rounded-lg p-8 text-center">
            <p className="text-[#64748b]">Drop logo here or click to upload</p>
          </div>
        </div>
      </div>
    </div>
  );
}
