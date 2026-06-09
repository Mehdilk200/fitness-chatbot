export default function Pricing() {
  return (
    <section id="pricing" className="landing-section">
      <div className="pricing-header">
        <h2>Flexible Membership Plans</h2>
      </div>
      <div className="pricing-grid">
        <div className="plan-card">
          <div className="plan-name">Basic</div>
          <div className="card" style={{ height: "430px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div className="plan-desc">Ideal for beginners, includes access to all gym equipment</div>
            <div className="plan-price">
              <span className="dollar">$</span>
              <span className="amount">69</span>
              <span className="period">/Month</span>
            </div>
            <ul className="plan-features">
              <li>Access to gym equipment and facilities</li>
              <li>Flexible gym hours for early risers or night owls</li>
              <li>Access to one local branch</li>
            </ul>
            <button className="plan-btn">Get Started</button>
          </div>
        </div>
        <div className="plan-card featured">
          <div className="featured-badge">Coach Recommended</div>
          <div className="plan-name">Standard</div>
          <div className="card" style={{ height: "430px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div className="plan-desc">Ideal for beginners, includes access to all gym equipment</div>
            <div className="plan-price">
              <span className="dollar">$</span>
              <span className="amount">0</span>
              <span className="period">/Month</span>
            </div>
            <ul className="plan-features" style={{ marginTop: "8px" }}>
              <li>Everything in the Basic Plan</li>
              <li>Access to group fitness classes (yoga, spin, etc.)</li>
              <li>Includes nutrition coaching and personalized workout plans</li>
              <li>Access to all branches nationwide</li>
            </ul>
            <button className="plan-btn">Get Started</button>
          </div>
        </div>
        <div className="plan-card">
          <div className="plan-name">Premium</div>
          <div className="card" style={{ height: "430px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div className="plan-desc">All-inclusive with personal training and nutrition consultation</div>
            <div className="plan-price">
              <span className="dollar">$</span>
              <span className="amount">159</span>
              <span className="period">/Month</span>
            </div>
            <ul className="plan-features">
              <li>Everything in the Standard Plan</li>
              <li>24/7 access to premium gym facilities</li>
              <li>Complimentary personal training sessions each month</li>
              <li>Free access to fitness events and workshops</li>
              <li>Unlimited access to all branches, no restrictions</li>
            </ul>
            <button className="plan-btn">Get Started</button>
          </div>
        </div>
      </div>
    </section>
  );
}
