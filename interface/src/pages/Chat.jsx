import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { chatApi, authApi } from '../services/api';
import ThemeToggle from '../components/ThemeToggle';
import ReactMarkdown from 'react-markdown';
import logoImg from '../assets/logoelet.png';

export default function Chat({ theme, toggleTheme }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [sessions, setSessions] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null); // { file, previewUrl }
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await authApi.getMe();
        setUserEmail(data.email);
        const historyData = await chatApi.getHistory();
        if (historyData && historyData.sessions) {
          setSessions(historyData.sessions);
          if (historyData.sessions.length > 0) {
            setSessionId(historyData.sessions[0]._id);
            setMessages(historyData.sessions[0].messages || []);
          }
        }
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
  const handleClearHistory = async () => {
    if (sessionId) {
      try {
        await chatApi.deleteSession(sessionId);
      } catch (e) {
        console.error("Failed to delete session", e);
      }
    }
    setMessages([]);
    setSessionId(null);
    setHistoryOpen(false);
    // Refresh sessions
    try {
      const historyData = await chatApi.getHistory();
      setSessions(historyData?.sessions || []);
    } catch(e){}
  };

  const handleNewChat = () => {
    setSessionId(null);
    setMessages([]);
    if (window.innerWidth < 768) setHistoryOpen(false);
  };

  const historyItems = useMemo(
    () => {
      if (!sessions || sessions.length === 0) return [];
      return sessions.flatMap(s => s.messages.filter(m => m.role === 'user').map(m => m.content)).slice(0, 10);
    },
    [sessions]
  );

  const handleSendMessage = async (text) => {
    const messageText = text || input;
    if ((!messageText.trim() && !selectedImage) || loading) return;

    const newUserMessage = { role: 'user', content: messageText, image_preview: selectedImage?.previewUrl };
    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    setLoading(true);

    // Upload image if any
    let uploadedImageUrl = null;
    if (selectedImage) {
      try {
        const res = await chatApi.uploadFile(selectedImage.file);
        uploadedImageUrl = res.url;
      } catch {}
      handleCancelImage();
    }

    const finalText = messageText || (uploadedImageUrl ? "Analyse cette image." : '');

    try {
      const data = await chatApi.sendMessage(finalText, sessionId);
      setSessionId(data.session_id);
      const botMessage = {
        role: 'assistant',
        content: data.response,
        gif_url: data.gif_url,
      };
      setMessages(prev => [...prev, botMessage]);
      chatApi.getHistory().then(historyData => {
        if(historyData && historyData.sessions) setSessions(historyData.sessions);
      }).catch(e => {});
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Désolé, une erreur est survenue." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    const previewUrl = URL.createObjectURL(file);
    setSelectedImage({ file, previewUrl });
    // reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleCancelImage = () => {
    if (selectedImage) URL.revokeObjectURL(selectedImage.previewUrl);
    setSelectedImage(null);
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
          <Link to="/" className="logo logo-img-wrap">
            <img src={logoImg} alt="ELITEFIT" className="logo-img" />
            <span className="logo-text">ELITEFI<span>T</span></span>
          </Link>
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

      <aside className={`discussions-sidebar ${historyOpen ? 'open' : ''}`}>
        <div className="discussions-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)' }}>Discussions</span>
          <button onClick={handleNewChat} title="Nouvelle discussion" style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <i className="ph ph-plus-circle" style={{ fontSize: '20px' }}></i>
          </button>
        </div>
        <div className="discussions-search">
          <i className="ph ph-magnifying-glass" style={{ color: 'var(--text-muted)' }}></i>
          <input type="text" placeholder="Rechercher des conversations..." />
        </div>
        <div className="discussions-list">
          {sessions.map(s => {
            const firstMsg = s.messages?.find(m => m.role === 'user');
            const title = s.title || (firstMsg ? firstMsg.content : 'Nouvelle discussion');
            
            const updatedDate = new Date(s.updated_at);
            const now = new Date();
            const diffMs = now - updatedDate;
            const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
            const diffDays = Math.floor(diffHrs / 24);
            let dateStr = '';
            if (diffHrs < 24) {
              dateStr = `il y a ${diffHrs || 1} heure${diffHrs > 1 ? 's' : ''}`;
            } else if (diffDays === 1) {
              dateStr = 'hier';
            } else if (diffDays === 2) {
              dateStr = 'avant-hier';
            } else {
              dateStr = updatedDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
            }

            return (
              <button 
                className={`discussion-item ${sessionId === s._id ? 'active' : ''}`} 
                key={s._id} 
                onClick={() => { setSessionId(s._id); setMessages(s.messages || []); }}
              >
                <span className="discussion-title">{title}</span>
                <span className="discussion-time">{dateStr}</span>
              </button>
            );
          })}
        </div>
      </aside>

      <main className={`chat-main ${historyOpen ? 'discussions-open' : ''}`}>
        <div className="chat-topbar">
          <button className={`topbar-btn ${historyOpen ? 'active' : ''}`} onClick={toggleHistory} aria-label="Basculer les discussions">
            <i className="ph ph-sidebar-simple"></i>
          </button>
          <div className="topbar-info" style={{ flex: 1, textAlign: 'center' }}>
            <div className="bot-status" style={{ justifyContent: 'center' }}><span className="status-dot"></span>FitBot · En ligne</div>
            <div className="chat-status-text">Historique activé : {historyOpen ? 'Oui' : 'Non'}</div>
          </div>
          <div className="topbar-actions">
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          </div>
        </div>

        {/* The history dropdown panel is removed because it is replaced by the secondary sidebar. */}

        {/* Moved suggestions into welcome screen */}

        <div className="messages-area">
          {messages.length === 0 ? (
            <div className="welcome-screen">
              <div className="welcome-logo">
                <img src={logoImg} alt="ELITEFIT" style={{ width: '64px', height: '64px', objectFit: 'contain' }} />
                <span style={{ marginLeft: '10px' }}>ELITEFI<span style={{ color: 'var(--green)' }}>T</span></span>
              </div>
              <h2>Comment puis-je t'aider aujourd'hui ?</h2>
              <p>Pose ta question en français, darija, arabe ou anglais</p>
              <div className="welcome-chips" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', maxWidth: '600px' }}>
                <button onClick={() => handleSendMessage('Bonjour !')}><i className="ph ph-hand-waving"></i> Dire bonjour</button>
                <button onClick={() => handleSendMessage('3tini programme l sder')}><i className="ph ph-barbell"></i> Programme sder (darija)</button>
                {suggestions.map((suggestion, idx) => (
                  <button key={idx} onClick={() => handleSendMessage(suggestion.text)}>
                    <i className="ph ph-lightbulb"></i>
                    {suggestion.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="messages-list">
              {messages.map((m, i) => (
                <div key={i} className={`msg ${m.role}`}>
                  <div className="msg-avatar">{m.role === 'user' ? (userEmail?.charAt(0).toUpperCase() || 'U') : 'AI'}</div>
                  <div className="msg-content">
                    <div className="msg-bubble">
                      {m.image_preview && (
                        <div className="msg-image-preview">
                          <img src={m.image_preview} alt="uploaded" />
                        </div>
                      )}
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
              accept="image/*"
              onChange={handleFileSelect} 
            />
            <button className="upload-btn" onClick={() => fileInputRef.current.click()} title="Ajouter une image">
              <i className="ph ph-image"></i>
            </button>
            <div className="input-area-wrap">
              {selectedImage && (
                <div className="input-image-chip">
                  <img src={selectedImage.previewUrl} alt="preview" />
                  <button className="image-preview-close" onClick={handleCancelImage} title="Supprimer">
                    <i className="ph ph-x"></i>
                  </button>
                </div>
              )}
              <textarea
                id="chat-input"
                placeholder="Pose ta question..."
                rows="1"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
              ></textarea>
            </div>
            <button id="send-btn" className="send-btn" onClick={() => handleSendMessage()} disabled={loading || (!input.trim() && !selectedImage)}>
              <i className="ph ph-arrow-right"></i>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
