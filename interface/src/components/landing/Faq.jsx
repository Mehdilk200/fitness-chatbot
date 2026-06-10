import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Faq() {
  const { t } = useTranslation('landing');
  const [openFaq, setOpenFaq] = useState(0);
  const toggleFaq = (index) => setOpenFaq(openFaq === index ? null : index);

  return (
    <section id="faq" className="landing-section">
      <div className="faq-left">
        <span className="section-label">{t('faq.label')}</span>
        <h2>{t('faq.title')}</h2>
      </div>
      <div className="faq-list">
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className={`faq-item ${openFaq === n - 1 ? 'open' : ''}`}>
            <div className="faq-q" onClick={() => toggleFaq(n - 1)}>
              {t(`faq.q${n}`)}
              <span className="faq-icon">+</span>
            </div>
            <div className="faq-a">{t(`faq.a${n}`)}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
