import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useConfig } from '../config/ConfigProvider';

export default function AgentChat() {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const { config, getEnabledAgents } = useConfig();
  const messagesEndRef = useRef(null);
  
  const agents = getEnabledAgents();
  const agent = agents.find(a => a.id === agentId);
  
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', content: `Hallo! Ich bin ${agent?.identity?.name || agentId}. Wie kann ich Ihnen helfen?` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!agent) {
    return (
      <div className="chat-container">
        <div className="chat-error">
          <h2>Agent nicht gefunden</h2>
          <p>Der Agent "{agentId}" existiert nicht oder ist deaktiviert.</p>
          <button onClick={() => navigate('/dashboard')}>Zurück zum Dashboard</button>
        </div>
      </div>
    );
  }

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = { id: Date.now(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const responses = [
        `Ich verstehe Ihre Anfrage bezüglich "${input.slice(0, 30)}...". Lassen Sie mich das für Sie prüfen.`,
        `Basierend auf den verfügbaren Daten kann ich Ihnen folgendes mitteilen...`,
        `Gute Frage! Hier sind die relevanten Informationen zu diesem Thema.`,
      ];
      const aiMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)]
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <div className="agent-info">
          <span className="agent-emoji">{agent.identity?.emoji || '🤖'}</span>
          <div>
            <h2>{agent.identity?.name || agent.id}</h2>
            <span className="agent-status">● Online</span>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-icon" title="Verlauf löschen">🗑️</button>
          <button className="btn-icon" title="Einstellungen">⚙️</button>
        </div>
      </div>

      {/* Agent Info Bar */}
      <div className="agent-bar">
        <span className="tag">Model: {agent.model || 'default'}</span>
        <span className="tag">Skills: {(agent.skills || []).length}</span>
        <span className="tag">Datenquellen: {(agent.dataSources || []).length}</span>
      </div>

      {/* Messages */}
      <div className="messages-container">
        {messages.map(msg => (
          <div key={msg.id} className={`message ${msg.role}`}>
            {msg.role === 'assistant' && (
              <span className="message-avatar">{agent.identity?.emoji || '🤖'}</span>
            )}
            <div className="message-content">
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="message assistant">
            <span className="message-avatar">{agent.identity?.emoji || '🤖'}</span>
            <div className="message-content typing">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="input-container">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={`Nachricht an ${agent.identity?.name || agent.id}...`}
          rows={1}
        />
        <button className="send-btn" onClick={handleSend} disabled={!input.trim()}>
          Senden
        </button>
      </div>

      <style>{`
        .chat-container { display: flex; flex-direction: column; height: 100%; background: #0a0a0a; }
        
        .chat-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 24px; border-bottom: 1px solid #333; background: #111; }
        .agent-info { display: flex; align-items: center; gap: 12px; }
        .agent-emoji { font-size: 36px; }
        .agent-info h2 { margin: 0; font-size: 18px; }
        .agent-status { font-size: 12px; color: #22c55e; }
        .header-actions { display: flex; gap: 8px; }
        .btn-icon { background: none; border: none; font-size: 20px; cursor: pointer; padding: 8px; border-radius: 8px; }
        .btn-icon:hover { background: #222; }
        
        .agent-bar { display: flex; gap: 12px; padding: 12px 24px; background: #151515; border-bottom: 1px solid #222; }
        .tag { font-size: 12px; color: #888; background: #222; padding: 4px 10px; border-radius: 4px; }
        
        .messages-container { flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 16px; }
        
        .message { display: flex; gap: 12px; max-width: 80%; }
        .message.user { align-self: flex-end; flex-direction: row-reverse; }
        .message-avatar { font-size: 24px; flex-shrink: 0; }
        .message-content { padding: 12px 16px; border-radius: 16px; line-height: 1.5; }
        .message.assistant .message-content { background: #1a1a1a; border: 1px solid #333; }
        .message.user .message-content { background: #22c55e; color: #000; }
        
        .typing { display: flex; gap: 4px; padding: 16px 20px; }
        .dot { width: 8px; height: 8px; background: #666; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out; }
        .dot:nth-child(1) { animation-delay: -0.32s; }
        .dot:nth-child(2) { animation-delay: -0.16s; }
        @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
        
        .input-container { display: flex; gap: 12px; padding: 16px 24px; border-top: 1px solid #333; background: #111; }
        textarea { flex: 1; background: #1a1a1a; border: 1px solid #333; border-radius: 12px; padding: 12px 16px; color: #fff; font-size: 14px; resize: none; font-family: inherit; }
        textarea:focus { outline: none; border-color: #22c55e; }
        .send-btn { background: #22c55e; color: #000; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 600; cursor: pointer; }
        .send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        
        .chat-error { text-align: center; padding: 48px; }
        .chat-error button { margin-top: 16px; padding: 10px 20px; background: #333; border: none; color: #fff; border-radius: 8px; cursor: pointer; }
      `}</style>
    </div>
  );
}
