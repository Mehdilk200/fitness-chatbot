import { useTranslation } from 'react-i18next';

export default function Pricing() {
  const { t } = useTranslation('landing');

  return (
    <section id="pricing" className="landing-section">
      <div className="pricing-header">
        <h2>{t('pricing.title')}</h2>
      </div>
      <div className="pricing-grid">
        <div className="plan-card">
          <div className="plan-name">{t('pricing.basicName')}</div>
          <div className="card" style={{ height: "430px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div className="plan-desc">{t('pricing.basicDesc')}</div>
            <div className="plan-price">
              <span className="dollar">$</span>
              <span className="amount">69</span>
              <span className="period">{t('pricing.perMonth')}</span>
            </div>
            <ul className="plan-features">
              <li>{t('pricing.basicFeature1')}</li>
              <li>{t('pricing.basicFeature2')}</li>
              <li>{t('pricing.basicFeature3')}</li>
            </ul>
            <button className="plan-btn">{t('pricing.cta')}</button>
          </div>
        </div>
        <div className="plan-card featured">
          <div className="featured-badge">{t('pricing.standardBadge')}</div>
          <div className="plan-name">{t('pricing.standardName')}</div>
          <div className="card" style={{ height: "430px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div className="plan-desc">{t('pricing.standardDesc')}</div>
            <div className="plan-price">
              <span className="dollar">$</span>
              <span className="amount">0</span>
              <span className="period">{t('pricing.perMonth')}</span>
            </div>
            <ul className="plan-features" style={{ marginTop: "8px" }}>
              <li>{t('pricing.standardFeature1')}</li>
              <li>{t('pricing.standardFeature2')}</li>
              <li>{t('pricing.standardFeature3')}</li>
              <li>{t('pricing.standardFeature4')}</li>
            </ul>
            <button className="plan-btn">{t('pricing.cta')}</button>
          </div>
        </div>
        <div className="plan-card">
          <div className="plan-name">{t('pricing.premiumName')}</div>
          <div className="card" style={{ height: "430px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div className="plan-desc">{t('pricing.premiumDesc')}</div>
            <div className="plan-price">
              <span className="dollar">$</span>
              <span className="amount">159</span>
              <span className="period">{t('pricing.perMonth')}</span>
            </div>
            <ul className="plan-features">
              <li>{t('pricing.premiumFeature1')}</li>
              <li>{t('pricing.premiumFeature2')}</li>
              <li>{t('pricing.premiumFeature3')}</li>
              <li>{t('pricing.premiumFeature4')}</li>
              <li>{t('pricing.premiumFeature5')}</li>
            </ul>
            <button className="plan-btn">{t('pricing.cta')}</button>
          </div>
        </div>
      </div>
    </section>
  );
}
