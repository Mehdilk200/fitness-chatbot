import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function TestimonialsCarousel() {
  const { t } = useTranslation('landing');
  const [tcIndex, setTcIndex] = useState(0);

  const tcSlide = (dir) => {
    const track = document.getElementById('tcTrack');
    const cards = track.children.length;
    let newIndex = tcIndex + dir;
    if (newIndex < 0) newIndex = 0;
    if (newIndex > cards - 1) newIndex = cards - 1;
    setTcIndex(newIndex);
  };

  return (
    <section id="testimonials-carousel">
      <div className="tc-header">
        <h2>{t('testimonialsCarousel.title')}</h2>
        <div className="tc-nav">
          <button onClick={() => tcSlide(-1)}><i className="ph ph-arrow-left"></i></button>
          <button onClick={() => tcSlide(1)}><i className="ph ph-arrow-right"></i></button>
        </div>
      </div>
      <div className="tc-track-wrap">
        <div className="tc-track" id="tcTrack" style={{ transform: `translateX(-${tcIndex * (300 + 16)}px)` }}>
          <div className="tc-card">
            <p><strong>'EliteFiT'</strong> {t('testimonialsCarousel.card1')}</p>
            <div className="tc-author">
              <div className="tc-avatar">D</div>
              <div className="tc-author-info"><div className="name">{t('testimonialsCarousel.card1Author')}</div><div className="loc">{t('testimonialsCarousel.card1Loc')}</div></div>
            </div>
          </div>
          <div className="tc-card">
            <p>{t('testimonialsCarousel.card2')}</p>
            <div className="tc-author">
              <div className="tc-avatar">M</div>
              <div className="tc-author-info"><div className="name">{t('testimonialsCarousel.card2Author')}</div><div className="loc">{t('testimonialsCarousel.card2Loc')}</div></div>
            </div>
          </div>
          <div className="tc-card">
            <p>{t('testimonialsCarousel.card3')}</p>
            <div className="tc-author">
              <div className="tc-avatar">J</div>
              <div className="tc-author-info"><div className="name">{t('testimonialsCarousel.card3Author')}</div><div className="loc">{t('testimonialsCarousel.card3Loc')}</div></div>
            </div>
          </div>
          <div className="tc-card">
            <p>{t('testimonialsCarousel.card4')}</p>
            <div className="tc-author">
              <div className="tc-avatar">R</div>
              <div className="tc-author-info"><div className="name">{t('testimonialsCarousel.card4Author')}</div><div className="loc">{t('testimonialsCarousel.card4Loc')}</div></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
