import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatApi, supportApi } from '../../services/api';

export default function ChatWidget() {
  const [chatOpen, setChatOpen] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const [messages, setMessages] = useState([getInitialMessage()]);
  const [inputText, setInputText] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  function getInitialMessage() {
    const token = localStorage.getItem('token');
    if (token) {
      return { role: 'bot', content: "Welcome back! I'm your AI fitness coach. Ask me anything about training, nutrition, or your progress." };
    }
    return { role: 'bot', content: "Welcome to EliteFiT!  I'm here to help you learn about our services, pricing, and how to start your transformation. Create a free account to get personalized fitness coaching!" };
  }

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
    if (!messageText.trim()) return;

    const userMsg = { role: 'user', content: messageText };
    setMessages(prev => [...prev, userMsg]);
    if (!text) setInputText('');

    try {
      const token = localStorage.getItem('token');
      const data = token
        ? await chatApi.sendMessage(messageText)
        : await supportApi.sendMessage(messageText);
      setMessages(prev => [...prev, { role: 'bot', content: data.response }]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages(prev => [...prev, { role: 'bot', content: "Error connecting to AI Coach." }]);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert("Please login to upload files.");
      return;
    }

    try {
      const data = await chatApi.uploadFile(file);
      console.log("File uploaded:", data.url);
    } catch (err) {
      console.error("Error uploading file:", err);
    }
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
            <h4>EliteFiT AI Coach</h4>
            <p><span className="status-dot"></span> Online — Ready to Transform You</p>
          </div>
          <button className="chat-close" onClick={toggleChat}><i className="ph ph-x"></i></button>
        </div>

        <div id="chat-messages">
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role}`}>
              <div className="msg-bubble">
                {m.role === 'bot' && <i className="ph ph-barbell" style={{ marginRight: '8px' }}></i>}
                {m.content}
              </div>
              <div className="msg-time">{i === 0 ? 'Just now' : ''}</div>
            </div>
          ))}
        </div>

        <div className="chat-quick-btns" id="quick-btns">
          <button className="quick-btn" onClick={() => sendQuick('How do I start?')}>How do I start?</button>
          <button className="quick-btn" onClick={() => sendQuick('Best workout for beginners')}>Beginner workout</button>
          <button className="quick-btn" onClick={() => sendQuick('Nutrition tips for muscle gain')}>Nutrition tips</button>
          <button className="quick-btn" onClick={() => sendQuick('How long to see results?')}>See results</button>
        </div>

        <div className="chat-input-wrap">
          <button className="upload-btn" onClick={() => fileInputRef.current.click()}>
            <i className="ph ph-file-plus"></i>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
          <input
            type="text"
            id="chat-input"
            placeholder="Pose ta question..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') sendMsg() }}
          />
          <button id="send-btn" onClick={sendMsg}>
            <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
          </button>
        </div>
      </div>
    </>
  );
}
