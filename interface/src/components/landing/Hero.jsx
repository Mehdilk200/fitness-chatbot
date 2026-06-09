import { Link } from 'react-router-dom';
import imgHeroBg from '../../assets/backround_fin.png';

export default function Hero() {
  return (
    <section id="hero" className="landing-section hero-custom-bg" style={{ 
      backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url(${imgHeroBg})`
    }}>
      <div className="hero-bg-text">FITNESS</div>
      <div className="hero-stats">
        <div className="stat-item"><div className="stat-num">1,200<span style={{ color: "var(--lime)" }}>+</span></div><div className="stat-label">Men Transformed</div></div>
        <div className="stat-item"><div className="stat-num">35<span style={{ color: "var(--lime)" }}>%</span></div><div className="stat-label">Faster Results</div></div>
        <div className="stat-item"><div className="stat-num">300<span style={{ color: "var(--lime)" }}>+</span></div><div className="stat-label">Workout Plans</div></div>
      </div>
      <div className="hero-content">
        <h1 className="hero-title">ELEVATE<br /><span>YOUR</span> BODY.</h1>
        <p className="hero-sub">We help men transform themselves — physically, mentally, and confidently. Our mission is to help you discover the strength that was always inside you.</p>
        <Link to="/auth?mode=register" className="hero-btn">Start Your Transformation</Link>
      </div>
    </section>
  );
}
