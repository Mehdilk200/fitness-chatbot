import { useState, useEffect, useCallback } from 'react';

let toastId = 0;
let addToastFn = null;

export function toast(message, type = 'success', duration = 3000) {
  if (addToastFn) {
    addToastFn({ id: ++toastId, message, type, duration });
  }
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((t) => {
    setToasts(prev => [...prev, t]);
  }, []);

  useEffect(() => {
    addToastFn = addToast;
    return () => { addToastFn = null; };
  }, [addToast]);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 99999,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      pointerEvents: 'none',
    }}>
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onRemove={removeToast} />
      ))}
    </div>
  );
}

function ToastItem({ toast: t, onRemove }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onRemove(t.id), 300);
    }, t.duration);
    return () => clearTimeout(timer);
  }, [t, onRemove]);

  const bgColor = t.type === 'success' ? 'rgba(52, 199, 89, 0.95)'
    : t.type === 'error' ? 'rgba(255, 69, 58, 0.95)'
    : t.type === 'info' ? 'rgba(0, 122, 255, 0.95)'
    : 'rgba(28, 28, 30, 0.95)';

  return (
    <div style={{
      padding: '14px 20px',
      borderRadius: '14px',
      background: bgColor,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      color: '#fff',
      fontSize: '14px',
      fontWeight: 500,
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
      pointerEvents: 'auto',
      maxWidth: '360px',
      wordWrap: 'break-word',
      transform: exiting ? 'translateX(120%) scale(0.9)' : 'translateX(0) scale(1)',
      opacity: exiting ? 0 : 1,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    }}>
      <span style={{ fontSize: '18px' }}>
        {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : t.type === 'info' ? 'ℹ' : '●'}
      </span>
      <span style={{ flex: 1 }}>{t.message}</span>
    </div>
  );
}
