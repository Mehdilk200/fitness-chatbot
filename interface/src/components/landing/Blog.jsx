import { useTranslation } from 'react-i18next';

export default function Blog() {
  const { t } = useTranslation('landing');

  return (
    <section id="blog">
      <div className="blog-header">
        <h2>{t('blog.title')}</h2>
      </div>
      <div className="blog-grid">
        <div className="blog-card">
          <div className="blog-img"><img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=600&auto=format&fit=crop" alt="ACTIVITY" /></div>
          <div className="blog-body">
            <div className="blog-date">{t('blog.card1Date')}</div>
            <h3>{t('blog.card1Title')}</h3>
            <p>{t('blog.card1Desc')}</p>
            <a href="#" className="blog-read">{t('common:readMore')}</a>
          </div>
        </div>
        <div className="blog-card">
          <div className="blog-img"><img src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=600&auto=format&fit=crop" alt="NUTRITION" /></div>
          <div className="blog-body">
            <div className="blog-date">{t('blog.card2Date')}</div>
            <h3>{t('blog.card2Title')}</h3>
            <p>{t('blog.card2Desc')}</p>
            <a href="#" className="blog-read">{t('common:readMore')}</a>
          </div>
        </div>
        <div className="blog-card">
          <div className="blog-img"><img src="https://images.unsplash.com/photo-1472745433479-4556f22e32c2?q=80&w=600&auto=format&fit=crop" alt="KIDS FIT" /></div>
          <div className="blog-body">
            <div className="blog-date">{t('blog.card3Date')}</div>
            <h3>{t('blog.card3Title')}</h3>
            <p>{t('blog.card3Desc')}</p>
            <a href="#" className="blog-read">{t('common:readMore')}</a>
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
  );
}
