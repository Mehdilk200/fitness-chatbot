import { useState, useRef } from 'react';
import imgT1 from "../../assets/ts-01.png";
import imgT2 from "../../assets/ts-02.png";
import imgT3 from "../../assets/ts-03.png";
import imgT4 from "../../assets/ts-04.png";
import imgT5 from "../../assets/ts-05.png";
import imgT6 from "../../assets/ts-06.png";

export default function TransformationStories() {
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
          <div className="ts-cards-track" ref={tsTrackRef} style={{ transform: getTsTransform() }}>
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
  );
}
