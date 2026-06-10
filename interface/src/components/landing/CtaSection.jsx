import { useTranslation } from 'react-i18next';

export default function CtaSection() {
  const { t } = useTranslation('landing');

  return (
    <section id="cta" className="landing-section">
      <div className="cta-left">
        <div className="section-label" style={{ color: "rgba(255,255,255,0.4)" }}>{t('cta.label')}</div>
        <h2>{t('cta.title')}</h2>
      </div>
      <div className="cta-right">
        <p>{t('cta.description')}</p>
        <button className="cta-btn">{t('cta.cta')} <i className="ph ph-arrow-right"></i></button>
      </div>
    </section>
  );
}
