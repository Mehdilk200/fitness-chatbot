export default function Services() {
  return (
    <section id="services" className="landing-section">
      <div className="services-header">
        <div className="section-label">Services</div>
        <h2 className="section-title">Sculpt Your Body. Build Real Strength.<br />Transform Your Life.</h2>
      </div>
      <div className="services-grid">
        <div className="service-card">
          <div className="service-icon">
            <svg viewBox="0 0 24 24"><path d="M6 4h4v16H6zM14 4h4v16h-4z" /><line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" /></svg>
          </div>
          <h3>Strength Training</h3>
          <p>Powerful workouts designed to build muscle, increase strength, and push your limits beyond what you thought possible.</p>
        </div>
        <div className="service-card">
          <div className="service-icon">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
          </div>
          <h3>Physique Sculpting</h3>
          <p>Targeted exercises to burn fat, define muscles, and create a chiseled, confident look that commands respect.</p>
        </div>
        <div className="service-card">
          <div className="service-icon">
            <svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
          </div>
          <h3>High-Intensity Conditioning</h3>
          <p>Dynamic sessions to boost stamina, endurance, and overall performance for peak athletic capability.</p>
        </div>
      </div>
      <div style={{ textAlign: "center", marginTop: "48px" }}>
        <button className="hero-btn">Start Your Transformation</button>
      </div>
    </section>
  );
}
