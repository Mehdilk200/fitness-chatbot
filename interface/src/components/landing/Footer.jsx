import { useTranslation } from 'react-i18next';
import logoImg from '../../assets/logoelet.png';

export default function Footer() {
  const { t } = useTranslation('landing');

  return (
    <footer className="landing-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="logo-img-wrap" style={{ marginBottom: "16px" }}>
            <img src={logoImg} alt="EliteFiT" className="logo-img" style={{ width: "28px", height: "28px" }} />
            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "800", fontSize: "20px", letterSpacing: "2px", color: "var(--white)" }}>{t('common:appName')}<span style={{ color: "var(--lime)" }}>{t('common:appNameSpan')}</span></span>
          </div>
          <p>{t('footer.description')}</p>
        </div>
        <div className="footer-col">
          <h4>{t('footer.quickLinks')}</h4>
          <ul>
            <li><a href="#">{t('footer.home')}</a></li>
            <li><a href="#">{t('footer.aboutUs')}</a></li>
            <li><a href="#">{t('footer.programs')}</a></li>
            <li><a href="#">{t('footer.testimonials')}</a></li>
            <li><a href="#">{t('footer.contact')}</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>{t('footer.ourServices')}</h4>
          <ul>
            <li><a href="#">{t('footer.strengthFacility')}</a></li>
            <li><a href="#">{t('footer.personalTraining')}</a></li>
            <li><a href="#">{t('footer.physiqueSculpting')}</a></li>
            <li><a href="#">{t('footer.hiit')}</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>{t('footer.followUs')}</h4>
          <ul className="footer-social">
            <li><a href="#" aria-label={t('common:followUsAria')}><i className="ph ph-instagram-logo"></i> {t('footer.instagram')}</a></li>
            <li><a href="#" aria-label="Facebook"><i className="ph ph-facebook-logo"></i> {t('footer.facebook')}</a></li>
            <li><a href="#" aria-label="Twitter / X"><i className="ph ph-twitter-logo"></i> {t('footer.twitter')}</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>{t('footer.copyright', { year: new Date().getFullYear() })}</span>
        <span>{t('footer.tagline')}</span>
      </div>
    </footer>
  );
}
