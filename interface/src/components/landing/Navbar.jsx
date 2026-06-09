import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../ThemeToggle';
import logoImg from '../../assets/logoelet.png';

export default function Navbar({ theme, toggleTheme }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const toggleDrawer = () => setDrawerOpen(!drawerOpen);
  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      <div className={`nav-overlay ${drawerOpen ? 'open' : ''}`} onClick={closeDrawer} />
      <div className={`nav-drawer ${drawerOpen ? 'open' : ''}`}>
        <ul>
          <li><a href="#about" onClick={closeDrawer}>Product</a></li>
          <li><a href="#services" onClick={closeDrawer}>Services</a></li>
          <li><a href="#stats" onClick={closeDrawer}>Trainer</a></li>
          <li><a href="#testimonial" onClick={closeDrawer}>Testimonial</a></li>
          <li><a href="#pricing" onClick={closeDrawer}>Pricing</a></li>
          <li><a href="#contact" onClick={closeDrawer}>Contact</a></li>
        </ul>
        <Link to="/auth?mode=register" className="drawer-cta" onClick={closeDrawer}>Get Started</Link>
      </div>
      <nav className="landing-nav">
        <Link to="/" className="logo-img-wrap" style={{ textDecoration: "none" }}>
          <img src={logoImg} alt="EliteFiT" className="logo-img" style={{ width: "32px", height: "32px" }} />
          <span className="nav-logo">EliteFi<span>T</span></span>
        </Link>
        <ul className="nav-links" id="navLinks">
          <li><a href="#about">Product</a></li>
          <li><a href="#services">Services</a></li>
          <li><a href="#stats">Trainer</a></li>
          <li><a href="#testimonial">Testimonial</a></li>
          <li><a href="#pricing">Pricing</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
        <div className="nav-right">
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          <Link to="/auth?mode=register" className="nav-cta">Get Started</Link>
          <button className={`nav-hamburger ${drawerOpen ? 'open' : ''}`} onClick={toggleDrawer}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>
    </>
  );
}
