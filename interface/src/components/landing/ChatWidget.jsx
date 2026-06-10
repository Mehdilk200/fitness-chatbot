import { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { chatApi, supportApi } from '../../services/api';

const MAX_IMAGES = 5;

export default function ChatWidget() {
  const { t } = useTranslation('landing');
  const [chatOpen, setChatOpen] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const [messages, setMessages] = useState([getInitialMessage()]);
  const [inputText, setInputText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  function getInitialMessage() {
    const token = localStorage.getItem('token');
    if (token) {
      return { role: 'bot', content: t('chat.welcomeBack') };
    }
    return { role: 'bot', content: t('chat.welcomeMessage') };
  }

  const suggestions = useMemo(() => {
    const isOnboarding = messages.length <= 1;
    if (isOnboarding) {
      return [
        { label: t('chat.quick1'), text: t('chat.quick1') },
        { label: 'What is EliteFiT?', text: 'What is EliteFiT?' },
        { label: 'Show pricing', text: 'What are your membership plans?' },
        { label: 'Location', text: 'Where are you located?' },
      ];
    }
    return [
      { label: 'Log workout', text: 'Log my workout for today' },
      { label: 'Update calories', text: 'Update my calorie intake' },
      { label: 'Track progress', text: 'Show my progress this week' },
      { label: 'Set goal', text: 'Help me set a new fitness goal' },
    ];
  }, [messages, t]);

  const toggleChat = () => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsExpanding(true);
      setTimeout(() => navigate('/chat'), 800);
    } else {
      setChatOpen(!chatOpen);
    }
  };

  const sendMsg = async (text) => {
    const messageText = text || inputText;
    if (!messageText.trim() && selectedFiles.length === 0) return;

    const userMsg = { role: 'user', content: messageText, image_urls: [] };
    setMessages(prev => [...prev, userMsg]);
    if (!text) setInputText('');

    let uploadedUrls = [];
    if (selectedFiles.length > 0) {
      const token = localStorage.getItem('token');
      if (!token) {
        alert(t('chat.loginToUpload'));
        setSelectedFiles([]);
        return;
      }
      for (const file of selectedFiles) {
        try {
          const data = await chatApi.uploadFile(file);
          userMsg.image_urls.push(data.url);
          uploadedUrls.push(data.url);
        } catch (err) {
          console.error('Upload error:', err);
        }
      }
    }
    setSelectedFiles([]);

    try {
      const token = localStorage.getItem('token');
      const data = token
        ? await chatApi.sendMessage(messageText)
        : await supportApi.sendMessage(messageText);
      setMessages(prev => [...prev, { role: 'bot', content: data.response }]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages(prev => [...prev, { role: 'bot', content: t('chat.errorMessage') }]);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
    if (files.length === 0) return;
    const token = localStorage.getItem('token');
    if (!token) {
      alert(t('chat.loginToUpload'));
      return;
    }
    const total = selectedFiles.length + files.length;
    if (total > MAX_IMAGES) {
      alert(`You can only upload up to ${MAX_IMAGES} images.`);
      const allowed = files.slice(0, MAX_IMAGES - selectedFiles.length);
      setSelectedFiles(prev => [...prev, ...allowed]);
    } else {
      setSelectedFiles(prev => [...prev, ...files]);
    }
    e.target.value = '';
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFilePreview = (file) => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  const sendQuick = (text) => sendMsg(text);

  return (
    <>
      <button id="chat-btn" className={isExpanding ? 'expanding' : ''} onClick={toggleChat}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <circle cx="9" cy="10" r="1" fill="#0a0a0a" />
          <circle cx="12" cy="10" r="1" fill="#0a0a0a" />
          <circle cx="15" cy="10" r="1" fill="#0a0a0a" />
        </svg>
      </button>

      <div id="chat-window" className={chatOpen ? 'open' : ''}>
        <div className="chat-header">
          <div className="chat-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <div className="chat-header-info">
            <h4>{t('chat.headerTitle')}</h4>
            <p><span className="status-dot"></span> {t('chat.headerStatus')}</p>
          </div>
          <button className="chat-close" onClick={toggleChat}><i className="ph ph-x"></i></button>
        </div>

        <div id="chat-messages">
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role}`}>
              {m.image_urls && m.image_urls.length > 0 && (
                <div className="msg-image-strip">
                  {m.image_urls.map((url, j) => (
                    <img key={j} src={url} alt="" className="msg-image-item" />
                  ))}
                </div>
              )}
              <div className="msg-bubble">
                {m.role === 'bot' && <i className="ph ph-barbell" style={{ marginRight: '8px' }}></i>}
                {m.content}
              </div>
              <div className="msg-time">{i === 0 ? t('common:justNow') : ''}</div>
            </div>
          ))}
        </div>

        <div className="chat-quick-btns" id="quick-btns">
          {suggestions.map((s, i) => (
            <button key={i} className="quick-btn" onClick={() => sendQuick(s.text)}>{s.label}</button>
          ))}
        </div>

        <div className="chat-input-wrap">
          <div className="chat-input-row">
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
              <button className="upload-btn" onClick={() => fileInputRef.current.click()}>
                <i className="ph ph-image"></i>
              </button>
              <input
                type="text"
                id="chat-input"
                placeholder={t('chat.placeholder')}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') sendMsg() }}
              />
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                multiple
                accept="image/*"
                onChange={handleFileSelect}
              />
              <button id="send-btn" onClick={sendMsg}>
                <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
