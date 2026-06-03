import React from 'react';

export default function ThemeToggle({ theme, toggleTheme }) {
  return (
    <button 
      onClick={toggleTheme} 
      className="topbar-btn theme-toggle-btn"
      title={theme === 'light' ? 'Activer Mode Sombre' : 'Activer Mode Clair'}
      style={{ border: '1px solid var(--border)' }}
    >
      <i className={theme === 'light' ? 'ph ph-moon' : 'ph ph-sun'}></i>
    </button>
  );
}
