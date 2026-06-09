import { useState } from 'react';

export default function Faq() {
  const [openFaq, setOpenFaq] = useState(0);
  const toggleFaq = (index) => setOpenFaq(openFaq === index ? null : index);

  return (
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
  );
}
