import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { authApi, chatApi } from '../services/api';
import ThemeToggle from '../components/ThemeToggle';
import ReactMarkdown from 'react-markdown';
import Fuse from 'fuse.js';
import logoImg from '../assets/logoelet.png';

export default function Chat({ theme, toggleTheme }) {
  const { userEmail } = useOutletContext();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [userName, setUserName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions;
    const fuse = new Fuse(sessions, {
      keys: [
        { name: 'title', weight: 2 },
        { name: 'messages.content', weight: 1 },
      ],
      threshold: 0.4,
      includeScore: true,
    });
    return fuse.search(searchQuery).map(r => r.item);
  }, [sessions, searchQuery]);

  useEffect(() => {
    authApi.getMe().then(data => {
      if (data.first_name) setUserName(data.first_name);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
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
    fetchData();
  }, [navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = () => setMenuOpen(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const suggestions = useMemo(() => [
    { label: 'Programme semaine', text: 'Programme musculation cette semaine' },
    { label: 'Calories', text: 'Calculer mes calories' },
    { label: 'Biceps', text: 'Exercices pour les biceps' },
    { label: 'Perte de poids', text: 'Plan pour perdre de la graisse' },
  ], []);

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

  const refreshSessions = async () => {
    try {
      const historyData = await chatApi.getHistory();
      if (historyData && historyData.sessions) setSessions(historyData.sessions);
    } catch(e) {}
  };

  const handleRename = async (id) => {
    if (!renameValue.trim()) { setRenamingId(null); return; }
    try {
      await chatApi.renameSession(id, renameValue.trim());
      await refreshSessions();
    } catch(e) { console.error('Rename failed', e); }
    setRenamingId(null);
    setMenuOpen(null);
  };

  const handleArchive = async (id) => {
    try {
      await chatApi.archiveSession(id);
      await refreshSessions();
    } catch(e) { console.error('Archive failed', e); }
    setMenuOpen(null);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    try {
      await chatApi.deleteSession(confirmDelete);
      if (sessionId === confirmDelete) {
        setSessionId(null);
        setMessages([]);
      }
      await refreshSessions();
    } catch(e) { console.error('Delete failed', e); }
    setConfirmDelete(null);
    setMenuOpen(null);
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
    if ((!messageText.trim() && !uploadedImageUrl) || loading) return;

    const newUserMessage = { role: 'user', content: messageText, image_url: uploadedImageUrl };
    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    setLoading(true);

    const finalText = messageText || (uploadedImageUrl ? "Analyse cette image." : '');

    try {
      const data = await chatApi.sendMessage(finalText, sessionId, uploadedImageUrl);
      setSessionId(data.session_id);
      const botMessage = {
        role: 'assistant',
        content: data.response,
        gif_url: data.gif_url,
      };
      setMessages(prev => [...prev, botMessage]);
      setUploadedImageUrl(null);
      handleCancelImage();
      chatApi.getHistory().then(historyData => {
        if(historyData && historyData.sessions) setSessions(historyData.sessions);
      }).catch(e => {});
    } catch {
      setUploadedImageUrl(null);
      setMessages(prev => [...prev, { role: 'assistant', content: "Désolé, une erreur est survenue." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    const previewUrl = URL.createObjectURL(file);
    setSelectedImage({ file, previewUrl });
    setImageUploading(true);
    e.target.value = '';
    try {
      const res = await chatApi.uploadFile(file);
      setUploadedImageUrl(res.url);
    } catch {
      setUploadedImageUrl(null);
    } finally {
      setImageUploading(false);
    }
  };

  const handleCancelImage = () => {
    if (selectedImage) URL.revokeObjectURL(selectedImage.previewUrl);
    setSelectedImage(null);
    setUploadedImageUrl(null);
  };

  return (<>
      <aside className={`discussions-sidebar ${historyOpen ? 'open' : ''}`}>
        <div className="discussions-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)' }}>Discussions</span>
          <button onClick={handleNewChat} title="Nouvelle discussion" style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <i className="ph ph-plus-circle" style={{ fontSize: '20px' }}></i>
          </button>
        </div>
        <div className="discussions-search">
          <i className="ph ph-magnifying-glass" style={{ color: 'var(--text-muted)' }}></i>
          <input type="text" placeholder="Rechercher des conversations..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <div className="discussions-list">
          {(searchQuery.trim() ? filteredSessions : sessions).map(s => {
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
              <div
                className={`discussion-item-wrap ${sessionId === s._id ? 'active' : ''}`}
                key={s._id}
              >
                <button className="discussion-item" onClick={() => { setSessionId(s._id); setMessages(s.messages || []); }}>
                  {renamingId === s._id ? (
                    <input
                      className="rename-input"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleRename(s._id); if (e.key === 'Escape') setRenamingId(null); }}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    />
                  ) : (
                    <span className="discussion-title">{title}</span>
                  )}
                  <span className="discussion-time">{dateStr}</span>
                </button>
                <div className="discussion-menu-btn" onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === s._id ? null : s._id); }}>
                  <i className="ph ph-dots-three-vertical"></i>
                </div>
                {menuOpen === s._id && (
                  <div className="discussion-menu" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => { setRenamingId(s._id); setRenameValue(title); setMenuOpen(null); }}>
                      <i className="ph ph-pencil-line"></i> Rename
                    </button>
                    <button onClick={() => handleArchive(s._id)}>
                      <i className="ph ph-archive"></i> Archive
                    </button>
                    <button className="danger" onClick={() => { setConfirmDelete(s._id); setMenuOpen(null); }}>
                      <i className="ph ph-trash"></i> Delete
                    </button>
                  </div>
                )}
              </div>
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

        <div className="messages-area">
          {messages.length === 0 ? (
            <div className="welcome-screen">
              <div className="welcome-logo">
                <img src={logoImg} alt="ELITEFIT" style={{ width: '64px', height: '64px', objectFit: 'contain' }} />
                <span style={{ marginLeft: '10px' }}>ELITEFI<span style={{ color: 'var(--green)' }}>T</span></span>
              </div>
              <h2>{userName ? `${userName}, how can I help you today?` : 'Comment puis-je t\'aider aujourd\'hui ?'}</h2>
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
          {m.image_url && (
            <div className="msg-image-preview">
              <img src={m.image_url} alt="uploaded" />
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
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileSelect} />
              <button className={`upload-btn ${imageUploading ? 'uploading' : ''}`} onClick={() => fileInputRef.current.click()} title="Ajouter une image" disabled={imageUploading}>
                {imageUploading ? <span style={{ fontSize: '12px' }}>...</span> : <i className="ph ph-image"></i>}
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
                placeholder={`Ask ${userName || 'FitBot'}, how can I help you reach your goals today?`}
                rows="1"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
              ></textarea>
            </div>
            <button id="send-btn" className="send-btn" onClick={() => handleSendMessage()} disabled={loading || (!input.trim() && !uploadedImageUrl) || imageUploading}>
              <i className="ph ph-arrow-right"></i>
            </button>
          </div>
        </div>
      </main>
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete conversation?</h3>
            <p>This action cannot be undone.</p>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn-primary danger" onClick={handleDeleteConfirm}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
