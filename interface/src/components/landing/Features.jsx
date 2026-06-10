import { useTranslation } from 'react-i18next';

export default function Features() {
  const { t } = useTranslation('landing');

  return (
    <section id="features" className="landing-section">
      <div className="features-header">
        <div className="section-label">{t('features.label')}</div>
        <h2 className="section-title">{t('features.title')}</h2>
        <p>{t('features.description')}</p>
      </div>
      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-num">01</div>
          <h3>{t('features.card1Title')}</h3>
          <p>{t('features.card1Desc')}</p>
        </div>
        <div className="feature-card">
          <div className="feature-num">02</div>
          <h3>{t('features.card2Title')}</h3>
          <p>{t('features.card2Desc')}</p>
        </div>
        <div className="feature-card">
          <div className="feature-num">03</div>
          <h3>{t('features.card3Title')}</h3>
          <p>{t('features.card3Desc')}</p>
        </div>
        <div className="feature-card">
          <div className="feature-num">04</div>
          <h3>{t('features.card4Title')}</h3>
          <p>{t('features.card4Desc')}</p>
        </div>
        <div className="feature-card">
          <div className="feature-num">05</div>
          <h3>{t('features.card5Title')}</h3>
          <p>{t('features.card5Desc')}</p>
        </div>
        <div className="feature-card">
          <div className="feature-num">06</div>
          <h3>{t('features.card6Title')}</h3>
          <p>{t('features.card6Desc')}</p>
        </div>
      </div>
      <div style={{ textAlign: "center", marginTop: "48px" }}>
        <button className="hero-btn">{t('features.cta')}</button>
      </div>
    </section>
  );
}
