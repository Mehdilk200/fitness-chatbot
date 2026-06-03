import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import imgNuvex from "../assets/nuvex.png"
import imgT1 from "../assets/ts-01.png"
import imgT2 from "../assets/ts-02.png"
import imgT3 from "../assets/ts-03.png"
import imgT4 from "../assets/ts-04.png"
import imgT5 from "../assets/ts-05.png"
import imgT6 from "../assets/ts-06.png"
import MapboxMap from '../components/MapboxMap';
import imgHeroBg from "../assets/backround_fin.png"
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { chatApi } from '../services/api';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);


export default function Home({ theme, toggleTheme }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const toggleDrawer = () => setDrawerOpen(!drawerOpen);
  const closeDrawer = () => setDrawerOpen(false);

  // Chat State
  const [chatOpen, setChatOpen] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const toggleChat = () => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsExpanding(true);
      setTimeout(() => {
        navigate('/chat');
      }, 800);
    } else {
      setChatOpen(!chatOpen);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert("Please login to upload files.");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const data = await chatApi.uploadFile(file);
      console.log("File uploaded:", data.url);
    } catch (err) {
      console.error("Error uploading file:", err);
    }
  };


  const [messages, setMessages] = useState([
    { role: 'bot', content: "Welcome to EliteFiT! I'm your AI fitness coach. Ask me anything about training, nutrition, or how to start your transformation journey." }
  ]);
  const [inputText, setInputText] = useState('');

  const sendMsg = async () => {
    if (!inputText.trim()) return;

    const userMsg = { role: 'user', content: inputText };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = inputText;
    setInputText('');

    try {
      const data = await chatApi.sendMessage(currentInput);
      const botMsg = { role: 'bot', content: data.response };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages(prev => [...prev, { role: 'bot', content: "Error connecting to AI Coach." }]);
    }
  };

  // FAQ State
  const [openFaq, setOpenFaq] = useState(0); // Default first one open
  const toggleFaq = (index) => setOpenFaq(openFaq === index ? null : index);

  // Sliders State
  const [tcIndex, setTcIndex] = useState(0);
  const [tsIndex, setTsIndex] = useState(0);
  const tsTrackRef = useRef(null);

  const tcSlide = (dir) => {
    const track = document.getElementById('tcTrack');
    const cards = track.children.length;
    let newIndex = tcIndex + dir;
    if (newIndex < 0) newIndex = 0;
    if (newIndex > cards - 1) newIndex = cards - 1;
    setTcIndex(newIndex);
  };

  const tsSlide2 = (dir) => {
    const track = tsTrackRef.current;
    if (!track) return;
    const totalCards = track.children.length;
    const visibleCards = 2; // We are showing 2 cards
    let newIndex = tsIndex + dir;
    if (newIndex < 0) newIndex = 0;
    if (newIndex > totalCards - visibleCards) newIndex = totalCards - visibleCards;
    setTsIndex(newIndex);
  };

  const getTsTransform = () => {
    const track = tsTrackRef.current;
    if (!track || track.children.length === 0) return 'translateX(0)';
    const card = track.children[0];
    const style = window.getComputedStyle(card);
    const width = card.offsetWidth;
    const gap = parseInt(window.getComputedStyle(track).gap) || 0;
    return `translateX(-${tsIndex * (width + gap)}px)`;
  };

  return (
    <>


      {/*  NAV OVERLAY  */}
      <div className={`nav-overlay ${drawerOpen ? 'open' : ''}`} onClick={closeDrawer}></div>

      {/*  MOBILE DRAWER  */}
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

      {/*  NAV  */}
      <nav className="landing-nav">
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", flexShrink: "0" }}>
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none"><path d="M6 25L15 4l9 21M9 18h12" stroke="#c8f135" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
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

      {/*  HERO  */}
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

      {/*  ABOUT  */}
      <section id="about" className="landing-section">
        <div className="about-left">
          <div className="section-label">About Us</div>
          <h2>We Don't Just Build Bodies, We Build Strong Men Who Lead with Power and Confidence</h2>
          <p>At Fitne, we believe every man has the power to transform himself — physically, mentally, and confidently. Our mission is simple: to help them rediscover and unlock the strength that's already inside them.</p>
          <button className="hero-btn">Start Your Transformation</button>
        </div>
        <div className="about-imgs">
          <div className="about-img-main">
            <div className="img-placeholder"><img src="https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" srcset="" /></div>
          </div>
          <div className="about-img-sm">
            <div className="img-placeholder"><img src="https://images.unsplash.com/photo-1519311965067-36d3e5f33d39?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" srcset="" /></div>
          </div>
        </div>
      </section>

      {/*  SERVICES  */}
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

      {/*  STATS  */}
      <section id="stats" className="landing-section">
        <div className="radar-wrap">
          <div className="section-label">Where Power Is Built</div>
          <div style={{ maxWidth: '400px', margin: '0 auto' }}>
            <Radar 
              data={{
                labels: ['UNSTOPPABLE', 'STRONGER', 'FOCUSED', 'LIMITLESS', 'RELENTLESS', 'POWERFUL'],
                datasets: [
                  {
                    label: 'Elite Performance',
                    data: [85, 95, 75, 90, 80, 88],
                    backgroundColor: 'rgba(200, 241, 53, 0.15)',
                    borderColor: '#c8f135',
                    borderWidth: 2,
                    pointBackgroundColor: '#c8f135',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#c8f135',
                  },
                ],
              }}
              options={{
                scales: {
                  r: {
                    angleLines: {
                      color: 'rgba(0, 0, 0, 0.1)',
                    },
                    grid: {
                      color: 'rgba(0, 0, 0, 0.1)',
                    },
                    pointLabels: {
                      font: {
                        size: 11,
                        weight: '700',
                        family: "'Inter', sans-serif",
                      },
                      color: '#222',
                    },
                    ticks: {
                      display: false,
                      stepSize: 20,
                    },
                  },
                },
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                maintainAspectRatio: true,
              }}
            />
          </div>
        </div>
        <div>
          <h2 className="section-title">Transform Your Body, Elevate Your Mind,<br />and Unlock the Strongest Version of Yourself</h2>
          <div className="stats-grid">
            <div className="stat-box"><div className="num">1,200<span>+</span></div><div className="lbl">Men Transformed</div></div>
            <div className="stat-box"><div className="num">10<span>+</span></div><div className="lbl">Years of Expert</div></div>
            <div className="stat-box"><div className="num">35<span>%</span></div><div className="lbl">Faster Results</div></div>
            <div className="stat-box"><div className="num">300<span>+</span></div><div className="lbl">Workout Plans</div></div>
          </div>
          <p className="stats-desc" style={{ marginTop: "32px" }}>We're not just a gym. We're a brotherhood of men pushing limits, breaking barriers, and proving that hard work always pays off. From personalised training plans to high-energy group sessions, everything we do is built to challenge you, motivate you, and keep you winning.</p>
          <button className="hero-btn">Start Your Transformation</button>
        </div>
      </section>

      {/*  FEATURES  */}
      <section id="features" className="landing-section">
        <div className="features-header">
          <div className="section-label">Services</div>
          <h2 className="section-title">Your Transformation Starts Here</h2>
          <p>At Fitne, and more than just a gym — we're a place where men build strength, confidence, and unstoppable energy. Here's why we stand out.</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-num">01</div>
            <h3>Expert Male-Focused Training</h3>
            <p>Every member gets a plan that fits their body, lifestyle, and goals — no generic workouts, no guesswork.</p>
          </div>
          <div className="feature-card">
            <div className="feature-num">02</div>
            <h3>100% Proven Results</h3>
            <p>We focus on measurable progress — stronger bodies, defined muscles, disciplined mindsets, and lasting transformations.</p>
          </div>
          <div className="feature-card">
            <div className="feature-num">03</div>
            <h3>Motivating Environment</h3>
            <p>Train alongside like-minded men in a high-energy group sessions and atmospheres that keep you pushing forward.</p>
          </div>
          <div className="feature-card">
            <div className="feature-num">04</div>
            <h3>Personalised Approach</h3>
            <p>Every member gets a plan that fits their body, lifestyle, and goals — no generic workouts, no guesswork.</p>
          </div>
          <div className="feature-card">
            <div className="feature-num">05</div>
            <h3>State-of-the-Art Facility</h3>
            <p>Every scheduled equipment is a selection — a place, patience, and motivation — everything is designed to help you.</p>
          </div>
          <div className="feature-card">
            <div className="feature-num">06</div>
            <h3>Commitment to Your Success</h3>
            <p>We're with you every step of the way — a place, patience, and motivation to help you achieve the results you want.</p>
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: "48px" }}>
          <button className="hero-btn">Start Your Transformation</button>
        </div>
      </section>

      {/*  TESTIMONIAL  */}
      <section id="testimonial" className="landing-section">
        <div className="testimonial-text">
          <div className="section-label">Testimonial</div>
          <h2>Transformations That Speak Louder Than Words.</h2>
          <div className="quote-card">
            <span className="quote-mark">"</span>
            <blockquote>Before joining Fitne, I struggled with consistency. The coaches have pushed me past my limits, and now I feel stronger, more confident, and in the best shape of my life.</blockquote>
            <div style={{ marginTop: "24px" }}>
              <div className="quote-author">Mark R.</div>
              <div className="quote-role">Brand Manager</div>
            </div>
          </div>
        </div>
        <div className="testimonial-imgs">
          <div className="t-img-main">
            <div className="img-placeholder"><img src="https://plus.unsplash.com/premium_photo-1713800444752-4e155bf14bff?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" srcset="" style={{width:'100%'}} /></div>
          </div>
          <div className="t-img-sm">
            <div className="img-placeholder"><img src="https://images.unsplash.com/photo-1761839258420-5c3e2f2e2a74?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" srcset="" style={{width:'100%'}}/>  </div>
          </div>
        </div>
      </section>

      {/*  TRANSFORMATION STORIES  */}
      <section id="transformation-stories" className="landing-section">
        <div className="ts-left">
          <div className="ts-tag"><span className="ts-tag-dot"></span> Transformation Stories</div>
          <h2>Real Journeys.<br />Real Change</h2>
          <p>Every transformation is different — but the foundation is the same: consistency, structure, and the right guidance.</p>
          <button className="ts-view-btn">
            View All Stories
            <span className="ts-arrow"><i className="ph ph-arrow-right"></i></span>
          </button>
        </div>
        <div className="ts-right">
          <div className="ts-cards-wrap">
            <div 
              className="ts-cards-track" 
              ref={tsTrackRef} 
              style={{ transform: getTsTransform() }}
            >

              <div className="ts-card">
                <div className="ts-card-header">
                  <div className="ts-card-result">12kg in 10 weeks</div>
                  <div className="ts-card-desc">With structured training and accountability, he built habits that led to lasting results.</div>
                </div>
                <div className="ts-card-img">
                  <div className="ts-before-after">
                    <div className="ts-before"><span className="ts-silhouette"><img src={imgT1} alt="Before" /></span></div>
                    <div className="ts-after"><span className="ts-silhouette"><img src={imgT2} alt="After" /></span></div>
                  </div>
                </div>
                <div className="ts-card-footer">
                  <button className="ts-story-btn">View Story <span className="arrow-c"><i className="ph ph-arrow-right"></i></span></button>
                </div>
              </div>

              <div className="ts-card">
                <div className="ts-card-header">
                  <div className="ts-card-result">Less 6% Body Fat</div>
                  <div className="ts-card-desc">With structured training and accountability, she built habits that led to lasting results.</div>
                </div>
                <div className="ts-card-img">
                  <div className="ts-before-after">
                    <div className="ts-before"><span className="ts-silhouette"><img src={imgT3} alt="Before" /></span></div>
                    <div className="ts-after"><span className="ts-silhouette"><img src={imgT4} alt="After" /> </span></div>
                  </div>
                </div>
                <div className="ts-card-footer">
                  <button className="ts-story-btn">View Story <span className="arrow-c"><i className="ph ph-arrow-right"></i></span></button>
                </div>
              </div>

              <div className="ts-card">
                <div className="ts-card-header">
                  <div className="ts-card-result">+18kg Muscle Mass</div>
                  <div className="ts-card-desc">Went from skinny to strong in 16 weeks with elite personalised programming.</div>
                </div>
                <div className="ts-card-img">
                  <div className="ts-before-after">
                    <div className="ts-before"><span className="ts-silhouette"><img src={imgT5} alt="Before" /></span></div>
                    <div className="ts-after"><span className="ts-silhouette"><img src={imgT6} alt="After" /></span></div>
                  </div>
                </div>
                <div className="ts-card-footer">
                  <button className="ts-story-btn">View Story <span className="arrow-c"><i className="ph ph-arrow-right"></i></span></button>
                </div>
              </div>

            </div>
          </div>
          <div className="ts-nav">
            <button className="ts-nav-btn prev2" onClick={() => tsSlide2(-1)}>←</button>
            <button className="ts-nav-btn next2" onClick={() => tsSlide2(1)}><i className="ph ph-arrow-right"></i></button>
          </div>
        </div>
      </section>

      {/*  NUVEX BRAND BANNER  */}
      <div id="nuvex-banner">
        <img src={imgNuvex} alt="" style={{ width: "90%", margin: "auto", maxHeight: "260px", maxWidth: "1270px" }} />
      </div>

      {/*  CTA  */}
      <section id="cta" className="landing-section">
        <div className="cta-left">
          <div className="section-label" style={{ color: "rgba(255,255,255,0.4)" }}>Get In Touch</div>
          <h2>Ready to<br /><span>Transform?</span></h2>
        </div>
        <div className="cta-right">
          <p>No excuses. No limits. Just results. The strongest version of you is already inside you — let's bring it out together. Be bold.</p>
          <button className="cta-btn">Start Your Transformation <i className="ph ph-arrow-right"></i></button>
        </div>
      </section>

      {/*  PRICING  */}
      <section id="pricing" className="landing-section">
        <div className="pricing-header">
          <h2>Flexible Membership Plans</h2>
        </div>
        <div className="pricing-grid">

          {/*  Basic  */}
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

          {/*  Standard (featured)  */}
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

          {/*  Premium  */}
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

      {/*  CONTACT  */}
      <section id="contact" className="landing-section">
        <div className="contact-bg-text">START<br />NOW</div>
        <div className="contact-left">
          <h2>START!<br />NOW!<br /><span>CONTACT</span><br />US!</h2>
        </div>
        <div className="contact-form-wrap">
          <div className="any-questions-badge">ANY QUESTIONS?</div>
          <div className="contact-form">
            <div className="form-group">
              <label>Name</label>
              <input type="text" placeholder="Name" id="cf-name" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="Email" id="cf-email" />
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea placeholder="Comments" id="cf-msg"></textarea>
            </div>
            <button className="form-submit" onClick="submitForm()">Send Message</button>
            <div className="form-success" id="form-success">Message Sent! We will contact you soon.</div>
          </div>
        </div>
      </section>

      {/*  TESTIMONIALS CAROUSEL  */}
      <section id="testimonials-carousel">
        <div className="tc-header">
          <h2>Read Why Our Customers Love <em>EliteFiT</em></h2>
          <div className="tc-nav">
            <button onClick={() => tcSlide(-1)}>←</button>
            <button onClick={() => tcSlide(1)}><i className="ph ph-arrow-right"></i></button>
          </div>
        </div>
        <div className="tc-track-wrap">
          <div className="tc-track" id="tcTrack" style={{ transform: `translateX(-${tcIndex * (300 + 16)}px)` }}>
            <div className="tc-card">
              <p><strong>'EliteFiT'</strong> has been life-changing. I am 72 years old and have been working out with Damian since October 2022. We meet 3 times a week. I travel a lot, and I am able to stick with my exercise routine no matter where I am!</p>
              <div className="tc-author">
                <div className="tc-avatar">D</div>
                <div className="tc-author-info"><div className="name">Donna</div><div className="loc">Oregon</div></div>
              </div>
            </div>
            <div className="tc-card">
              <p>I love <strong>EliteFiT</strong>. I have been working out with Martin, my trainer, four times a week for a few months now. It's totally changed my fitness routine. I could have never been able to afford a personal trainer normally.</p>
              <div className="tc-author">
                <div className="tc-avatar">M</div>
                <div className="tc-author-info"><div className="name">Mary Z.</div><div className="loc">California</div></div>
              </div>
            </div>
            <div className="tc-card">
              <p>From day one the coaches pushed me beyond what I thought was possible. Six months in and I've lost 22kg and gained more confidence than I've ever had. <strong>EliteFiT</strong> isn't just a gym — it's a community.</p>
              <div className="tc-author">
                <div className="tc-avatar">J</div>
                <div className="tc-author-info"><div className="name">James K.</div><div className="loc">New York</div></div>
              </div>
            </div>
            <div className="tc-card">
              <p>The personalised approach at <strong>EliteFiT</strong> is unlike anything I've experienced. My coach actually understands my goals and adjusts my plan every week. Best investment I've made in myself.</p>
              <div className="tc-author">
                <div className="tc-avatar">R</div>
                <div className="tc-author-info"><div className="name">Ryan S.</div><div className="loc">Texas</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/*  BLOG  */}
      <section id="blog">
        <div className="blog-header">
          <h2>Latest Blog Posts</h2>
        </div>
        <div className="blog-grid">
          <div className="blog-card">
            <div className="blog-img"><img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=600&auto=format&fit=crop" alt="ACTIVITY" /></div>
            <div className="blog-body">
              <div className="blog-date">February 17, 2024</div>
              <h3>Three reasons why physical activity should be a routine</h3>
              <p>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout, the point of using.</p>
              <a href="#" className="blog-read">Read More...</a>
            </div>
          </div>
          <div className="blog-card">
            <div className="blog-img"><img src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=600&auto=format&fit=crop" alt="NUTRITION" /></div>
            <div className="blog-body">
              <div className="blog-date">February 10, 2024</div>
              <h3>Fitness and nutrition tips from the healthiest countries</h3>
              <p>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout, the point of using.</p>
              <a href="#" className="blog-read">Read More...</a>
            </div>
          </div>
          <div className="blog-card">
            <div className="blog-img"><img src="https://images.unsplash.com/photo-1472745433479-4556f22e32c2?q=80&w=600&auto=format&fit=crop" alt="KIDS FIT" /></div>
            <div className="blog-body">
              <div className="blog-date">February 2, 2024</div>
              <h3>How to get your kids moving though out summer 2024</h3>
              <p>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout, the point of using.</p>
              <a href="#" className="blog-read">Read More...</a>
            </div>
          </div>
        </div>
        <div className="blog-dots">
          <button className="blog-dot-nav">+</button>
          <button className="blog-dot active"></button>
          <button className="blog-dot"></button>
          <button className="blog-dot"></button>
          <button className="blog-dot-nav next"><i className="ph ph-arrow-right"></i></button>
        </div>
      </section>

      {/*  COMMUNITY  */}
      <section id="community">
        <div className="section-label">Join Our Community</div>
        <h2>Connect with fellow fitness enthusiasts and stay motivated</h2>
        <a href="#" className="ig-btn">
          Follow Us on Instagram
          <span className="ig-btn-icon">↗</span>
        </a>
        <div className="community-photos">
          <div className="comm-photo"><div className="comm-photo-inner"><img src="https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=400&auto=format&fit=crop" alt="PULL-UP" /></div></div>
          <div className="comm-photo"><div className="comm-photo-inner"><img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop" alt="DEADLIFT" /></div></div>
          <div className="comm-photo"><div className="comm-photo-inner"><img src="https://images.unsplash.com/photo-1679214894748-bcfdcb4dcaff?q=80&w=947&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="PRESS" /></div></div>
          <div className="comm-photo"><div className="comm-photo-inner"><img src="https://images.unsplash.com/photo-1646072508214-b88d6b1677c3?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="CURL" /></div></div>
          <div className="comm-photo"><div className="comm-photo-inner"><img src="https://images.unsplash.com/photo-1604480133435-25b86862d276?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="SQUAT" /></div></div>
        </div>
      </section>

      <section id="location">
        <div className="location-label-pill">EliteFiT Deroua</div>
        <h2>Visit us and see what makes EliteFiT Deroua special</h2>
        <div className="location-info">
          <div className="loc-block">
            <span className="loc-icon"><i className="ph ph-map-pin"></i></span>
            <div>
              <h4>Address</h4>
              <p>Deroua, Province de Nouaceur<br />Casablanca-Settat, Morocco</p>
            </div>
          </div>
          <div className="loc-block">
            <span className="loc-icon"><i className="ph ph-clock"></i></span>
            <div>
              <h4>Opening Hours</h4>
              <p>Monday – Friday: 6:00 AM – 10:00 PM<br />Saturday – Sunday: 8:00 AM – 8:00 PM</p>
            </div>
          </div>
          <div className="loc-block">
            <span className="loc-icon"><i className="ph ph-envelope"></i></span>
            <div>
              <h4>Phone and Email</h4>
              <p>+212 522-123456<br />nouaceur@elitefit.com</p>
            </div>
          </div>
        </div>
        {/*  Mapbox Map  */}
        <div className="map-container">
          <MapboxMap accessToken={import.meta.env.VITE_BOXMAP} />
        </div>
      </section>


      {/*  FAQ  */}
      <section id="faq" className="landing-section">
        <div className="faq-left">
          <span className="section-label">FAQ</span>
          <h2>All Your Queries Answered.</h2>
        </div>
        <div className="faq-list">
          <div className={`faq-item ${openFaq === 0 ? 'open' : ''}`}>
            <div className="faq-q" onClick={() => toggleFaq(0)}>
              What is EliteFiT?
              <span className="faq-icon">+</span>
            </div>
            <div className="faq-a">EliteFiT is a premium men's fitness brand specialising in strength training, physique sculpting, and high-intensity conditioning. We combine expert coaching, personalised programming, and a powerful community to help you unlock your strongest self.</div>
          </div>
          <div className={`faq-item ${openFaq === 1 ? 'open' : ''}`}>
            <div className="faq-q" onClick={() => toggleFaq(1)}>
              Can I try before joining?
              <span className="faq-icon">+</span>
            </div>
            <div className="faq-a">Absolutely. We offer a free trial session for all new members. Come in, meet your coach, experience the facility, and see why thousands of men have transformed their lives with EliteFiT — no commitment required.</div>
          </div>
          <div className={`faq-item ${openFaq === 2 ? 'open' : ''}`}>
            <div className="faq-q" onClick={() => toggleFaq(2)}>
              Do you offer coaching?
              <span className="faq-icon">+</span>
            </div>
            <div className="faq-a">Yes — all our plans include access to certified coaches. Our Standard plan includes nutrition coaching and personalised workout plans, while Premium members get dedicated one-on-one personal training sessions each month.</div>
          </div>
          <div className={`faq-item ${openFaq === 3 ? 'open' : ''}`}>
            <div className="faq-q" onClick={() => toggleFaq(3)}>
              What are your opening hours?
              <span className="faq-icon">+</span>
            </div>
            <div className="faq-a">Monday to Friday: 6:00 AM – 10:00 PM. Saturday and Sunday: 8:00 AM – 8:00 PM. Premium members enjoy 24/7 access to our facilities — so your schedule is never an excuse.</div>
          </div>
          <div className={`faq-item ${openFaq === 4 ? 'open' : ''}`}>
            <div className="faq-q" onClick={() => toggleFaq(4)}>
              Do you have parking?
              <span className="faq-icon">+</span>
            </div>
            <div className="faq-a">Yes, we have free dedicated parking for all members at our main facility. For branch locations, parking availability varies — check the specific branch page for details.</div>
          </div>
        </div>
      </section>

      {/*  HEALTH DASHBOARD  */}
      <section id="health-dashboard" className="landing-section">
        <div className="hd-label">Smart Health Tracking</div>
        <h2 className="hd-title">Your body. Live. Real-time.</h2>
        <p className="hd-sub">Connect your Apple Watch, Garmin, or phone and track every workout, rep, and heartbeat — synced directly to your EliteFiT profile and coach dashboard.</p>

        {/*  Row 1: Activity list + Timer  */}
        <div className="hd-row1">
          <div className="hd-activity-card">
            <div className="hd-activity-item">
              <div className="hd-act-left">
                <div className="hd-act-icon walk"><i className="ph ph-footprints-fill"></i></div>
                <div>
                  <div className="hd-act-name">Outdoor Walk</div>
                  <div className="hd-act-val">0.57<span style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)" }}>MI</span></div>
                </div>
              </div>
              <span className="hd-act-time">Today <i className="ph ph-caret-right"></i></span>
            </div>
            <div className="hd-activity-item">
              <div className="hd-act-left">
                <div className="hd-act-icon cycle"><i className="ph ph-bicycle-fill"></i></div>
                <div>
                  <div className="hd-act-name">Cycling</div>
                  <div className="hd-act-val">5.51<span style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)" }}>KM</span></div>
                </div>
              </div>
              <span className="hd-act-time">Sunday <i className="ph ph-caret-right"></i></span>
            </div>
            <div className="hd-activity-item">
              <div className="hd-act-left">
                <div className="hd-act-icon cardio"><i className="ph ph-heartbeat-fill"></i></div>
                <div>
                  <div className="hd-act-name">Cardiovascular Training</div>
                  <div className="hd-act-val">0.69<span style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)" }}>MI</span></div>
                </div>
              </div>
              <span className="hd-act-time">Sunday <i className="ph ph-caret-right"></i></span>
            </div>
            <div className="hd-activity-title">Choose your<br />activity.</div>
            <div className="hd-activity-desc">20+ different workout types, and Meditation too. With new sessions added every week.</div>
          </div>

          <div className="hd-timer-card">
            <div style={{ width: "100%" }}>
              <div className="hd-ring-wrap">
                <svg className="hd-ring-svg" width="130" height="130" viewBox="0 0 130 130">
                  <circle className="hd-ring-bg" cx="65" cy="65" r="54" />
                  <circle className="hd-ring-fill" id="timerRing" cx="65" cy="65" r="54" />
                </svg>
                <div className="hd-ring-label">
                  <div className="hd-ring-num" id="timerNum">15</div>
                  <div className="hd-ring-unit">MIN</div>
                </div>
              </div>
            </div>
            <div className="hd-timer-title">Pick your<br />preferences</div>
            <div className="hd-timer-desc">5 to 45 minutes, with or without equipment. And you can even filter by trainer, music, or meditation theme.</div>
            {/*  Timer controls  */}
            <div style={{ display: "flex", gap: "12px", marginTop: "20px", alignItems: "center", justifyContent: "center" }}>
              <button onClick="adjustTimer(-5)" style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#2a2a2a", border: "none", color: "var(--white)", fontSize: "18px", cursor: "pointer" }}>−</button>
              <button id="timerPlayBtn" onClick="toggleTimer()" style={{ background: "var(--lime)", color: "var(--black)", border: "none", padding: "10px 24px", borderRadius: "20px", fontFamily: "'Barlow Condensed',sans-serif", fontSize: "15px", fontWeight: "700", letterSpacing: "1px", cursor: "pointer" }}><i className="ph ph-play-fill"></i> START</button>
              <button onClick="adjustTimer(5)" style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#2a2a2a", border: "none", color: "var(--white)", fontSize: "18px", cursor: "pointer" }}>+</button>
            </div>
          </div>
        </div>

        {/*  Activity Rings row  */}
        <div className="hd-rings-section">
          <div>
            <div style={{ position: "relative", width: "100px", height: "100px" }}>
              <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
                <circle className="ring-bg" cx="50" cy="50" r="45" stroke="#ff375f" />
                <circle className="ring-move" cx="50" cy="50" r="45" />
                <circle className="ring-bg" cx="50" cy="50" r="37" stroke="#c8f135" />
                <circle className="ring-exercise" cx="50" cy="50" r="37" />
                <circle className="ring-bg" cx="50" cy="50" r="29" stroke="#00b3ff" />
                <circle className="ring-stand" cx="50" cy="50" r="29" />
              </svg>
            </div>
            <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "2px" }}>
              <div className="hd-rings-stat move">204/280<span style={{ fontSize: "13px" }}>CAL</span></div>
              <div className="hd-rings-stat exercise">20/30<span style={{ fontSize: "13px" }}>MIN</span></div>
              <div className="hd-rings-stat stand">7/12<span style={{ fontSize: "13px" }}>HRS</span></div>
            </div>
          </div>

          <div className="hd-rings-chart">
            <div className="hd-chart-row">
              <div className="hd-chart-label">Move</div>
              <div className="hd-bars" id="moveBars"></div>
              <div className="hd-chart-time"><span>12 AM</span><span>6 AM</span><span>12 PM</span><span>6 PM</span></div>
            </div>
            <div className="hd-chart-row">
              <div className="hd-chart-label">Exercise</div>
              <div className="hd-bars" id="exerciseBars"></div>
            </div>
            <div className="hd-chart-row">
              <div className="hd-chart-label">Stand</div>
              <div className="hd-bars" id="standBars"></div>
            </div>
          </div>

          <div className="hd-rings-right">
            Exercise in<br />simplicity.
            <p>EliteFiT makes it quick and easy for everyone to work out or be more mindful. Over 25 new workouts and guided meditations are added each week.</p>
          </div>
        </div>

        {/*  Heart Rate section  */}
        <div className="hd-heart-section">
          <h3>Put your heart into it. Literally.</h3>
          <p>Keep an eye on your heart rate, check the status of your rings, and watch your celebrations come alive. It's all right there on the screen, so you can stay motivated throughout your workout without looking down at your wrist. Eyes forward. Progress ahead.</p>
          <div className="hd-bpm">
            <span className="hd-bpm-num" id="bpmDisplay">129</span>
            <span className="hd-heart-icon"><i className="ph ph-heart-fill"></i></span>
          </div>

          {/*  Connect devices  */}
          <div className="hd-connect">
            <div className="hd-connect-device" id="watchBtn" onClick="openModal('watch')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="7" y="2" width="10" height="20" rx="3" />
                <path d="M7 7h10M7 17h10" />
                <circle cx="12" cy="12" r="2" />
              </svg>
              <div>
                <div>Apple Watch</div>
                <div className="hd-connect-status"><span className="status-dot"></span> Connected</div>
              </div>
            </div>
            <div className="hd-connect-or">or</div>
            <div className="hd-connect-device" id="phoneBtn" onClick="openModal('phone')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="5" y="2" width="14" height="20" rx="3" />
                <circle cx="12" cy="17" r="1" />
              </svg>
              <div>
                <div>Smartphone</div>
                <div className="hd-connect-status"><span className="status-dot"></span> Connected</div>
              </div>
            </div>
            <div className="hd-connect-or">or</div>
            <div className="hd-connect-device" id="garminBtn" onClick="openModal('garmin')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 3" />
              </svg>
              <div>
                <div>Garmin / Other</div>
                <div className="hd-connect-status"><span className="status-dot"></span> Connected</div>
              </div>
            </div>
          </div>

          {/*  Live data (shown after connect)  */}
          <div className="hd-live-data" id="liveDataWidget">
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "16px" }}>Live Health Data</div>
            <div className="hd-live-grid">
              <div className="hd-live-metric"><div className="val" id="liveBpm">--</div><div className="lbl">BPM</div></div>
              <div className="hd-live-metric"><div className="val" id="liveSteps">--</div><div className="lbl">Steps</div></div>
              <div className="hd-live-metric"><div className="val" id="liveCal">--</div><div className="lbl">Calories</div></div>
              <div className="hd-live-metric"><div className="val" id="liveMin">--</div><div className="lbl">Active Min</div></div>
            </div>
            <div className="hd-webhook-status">
              <div className="hd-webhook-dot"></div>
              <span>Live sync active — data sent to your coach dashboard via webhook</span>
            </div>
          </div>
        </div>
      </section>

      {/*  CONNECT DEVICE MODAL  */}
      <div className="hd-modal" id="connectModal">
        <div className="hd-modal-box">
          <div id="modalStep1">
            <h3 id="modalTitle">Connect Device</h3>
            <p id="modalDesc">Follow the steps below to sync your health data with EliteFiT in real-time.</p>
            <div className="hd-modal-steps">
              <div className="hd-modal-step"><div className="hd-step-num">1</div><span>Open the EliteFiT app on your device and enable Health permissions</span></div>
              <div className="hd-modal-step"><div className="hd-step-num">2</div><span>Make sure Bluetooth is enabled and your device is nearby</span></div>
              <div className="hd-modal-step"><div className="hd-step-num">3</div><span>Tap "Connect Now" — your live data will sync to your coach dashboard instantly</span></div>
            </div>
            <button className="hd-modal-btn" onClick="startScan()">Connect Now</button>
            <button className="hd-modal-close" onClick="closeModal()">Cancel</button>
          </div>
          <div className="hd-scanning" id="modalScanning">
            <div className="hd-scan-ring"></div>
            <div className="hd-scan-text">Scanning for device...</div>
          </div>
          <div className="hd-scan-success" id="modalSuccess">
            <div className="hd-scan-check"><i className="ph ph-check-circle"></i></div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "24px", fontWeight: "800", color: "var(--white)" }}>Device Connected!</div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginTop: "6px" }}>Your health data is now syncing live to your EliteFiT coach dashboard.</div>
          </div>
        </div>
      </div>

      {/*  FOOTER  */}
      <footer className="landing-footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <svg width="24" height="24" viewBox="0 0 30 30" fill="none"><path d="M6 25L15 4l9 21M9 18h12" stroke="#c8f135" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
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
            <ul>
              <li><a href="#">Facebook</a></li>
              <li><a href="#">Instagram</a></li>
              <li><a href="#">Youtube</a></li>
              <li><a href="#">TikTok</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>Copyright © 2025 EliteFiT. All Rights Reserved</span>
          <span>Built with power. Trained with purpose.</span>
        </div>
      </footer>

      {/*  CHAT BUTTON  */}
      <button id="chat-btn" className={isExpanding ? 'expanding' : ''} onClick={toggleChat}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <circle cx="9" cy="10" r="1" fill="#0a0a0a" />
          <circle cx="12" cy="10" r="1" fill="#0a0a0a" />
          <circle cx="15" cy="10" r="1" fill="#0a0a0a" />
        </svg>
      </button>

      {/*  CHAT WINDOW  */}
      <div id="chat-window" className={chatOpen ? 'open' : ''}>
        <div className="chat-header">
          <div className="chat-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <div className="chat-header-info">
            <h4>EliteFiT AI Coach</h4>
            <p><span className="status-dot"></span> Online — Ready to Transform You</p>
          </div>
          <button className="chat-close" onClick={toggleChat}><i className="ph ph-x"></i></button>
        </div>

        <div id="chat-messages">
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role}`}>
              <div className="msg-bubble">
                {m.role === 'bot' && <i className="ph ph-barbell" style={{ marginRight: '8px' }}></i>}
                {m.content}
              </div>
              <div className="msg-time">{i === 0 ? 'Just now' : ''}</div>
            </div>
          ))}
        </div>

        <div className="chat-quick-btns" id="quick-btns">
          <button className="quick-btn" onClick="sendQuick('How do I start?')">How do I start?</button>
          <button className="quick-btn" onClick="sendQuick('Best workout for beginners')">Beginner workout</button>
          <button className="quick-btn" onClick="sendQuick('Nutrition tips for muscle gain')">Nutrition tips</button>
          <button className="quick-btn" onClick="sendQuick('How long to see results?')">See results</button>
        </div>

        <div className="chat-input-wrap">
          <button className="upload-btn" onClick={() => fileInputRef.current.click()}>
            <i className="ph ph-file-plus"></i>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
          <input
            type="text"
            id="chat-input"
            placeholder="Pose ta question..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') sendMsg() }}
          />
          <button id="send-btn" onClick={sendMsg}>
            <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
          </button>
        </div>
      </div>

      {/*  RADAR CHART  */}


      {/*  CHATBOT JS  */}



    </>
  );
}
