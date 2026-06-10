import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiGlobe } from 'react-icons/fi';

const languages = [
  { code: 'en', label: 'EN' },
  { code: 'ar', label: 'AR' },
  { code: 'fr', label: 'FR' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const current = languages.find((l) => l.code === i18n.language) || languages[0];

  return (
    <div className="lang-switcher" ref={ref}>
      <button className="lang-trigger" onClick={() => setOpen(!open)}>
        <FiGlobe size={18} />
        <span className="lang-trigger-label">{current.label}</span>
      </button>
      {open && (
        <div className="lang-dropdown">
          {languages.map((lang) => (
            <button
              key={lang.code}
              className={`lang-option ${i18n.language === lang.code ? 'active' : ''}`}
              onClick={() => { i18n.changeLanguage(lang.code); setOpen(false); }}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
