import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import imgHeroBg from '../../assets/backround_fin.png';

export default function Hero() {
  const { t } = useTranslation('landing');

  return (
    <section id="hero" className="landing-section hero-custom-bg" style={{ 
      backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url(${imgHeroBg})`
    }}>
      <div className="hero-bg-text">{t('hero.bgText')}</div>
      <div className="hero-stats">
        <div className="stat-item"><div className="stat-num">1,200<span style={{ color: "var(--lime)" }}>+</span></div><div className="stat-label">{t('hero.statMen')}</div></div>
        <div className="stat-item"><div className="stat-num">35<span style={{ color: "var(--lime)" }}>%</span></div><div className="stat-label">{t('hero.statResults')}</div></div>
        <div className="stat-item"><div className="stat-num">300<span style={{ color: "var(--lime)" }}>+</span></div><div className="stat-label">{t('hero.statPlans')}</div></div>
      </div>
      <div className="hero-content">
        <h1 className="hero-title">{t('hero.title')}</h1>
        <p className="hero-sub">{t('hero.subtitle')}</p>
        <Link to="/auth?mode=register" className="hero-btn">{t('hero.cta')}</Link>
      </div>
    </section>
  );
}
