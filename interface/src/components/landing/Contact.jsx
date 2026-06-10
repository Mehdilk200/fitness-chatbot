import { useTranslation } from 'react-i18next';

export default function Contact() {
  const { t } = useTranslation('landing');

  const submitForm = () => {
    const formSuccess = document.getElementById('form-success');
    if (formSuccess) formSuccess.style.display = 'block';
  };

  return (
    <section id="contact" className="landing-section">
      <div className="contact-bg-text">{t('contact.bgText')}</div>
      <div className="contact-left">
        <h2>{t('contact.title')}</h2>
      </div>
      <div className="contact-form-wrap">
        <div className="any-questions-badge">{t('contact.badge')}</div>
        <div className="contact-form">
          <div className="form-group">
            <label>{t('contact.nameLabel')}</label>
            <input type="text" placeholder={t('contact.namePlaceholder')} id="cf-name" />
          </div>
          <div className="form-group">
            <label>{t('contact.emailLabel')}</label>
            <input type="email" placeholder={t('contact.emailPlaceholder')} id="cf-email" />
          </div>
          <div className="form-group">
            <label>{t('contact.messageLabel')}</label>
            <textarea placeholder={t('contact.messagePlaceholder')} id="cf-msg"></textarea>
          </div>
          <button className="form-submit" onClick={submitForm}>{t('contact.submit')}</button>
          <div className="form-success" id="form-success">{t('contact.success')}</div>
        </div>
      </div>
    </section>
  );
}
