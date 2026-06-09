import logoImg from '../../assets/logoelet.png';

export default function Footer() {
  return (
    <footer className="landing-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="logo-img-wrap" style={{ marginBottom: "16px" }}>
            <img src={logoImg} alt="EliteFiT" className="logo-img" style={{ width: "28px", height: "28px" }} />
            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "800", fontSize: "20px", letterSpacing: "2px", color: "var(--white)" }}>EliteFi<span style={{ color: "var(--lime)" }}>T</span></span>
          </div>
          <p>Helping men unlock their strongest, most confident selves through elite training and relentless dedication.</p>
        </div>
        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="#">Home</a></li>
            <li><a href="#">About Us</a></li>
            <li><a href="#">Programs</a></li>
            <li><a href="#">Testimonials</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Our Services</h4>
          <ul>
            <li><a href="#">Strength Facility</a></li>
            <li><a href="#">Personal Training</a></li>
            <li><a href="#">Physique Sculpting</a></li>
            <li><a href="#">High-Intensity Conditioning</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Follow Us</h4>
          <ul className="footer-social">
            <li><a href="#" aria-label="Instagram"><i className="ph ph-instagram-logo"></i> Instagram</a></li>
            <li><a href="#" aria-label="Facebook"><i className="ph ph-facebook-logo"></i> Facebook</a></li>
            <li><a href="#" aria-label="Twitter / X"><i className="ph ph-twitter-logo"></i> Twitter</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>Copyright © {new Date().getFullYear()} EliteFiT. All Rights Reserved</span>
        <span>Built with power. Trained with purpose.</span>
      </div>
    </footer>
  );
}
