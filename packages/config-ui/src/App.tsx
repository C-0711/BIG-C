import { useState, useEffect } from 'react'
import { Bot, GitBranch, MessageSquare, Play, Send, Loader2, CheckCircle, XCircle, RefreshCw, Languages, FileText } from 'lucide-react'
import './App.css'

const API = 'http://localhost:7712'

interface Agent { id: string; name: string; role: string; }
interface Workflow { id: string; name: string; description?: string; nodes: any[]; }
interface Run { id: string; workflowId: string; status: string; startedAt?: string; }

function App() {
  const [tab, setTab] = useState<'agents' | 'workflows' | 'runs' | 'tools'>('agents')
  const [agents, setAgents] = useState<Agent[]>([])
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [runs, setRuns] = useState<Run[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState<{role: string; content: string}[]>([])
  const [chatLoading, setChatLoading] = useState(false)
  const [translateText, setTranslateText] = useState('')
  const [translateResult, setTranslateResult] = useState('')
  const [translateLang, setTranslateLang] = useState('en')

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchRuns, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [agentsRes, workflowsRes, runsRes] = await Promise.all([
        fetch(`${API}/api/agents`).then(r => r.json()),
        fetch(`${API}/api/workflows`).then(r => r.json()),
        fetch(`${API}/api/runs`).then(r => r.json()),
      ])
      setAgents(agentsRes.agents || [])
      setWorkflows(workflowsRes.workflows || [])
      setRuns(runsRes.runs || [])
    } catch (e) {
      console.error('Failed to fetch data')
    }
    setLoading(false)
  }

  const fetchRuns = async () => {
    try {
      const res = await fetch(`${API}/api/runs`).then(r => r.json())
      setRuns(res.runs || [])
    } catch {}
  }

  const runWorkflow = async (workflowId: string) => {
    try {
      await fetch(`${API}/api/workflows/${workflowId}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triggerData: {} })
      })
      fetchRuns()
    } catch {}
  }

  const sendChat = async () => {
    if (!chatInput.trim() || !selectedAgent) return
    const userMsg = { role: 'user', content: chatInput }
    setChatMessages(prev => [...prev, userMsg])
    setChatInput('')
    setChatLoading(true)
    
    try {
      const res = await fetch(`${API}/api/agents/${selectedAgent.id}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: chatInput })
      }).then(r => r.json())
      setChatMessages(prev => [...prev, { role: 'assistant', content: res.output || res.error || 'No response' }])
    } catch {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Error: Failed to get response' }])
    }
    setChatLoading(false)
  }

  const translate = async () => {
    if (!translateText.trim()) return
    setChatLoading(true)
    try {
      const res = await fetch(`${API}/api/bosch/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: translateText, targetLanguage: translateLang })
      }).then(r => r.json())
      setTranslateResult(res.output || res.error || 'No result')
    } catch {
      setTranslateResult('Error')
    }
    setChatLoading(false)
  }

  const boschAgents = agents.filter(a => a.name.includes('Bosch') || a.name.includes('SEO') || a.name.includes('Quality') || a.name.includes('Translator'))

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <span className="logo-icon">⚡</span>
          <span>Bosch Intelligence</span>
        </div>
        <div className="subtitle">Powered by 0711-C</div>
      </header>

      <nav className="tabs">
        <button className={tab === 'agents' ? 'active' : ''} onClick={() => setTab('agents')}>
          <Bot size={18} /> Agents
        </button>
        <button className={tab === 'workflows' ? 'active' : ''} onClick={() => setTab('workflows')}>
          <GitBranch size={18} /> Workflows
        </button>
        <button className={tab === 'runs' ? 'active' : ''} onClick={() => setTab('runs')}>
          <FileText size={18} /> Run History
        </button>
        <button className={tab === 'tools' ? 'active' : ''} onClick={() => setTab('tools')}>
          <Languages size={18} /> Tools
        </button>
        <button className="refresh" onClick={fetchData} disabled={loading}>
          <RefreshCw size={18} className={loading ? 'spin' : ''} />
        </button>
      </nav>

      <main className="content">
        {tab === 'agents' && (
          <div className="agents-view">
            <div className="agents-list">
              <h2>Bosch Agents</h2>
              {boschAgents.map(agent => (
                <div 
                  key={agent.id} 
                  className={`agent-card ${selectedAgent?.id === agent.id ? 'selected' : ''}`}
                  onClick={() => { setSelectedAgent(agent); setChatMessages([]); }}
                >
                  <Bot size={24} />
                  <div>
                    <div className="agent-name">{agent.name}</div>
                    <div className="agent-role">{agent.role}</div>
                  </div>
                  <MessageSquare size={18} />
                </div>
              ))}
            </div>
            
            <div className="chat-panel">
              {selectedAgent ? (
                <>
                  <div className="chat-header">
                    <Bot size={24} />
                    <div>
                      <div className="chat-agent-name">{selectedAgent.name}</div>
                      <div className="chat-agent-role">{selectedAgent.role}</div>
                    </div>
                  </div>
                  <div className="chat-messages">
                    {chatMessages.length === 0 && (
                      <div className="chat-empty">Start a conversation with {selectedAgent.name}</div>
                    )}
                    {chatMessages.map((msg, i) => (
                      <div key={i} className={`message ${msg.role}`}>
                        {msg.content}
                      </div>
                    ))}
                    {chatLoading && <div className="message assistant"><Loader2 className="spin" size={20} /></div>}
                  </div>
                  <div className="chat-input">
                    <input
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && sendChat()}
                      placeholder="Type a message..."
                    />
                    <button onClick={sendChat} disabled={chatLoading || !chatInput.trim()}>
                      <Send size={18} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="chat-empty">Select an agent to start chatting</div>
              )}
            </div>
          </div>
        )}

        {tab === 'workflows' && (
          <div className="workflows-view">
            <h2>Bosch Workflows</h2>
            <div className="workflows-grid">
              {workflows.map(wf => (
                <div key={wf.id} className="workflow-card">
                  <div className="workflow-header">
                    <GitBranch size={24} />
                    <div>
                      <div className="workflow-name">{wf.name}</div>
                      <div className="workflow-nodes">{wf.nodes.length} nodes</div>
                    </div>
                  </div>
                  <div className="workflow-desc">{wf.description || 'No description'}</div>
                  <button className="run-btn" onClick={() => runWorkflow(wf.id)}>
                    <Play size={16} /> Run
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'runs' && (
          <div className="runs-view">
            <h2>Run History</h2>
            <table className="runs-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Workflow</th>
                  <th>Started</th>
                </tr>
              </thead>
              <tbody>
                {runs.length === 0 && (
                  <tr><td colSpan={3} className="empty">No runs yet</td></tr>
                )}
                {runs.map(run => (
                  <tr key={run.id}>
                    <td>
                      {run.status === 'completed' && <CheckCircle size={18} className="success" />}
                      {run.status === 'failed' && <XCircle size={18} className="error" />}
                      {run.status === 'running' && <Loader2 size={18} className="spin" />}
                      {run.status}
                    </td>
                    <td>{workflows.find(w => w.id === run.workflowId)?.name || run.workflowId}</td>
                    <td>{run.startedAt ? new Date(run.startedAt).toLocaleString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'tools' && (
          <div className="tools-view">
            <h2>Quick Tools</h2>
            
            <div className="tool-card">
              <h3><Languages size={20} /> Translate</h3>
              <div className="translate-form">
                <textarea
                  value={translateText}
                  onChange={e => setTranslateText(e.target.value)}
                  placeholder="Enter text to translate..."
                  rows={3}
                />
                <div className="translate-controls">
                  <select value={translateLang} onChange={e => setTranslateLang(e.target.value)}>
                    <option value="en">German → English</option>
                    <option value="de">English → German</option>
                  </select>
                  <button onClick={translate} disabled={chatLoading || !translateText.trim()}>
                    {chatLoading ? <Loader2 className="spin" size={16} /> : 'Translate'}
                  </button>
                </div>
                {translateResult && (
                  <div className="translate-result">{translateResult}</div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
