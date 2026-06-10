import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ThemeToggle from '../ThemeToggle';
import LanguageSwitcher from '../LanguageSwitcher';
import logoImg from '../../assets/logoelet.png';

export default function Navbar({ theme, toggleTheme }) {
  const { t } = useTranslation('landing');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const toggleDrawer = () => setDrawerOpen(!drawerOpen);
  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      <div className={`nav-overlay ${drawerOpen ? 'open' : ''}`} onClick={closeDrawer} />
      <div className={`nav-drawer ${drawerOpen ? 'open' : ''}`}>
        <ul>
          <li><a href="#about" onClick={closeDrawer}>{t('nav.product')}</a></li>
          <li><a href="#services" onClick={closeDrawer}>{t('nav.services')}</a></li>
          <li><a href="#stats" onClick={closeDrawer}>{t('nav.trainer')}</a></li>
          <li><a href="#testimonial" onClick={closeDrawer}>{t('nav.testimonial')}</a></li>
          <li><a href="#pricing" onClick={closeDrawer}>{t('nav.pricing')}</a></li>
          <li><a href="#contact" onClick={closeDrawer}>{t('nav.contact')}</a></li>
        </ul>
        <Link to="/auth?mode=register" className="drawer-cta" onClick={closeDrawer}>{t('common:getStarted')}</Link>
      </div>
      <nav className="landing-nav">
        <Link to="/" className="logo-img-wrap" style={{ textDecoration: "none" }}>
          <img src={logoImg} alt="EliteFiT" className="logo-img" style={{ width: "32px", height: "32px" }} />
          <span className="nav-logo">{t('common:appName')}</span>
        </Link>
        <ul className="nav-links" id="navLinks">
          <li><a href="#about">{t('nav.product')}</a></li>
          <li><a href="#services">{t('nav.services')}</a></li>
          <li><a href="#stats">{t('nav.trainer')}</a></li>
          <li><a href="#testimonial">{t('nav.testimonial')}</a></li>
          <li><a href="#pricing">{t('nav.pricing')}</a></li>
          <li><a href="#contact">{t('nav.contact')}</a></li>
        </ul>
        <div className="nav-right">
          <LanguageSwitcher />
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          <Link to="/auth?mode=register" className="nav-cta">{t('common:getStarted')}</Link>
          <button className={`nav-hamburger ${drawerOpen ? 'open' : ''}`} onClick={toggleDrawer}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>
    </>
  );
}
