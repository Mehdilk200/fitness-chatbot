export default function Contact() {
  const submitForm = () => {
    const formSuccess = document.getElementById('form-success');
    if (formSuccess) formSuccess.style.display = 'block';
  };

  return (
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
          <button className="form-submit" onClick={submitForm}>Send Message</button>
          <div className="form-success" id="form-success">Message Sent! We will contact you soon.</div>
        </div>
      </div>
    </section>
  );
}
