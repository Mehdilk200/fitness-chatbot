import { useTranslation } from 'react-i18next';

export default function Community() {
  const { t } = useTranslation('landing');

  return (
    <section id="community">
      <div className="section-label">{t('community.label')}</div>
      <h2>{t('community.title')}</h2>
      <a href="#" className="ig-btn">
        {t('community.cta')}
        <span className="ig-btn-icon">↗</span>
      </a>
      <div className="community-photos">
        <div className="comm-photo"><div className="comm-photo-inner"><img src="https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=400&auto=format&fit=crop" alt="PULL-UP" /></div></div>
        <div className="comm-photo"><div className="comm-photo-inner"><img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop" alt="DEADLIFT" /></div></div>
        <div className="comm-photo"><div className="comm-photo-inner"><img src="https://images.unsplash.com/photo-1679214894748-bcfdcb4dcaff?q=80&w=947&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="PRESS" /></div></div>
        <div className="comm-photo"><div className="comm-photo-inner"><img src="https://images.unsplash.com/photo-1646072508214-b88d6b1677c3?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="CURL" /></div></div>
        <div className="comm-photo"><div className="comm-photo-inner"><img src="https://images.unsplash.com/photo-1604480133435-25b86862d276?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="SQUAT" /></div></div>
      </div>
    </section>
  );
}
