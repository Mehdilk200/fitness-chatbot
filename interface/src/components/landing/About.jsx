import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function About() {
  const { t } = useTranslation('landing');

  return (
    <section id="about" className="landing-section">
      <div className="about-left">
        <div className="section-label">{t('about.label')}</div>
        <h2>{t('about.title')}</h2>
        <p>{t('about.description')}</p>
        <Link to="/auth" className="hero-btn">{t('about.cta')}</Link>
      </div>
      <div className="about-imgs">
        <div className="about-img-main">
          <div className="img-placeholder"><img src="https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" srcSet="" /></div>
        </div>
        <div className="about-img-sm">
          <div className="img-placeholder"><img src="https://images.unsplash.com/photo-1519311965067-36d3e5f33d39?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" srcSet="" /></div>
        </div>
      </div>
    </section>
  );
}
