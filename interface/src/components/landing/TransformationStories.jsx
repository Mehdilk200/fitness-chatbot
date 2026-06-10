import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import imgT1 from "../../assets/ts-01.png";
import imgT2 from "../../assets/ts-02.png";
import imgT3 from "../../assets/ts-03.png";
import imgT4 from "../../assets/ts-04.png";
import imgT5 from "../../assets/ts-05.png";
import imgT6 from "../../assets/ts-06.png";

export default function TransformationStories() {
  const { t } = useTranslation('landing');
  const [tsIndex, setTsIndex] = useState(0);
  const tsTrackRef = useRef(null);

  const tsSlide2 = (dir) => {
    const track = tsTrackRef.current;
    if (!track) return;
    const totalCards = track.children.length;
    const visibleCards = 2;
    let newIndex = tsIndex + dir;
    if (newIndex < 0) newIndex = 0;
    if (newIndex > totalCards - visibleCards) newIndex = totalCards - visibleCards;
    setTsIndex(newIndex);
  };

  const getTsTransform = () => {
    const track = tsTrackRef.current;
    if (!track || track.children.length === 0) return 'translateX(0)';
    const card = track.children[0];
    const width = card.offsetWidth;
    const gap = parseInt(window.getComputedStyle(track).gap) || 0;
    return `translateX(-${tsIndex * (width + gap)}px)`;
  };

  return (
    <section id="transformation-stories" className="landing-section">
      <div className="ts-left">
        <div className="ts-tag"><span className="ts-tag-dot"></span> {t('transformationStories.tag')}</div>
        <h2>{t('transformationStories.title')}</h2>
        <p>{t('transformationStories.description')}</p>
        <button className="ts-view-btn">
          {t('transformationStories.cta')}
          <span className="ts-arrow"><i className="ph ph-arrow-right"></i></span>
        </button>
      </div>
      <div className="ts-right">
        <div className="ts-cards-wrap">
          <div className="ts-cards-track" ref={tsTrackRef} style={{ transform: getTsTransform() }}>
            <div className="ts-card">
              <div className="ts-card-header">
                <div className="ts-card-result">{t('transformationStories.card1Result')}</div>
                <div className="ts-card-desc">{t('transformationStories.card1Desc')}</div>
              </div>
              <div className="ts-card-img">
                <div className="ts-before-after">
                  <div className="ts-before"><span className="ts-silhouette"><img src={imgT1} alt="Before" /></span></div>
                  <div className="ts-after"><span className="ts-silhouette"><img src={imgT2} alt="After" /></span></div>
                </div>
              </div>
              <div className="ts-card-footer">
                <button className="ts-story-btn">{t('common:viewStory')} <span className="arrow-c"><i className="ph ph-arrow-right"></i></span></button>
              </div>
            </div>
            <div className="ts-card">
              <div className="ts-card-header">
                <div className="ts-card-result">{t('transformationStories.card2Result')}</div>
                <div className="ts-card-desc">{t('transformationStories.card2Desc')}</div>
              </div>
              <div className="ts-card-img">
                <div className="ts-before-after">
                  <div className="ts-before"><span className="ts-silhouette"><img src={imgT3} alt="Before" /></span></div>
                  <div className="ts-after"><span className="ts-silhouette"><img src={imgT4} alt="After" /> </span></div>
                </div>
              </div>
              <div className="ts-card-footer">
                <button className="ts-story-btn">{t('common:viewStory')} <span className="arrow-c"><i className="ph ph-arrow-right"></i></span></button>
              </div>
            </div>
            <div className="ts-card">
              <div className="ts-card-header">
                <div className="ts-card-result">{t('transformationStories.card3Result')}</div>
                <div className="ts-card-desc">{t('transformationStories.card3Desc')}</div>
              </div>
              <div className="ts-card-img">
                <div className="ts-before-after">
                  <div className="ts-before"><span className="ts-silhouette"><img src={imgT5} alt="Before" /></span></div>
                  <div className="ts-after"><span className="ts-silhouette"><img src={imgT6} alt="After" /></span></div>
                </div>
              </div>
              <div className="ts-card-footer">
                <button className="ts-story-btn">{t('common:viewStory')} <span className="arrow-c"><i className="ph ph-arrow-right"></i></span></button>
              </div>
            </div>
          </div>
        </div>
        <div className="ts-nav">
          <button className="ts-nav-btn prev2" onClick={() => tsSlide2(-1)}>{t('common:previous')}</button>
          <button className="ts-nav-btn next2" onClick={() => tsSlide2(1)}><i className="ph ph-arrow-right"></i></button>
        </div>
      </div>
    </section>
  );
}
