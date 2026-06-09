import { useState } from 'react';

export default function TestimonialsCarousel() {
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
  );
}
