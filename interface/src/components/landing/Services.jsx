import { useTranslation } from 'react-i18next';

export default function Services() {
  const { t } = useTranslation('landing');

  return (
    <section id="services" className="landing-section">
      <div className="services-header">
        <div className="section-label">{t('services.label')}</div>
        <h2 className="section-title">{t('services.title')}</h2>
      </div>
      <div className="services-grid">
        <div className="service-card">
          <div className="service-icon">
            <svg viewBox="0 0 24 24"><path d="M6 4h4v16H6zM14 4h4v16h-4z" /><line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" /></svg>
          </div>
          <h3>{t('services.strengthTraining')}</h3>
          <p>{t('services.strengthDesc')}</p>
        </div>
        <div className="service-card">
          <div className="service-icon">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
          </div>
          <h3>{t('services.physiqueSculpting')}</h3>
          <p>{t('services.physiqueDesc')}</p>
        </div>
        <div className="service-card">
          <div className="service-icon">
            <svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
          </div>
          <h3>{t('services.hiit')}</h3>
          <p>{t('services.hiitDesc')}</p>
        </div>
      </div>
      <div style={{ textAlign: "center", marginTop: "48px" }}>
        <button className="hero-btn">{t('services.cta')}</button>
      </div>
    </section>
  );
}
