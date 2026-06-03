import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { chatApi, authApi } from '../services/api';
import ThemeToggle from '../components/ThemeToggle';
import ReactMarkdown from 'react-markdown';

export default function Chat({ theme, toggleTheme }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await authApi.getMe();
        setUserEmail(data.email);
      } catch {
        navigate('/auth');
      }
    };
    fetchUser();
  }, [navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const suggestions = useMemo(() => [
    { label: 'Programme semaine', text: 'Programme musculation cette semaine' },
    { label: 'Calories', text: 'Calculer mes calories' },
    { label: 'Biceps', text: 'Exercices pour les biceps' },
    { label: 'Perte de poids', text: 'Plan pour perdre de la graisse' },
  ], []);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const toggleHistory = () => setHistoryOpen(prev => !prev);
  const handleClearHistory = () => {
    setMessages([]);
    setSessionId(null);
    setHistoryOpen(false);
  };

  const historyItems = useMemo(
    () => messages.filter(m => m.role === 'user').slice(-5).reverse(),
    [messages]
  );

  const handleSendMessage = async (text) => {
    const messageText = text || input;
    if (!messageText.trim() || loading) return;

    const newUserMessage = { role: 'user', content: messageText };
    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    setLoading(true);

    try {
      const data = await chatApi.sendMessage(messageText, sessionId);
      setSessionId(data.session_id);
      const botMessage = {
        role: 'assistant',
        content: data.response,
        gif_url: data.gif_url,
      };
      setMessages(prev => [...prev, botMessage]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Désolé, une erreur est survenue." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const data = new FormData();
    data.append('file', file);

    try {
      const res = await chatApi.uploadFile(file); // Assuming this method exists or I'll add it
      const newUserMessage = { 
        role: 'user', 
        content: `[Fichier uploadé: ${file.name}]`,
        file_url: res.url 
      };
      setMessages(prev => [...prev, newUserMessage]);
      // Also notify bot about the file
      handleSendMessage(`J'ai uploadé un fichier: ${file.name}. Peux-tu l'analyser ?`);
    } catch {
      alert("Erreur lors de l'upload.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    navigate('/auth');
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="sidebar-header">
          <Link to="/" className="logo">ELITEFI<span>T</span></Link>
          <button className="sidebar-close" onClick={toggleSidebar} aria-label={sidebarOpen ? 'Réduire le menu' : 'Développer le menu'}>
            <i className={`ph ${sidebarOpen ? 'ph-caret-left' : 'ph-list'}`}></i>
          </button>
        </div>

        <nav className="sidebar-nav">
          <Link to="/chat" className="nav-item active"><span className="ni"><i className="ph ph-chat-circle-text"></i></span><span className="nav-text">Chat</span></Link>
          <Link to="/dashboard" className="nav-item"><span className="ni"><i className="ph ph-chart-bar"></i></span><span className="nav-text">Dashboard</span></Link>
          <Link to="/profile" className="nav-item"><span className="ni"><i className="ph ph-user"></i></span><span className="nav-text">Profil</span></Link>
        </nav>

        <div className="sidebar-section">
          <div className="sidebar-label">SUJETS RAPIDES</div>
          <div className="quick-chips">
            <button onClick={() => handleSendMessage('Programme musculation cette semaine')}><i className="ph ph-calendar"></i><span className="chip-text">Programme semaine</span></button>
            <button onClick={() => handleSendMessage('Calculer mes calories')}><i className="ph ph-fire"></i><span className="chip-text">Mes calories</span></button>
            <button onClick={() => handleSendMessage('Exercices pour les biceps')}><i className="ph ph-barbell"></i><span className="chip-text">Biceps</span></button>
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{userEmail?.charAt(0).toUpperCase() || '?'}</div>
            <div className="user-details">
              <span>{userEmail || 'Chargement...'}</span>
              <span className="user-plan">Plan Gratuit</span>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            <i className="ph ph-sign-out"></i>
            <span className="logout-text">Déconnexion</span>
          </button>
        </div>
      </aside>

      <div className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`} onClick={toggleSidebar}></div>

      <main className="chat-main">
        <div className="chat-topbar">
          <button className={`topbar-btn ${sidebarOpen ? 'active' : ''}`} onClick={toggleSidebar} aria-label="Basculer le menu">
            <i className="ph ph-list"></i>
          </button>
          <div className="topbar-info">
            <div className="bot-status"><span className="status-dot"></span>FitBot · En ligne</div>
            <div className="chat-status-text">Historique activé : {historyOpen ? 'Oui' : 'Non'}</div>
          </div>
          <div className="topbar-actions">
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            <button className={`topbar-btn ${historyOpen ? 'active' : ''}`} onClick={toggleHistory} aria-label="Afficher l'historique">
              <i className="ph ph-clock"></i>
            </button>
            <button className="topbar-btn" onClick={handleClearHistory} aria-label="Réinitialiser la conversation">
              <i className="ph ph-trash"></i>
            </button>
          </div>
        </div>

        {historyOpen && (
          <div className="history-panel">
            <div className="history-title">
              <span>Historique des questions</span>
              <span>{historyItems.length} Dernières questions</span>
            </div>
            {historyItems.length ? (
              <div className="history-chips">
                {historyItems.map((item, idx) => (
                  <button key={idx} onClick={() => handleSendMessage(item.content)}>
                    <i className="ph ph-clock"></i>
                    {item.content}
                  </button>
                ))}
              </div>
            ) : (
              <div className="history-empty">Commence à poser une question pour voir l'historique.</div>
            )}
          </div>
        )}

        <div className="chat-suggestions">
          {suggestions.map((suggestion, idx) => (
            <button key={idx} onClick={() => handleSendMessage(suggestion.text)}>
              <i className="ph ph-lightbulb"></i>
              {suggestion.label}
            </button>
          ))}
        </div>

        <div className="messages-area">
          {messages.length === 0 ? (
            <div className="welcome-screen">
              <div className="welcome-logo">ELITEFI<span>T</span></div>
              <h2>Comment puis-je t'aider aujourd'hui ?</h2>
              <p>Pose ta question en français, darija, arabe ou anglais</p>
              <div className="welcome-chips">
                <button onClick={() => handleSendMessage('Bonjour !')}><i className="ph ph-hand-waving"></i> Dire bonjour</button>
                <button onClick={() => handleSendMessage('3tini programme l sder')}><i className="ph ph-barbell"></i> Programme sder (darija)</button>
              </div>
            </div>
          ) : (
            <div className="messages-list">
              {messages.map((m, i) => (
                <div key={i} className={`msg ${m.role}`}>
                  <div className="msg-avatar">{m.role === 'user' ? (userEmail?.charAt(0).toUpperCase() || 'U') : 'AI'}</div>
                  <div className="msg-content">
                    <div className="msg-bubble">
                      {m.role === 'assistant' ? (
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      ) : (
                        m.content
                      )}
                    </div>
                    {m.gif_url && (
                      <div className="message-gif">
                        <img src={m.gif_url} alt="exercise" style={{ maxWidth: '200px', borderRadius: '8px', marginTop: '10px' }} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && <div className="msg assistant"><div className="msg-avatar">AI</div><div className="msg-typing"><div className="dot"></div><div className="dot"></div><div className="dot"></div></div></div>}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="chat-input-wrap">
          <div className="chat-input-inner">
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleFileUpload} 
            />
            <button className="upload-btn" onClick={() => fileInputRef.current.click()}>
              <i className="ph ph-plus"></i>
            </button>
            <textarea
              id="chat-input"
              placeholder="Pose ta question..."
              rows="1"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
            ></textarea>
            <button id="send-btn" className="send-btn" onClick={() => handleSendMessage()} disabled={loading}>
              <i className="ph ph-arrow-right"></i>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
