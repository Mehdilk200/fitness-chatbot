import { useTranslation } from 'react-i18next';

export default function Testimonial() {
  const { t } = useTranslation('landing');

  return (
    <section id="testimonial" className="landing-section">
      <div className="testimonial-text">
        <div className="section-label">{t('testimonial.label')}</div>
        <h2>{t('testimonial.title')}</h2>
        <div className="quote-card">
          <span className="quote-mark">"</span>
          <blockquote>{t('testimonial.quote')}</blockquote>
          <div style={{ marginTop: "24px" }}>
            <div className="quote-author">{t('testimonial.author')}</div>
            <div className="quote-role">{t('testimonial.role')}</div>
          </div>
        </div>
      </div>
      <div className="testimonial-imgs">
        <div className="t-img-main">
          <div className="img-placeholder"><img src="https://plus.unsplash.com/premium_photo-1713800444752-4e155bf14bff?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" srcSet="" style={{width:'100%'}} /></div>
        </div>
        <div className="t-img-sm">
          <div className="img-placeholder"><img src="https://images.unsplash.com/photo-1761839258420-5c3e2f2e2a74?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" srcSet="" style={{width:'100%'}}/>  </div>
        </div>
      </div>
    </section>
  );
}
