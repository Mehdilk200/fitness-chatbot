import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi, chatApi } from '../services/api';
import ReactMarkdown from 'react-markdown';
import Fuse from 'fuse.js';
import logoImg from '../assets/logoelet.png';

const MAX_IMAGES_PER_CONVERSATION = 8;

export default function Chat({ theme, toggleTheme }) {
  const { t } = useTranslation('chat');
  const { userEmail } = useOutletContext();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imageUploading, setImageUploading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [userName, setUserName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [welcomeGreeting, setWelcomeGreeting] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const imageCountInConversation = useMemo(() => {
    return messages.reduce((sum, m) => {
      if (m.image_urls) return sum + m.image_urls.length;
      if (m.image_url) return sum + 1;
      return sum;
    }, 0);
  }, [messages]);

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

  const suggestions = useMemo(() => {
    if (messages.length === 0) {
      return [
        { label: 'Say hello', text: 'Bonjour !' },
        { label: 'Chest program', text: '3tini programme l sder' },
        { label: 'Weekly plan', text: 'Programme musculation cette semaine' },
        { label: 'Calories', text: 'Calculer mes calories' },
      ];
    }
    return [
      { label: 'Log workout', text: 'Log my workout for today' },
      { label: 'Update calories', text: 'Update my calorie intake' },
      { label: 'Track progress', text: 'Show my progress this week' },
      { label: 'Set goal', text: 'Help me set a new fitness goal' },
    ];
  }, [messages]);

  useEffect(() => {
    authApi.getMe().then(data => {
      if (data.first_name) setUserName(data.first_name);
      return chatApi.getGreeting();
    }).then(data => {
      if (data && data.greeting) setWelcomeGreeting(data.greeting);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const historyData = await chatApi.getHistory();
        if (historyData && historyData.sessions) {
          setSessions(historyData.sessions);
          const params = new URLSearchParams(window.location.search);
          if (params.get('new') === '1') {
            return;
          }
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

  const toggleHistory = () => setHistoryOpen(prev => !prev);

  const handleClearHistory = async () => {
    if (sessionId) {
      try { await chatApi.deleteSession(sessionId); } catch (e) { console.error("Failed to delete session", e); }
    }
    setMessages([]);
    setSessionId(null);
    setHistoryOpen(false);
    try {
      const historyData = await chatApi.getHistory();
      setSessions(historyData?.sessions || []);
    } catch(e){}
  };

  const initials = userEmail?.charAt(0).toUpperCase() || '?';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('is_profile_complete');
    navigate('/auth');
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
      if (sessionId === confirmDelete) { setSessionId(null); setMessages([]); }
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
    if ((!messageText.trim() && selectedFiles.length === 0) || loading) return;

    let uploadedUrls = [];
    if (selectedFiles.length > 0) {
      setImageUploading(true);
      for (const file of selectedFiles) {
        try {
          const res = await chatApi.uploadFile(file);
          uploadedUrls.push(res.url);
        } catch (err) {
          console.error('Upload error:', err);
        }
      }
      setImageUploading(false);
    }

    const newUserMessage = { role: 'user', content: messageText, image_urls: uploadedUrls };
    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    setSelectedFiles([]);

    const finalText = messageText || (uploadedUrls.length > 0 ? "Analyse cette image." : '');

    setLoading(true);
    try {
      const data = await chatApi.sendMessage(finalText, sessionId, uploadedUrls.length > 0 ? uploadedUrls : null);
      setSessionId(data.session_id);
      const botMessage = { role: 'assistant', content: data.response, gif_url: data.gif_url };
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
    const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
    if (files.length === 0) return;
    const totalInConv = imageCountInConversation + selectedFiles.length + files.length;
    if (totalInConv > MAX_IMAGES_PER_CONVERSATION) {
      window.alert(`You have reached the limit of ${MAX_IMAGES_PER_CONVERSATION} images per conversation. Please start a new conversation to share more images.`);
      e.target.value = '';
      return;
    }
    setSelectedFiles(prev => [...prev, ...files]);
    e.target.value = '';
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <div className={`discussions-backdrop ${historyOpen ? 'active' : ''}`} onClick={() => setHistoryOpen(false)}></div>
      <aside className={`discussions-sidebar ${historyOpen ? 'open' : ''}`}>
        <div className="discussions-header">
          <span>{t('discussions')}</span>
          <button className="discussions-new-btn" onClick={handleNewChat} title={t('newChat')}>
            <i className="ph ph-plus"></i>
          </button>
        </div>
        <div className="discussions-search">
          <i className="ph ph-magnifying-glass" style={{ color: 'var(--text-muted)' }}></i>
          <input type="text" placeholder={t('search', 'Rechercher des conversations...')} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
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
              <div className={`discussion-item-wrap ${sessionId === s._id ? 'active' : ''}`} key={s._id}>
                <div className="title-and-menu-wrapper">
                  <button className="discussion-item" onClick={() => { setSessionId(s._id); setMessages(s.messages || []); }}>
                    {renamingId === s._id ? (
                      <input className="rename-input" value={renameValue} onChange={(e) => setRenameValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleRename(s._id); if (e.key === 'Escape') setRenamingId(null); }} onClick={(e) => e.stopPropagation()} autoFocus />
                    ) : (
                      <span className="discussion-title">{title}</span>
                    )}
                    <span className="discussion-time">{dateStr}</span>
                  </button>
                  <div className={`discussion-menu-btn ${menuOpen === s._id ? 'visible' : ''}`} onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === s._id ? null : s._id); }}>
                    <i className="ph ph-dots-three-vertical"></i>
                  </div>
                </div>
                {menuOpen === s._id && (
                  <div className="discussion-menu" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => { setRenamingId(s._id); setRenameValue(title); setMenuOpen(null); }}><i className="ph ph-pencil-line"></i> {t('rename')}</button>
                    <button onClick={() => handleArchive(s._id)}><i className="ph ph-archive"></i> Archive</button>
                    <button className="danger" onClick={() => { setConfirmDelete(s._id); setMenuOpen(null); }}><i className="ph ph-trash"></i> {t('delete', 'Delete')}</button>
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
            <div className="chat-status-text">{t('historyEnabled', 'Historique activé')} : {historyOpen ? t('yes', 'Oui') : t('no', 'Non')}</div>
          </div>
        </div>

        <div className="messages-area">
          {messages.length === 0 ? (
            <div className="welcome-screen">
              <div className="welcome-logo">
                <img src={logoImg} alt="ELITEFIT" style={{ width: '64px', height: '64px', objectFit: 'contain' }} />
                <span style={{ marginLeft: '10px' }}>ELITEFI<span style={{ color: 'var(--green)' }}>T</span></span>
              </div>
              <h2>{welcomeGreeting || (userName ? `${userName}, ${t('welcomeTitle', 'how can I help you today?')}` : t('welcomeTitle', 'Comment puis-je t\'aider aujourd\'hui ?'))}</h2>
              <p>{t('welcomeSubtitle', 'Pose ta question en français, darija, arabe ou anglais')}</p>
              <div className="welcome-chips" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', maxWidth: '600px' }}>
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
                    {m.image_urls && m.image_urls.length > 0 && (
                      <div className="msg-image-strip">
                        {m.image_urls.map((url, j) => (
                          <img key={j} src={url} alt="" className="msg-image-item" />
                        ))}
                      </div>
                    )}
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
              {loading && <div className="msg assistant"><div className="msg-avatar">AI</div><div className="msg-bubble typing-indicator"><span></span><span></span><span></span></div></div>}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="chat-input-wrap">
          <div className="chat-input-inner">
            {selectedFiles.length > 0 && (
              <div className="file-preview-bar">
                {selectedFiles.map((file, i) => (
                  <div className="thumb-wrap" key={i}>
                    <img src={URL.createObjectURL(file)} alt="" className="thumb-img" />
                    <button className="thumb-remove" onClick={() => removeFile(i)}>
                      <i className="ph ph-x"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="chat-input-toolbar">
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} multiple accept="image/*" onChange={handleFileSelect} />
              <button className={`upload-btn ${imageUploading ? 'uploading' : ''}`} onClick={() => fileInputRef.current.click()} title="Ajouter une image" disabled={imageUploading}>
                {imageUploading ? <span style={{ fontSize: '12px' }}>...</span> : <i className="ph ph-image"></i>}
              </button>
              <textarea
                id="chat-input"
                placeholder={`Ask ${userName || 'FitBot'}, how can I help you reach your goals today?`}
                rows="1"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
              ></textarea>
              <button id="send-btn" className="send-btn" onClick={() => handleSendMessage()} disabled={loading || (!input.trim() && selectedFiles.length === 0) || imageUploading}>
                <i className="ph ph-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      </main>

      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{t('deleteConfirm', 'Delete conversation?')}</h3>
            <p>{t('deleteWarning', 'This action cannot be undone.')}</p>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setConfirmDelete(null)}>{t('common:cancel', 'Cancel')}</button>
              <button className="btn-primary danger" onClick={handleDeleteConfirm}>{t('delete', 'Delete')}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
