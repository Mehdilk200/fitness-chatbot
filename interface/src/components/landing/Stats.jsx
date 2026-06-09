import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export default function Stats() {
  return (
    <section id="stats" className="landing-section">
      <div className="radar-wrap">
        <div className="section-label">Where Power Is Built</div>
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <Radar 
            data={{
              labels: ['UNSTOPPABLE', 'STRONGER', 'FOCUSED', 'LIMITLESS', 'RELENTLESS', 'POWERFUL'],
              datasets: [
                {
                  label: 'Elite Performance',
                  data: [85, 95, 75, 90, 80, 88],
                  backgroundColor: 'rgba(200, 241, 53, 0.15)',
                  borderColor: '#c8f135',
                  borderWidth: 2,
                  pointBackgroundColor: '#c8f135',
                  pointBorderColor: '#fff',
                  pointHoverBackgroundColor: '#fff',
                  pointHoverBorderColor: '#c8f135',
                },
              ],
            }}
            options={{
              scales: {
                r: {
                  angleLines: { color: 'rgba(0, 0, 0, 0.1)' },
                  grid: { color: 'rgba(0, 0, 0, 0.1)' },
                  pointLabels: {
                    font: { size: 11, weight: '700', family: "'Inter', sans-serif" },
                    color: '#222',
                  },
                  ticks: { display: false, stepSize: 20 },
                },
              },
              plugins: { legend: { display: false } },
              maintainAspectRatio: true,
            }}
          />
        </div>
      </div>
      <div>
        <h2 className="section-title">Transform Your Body, Elevate Your Mind,<br />and Unlock the Strongest Version of Yourself</h2>
        <div className="stats-grid">
          <div className="stat-box"><div className="num">1,200<span>+</span></div><div className="lbl">Men Transformed</div></div>
          <div className="stat-box"><div className="num">10<span>+</span></div><div className="lbl">Years of Expert</div></div>
          <div className="stat-box"><div className="num">35<span>%</span></div><div className="lbl">Faster Results</div></div>
          <div className="stat-box"><div className="num">300<span>+</span></div><div className="lbl">Workout Plans</div></div>
        </div>
        <p className="stats-desc" style={{ marginTop: "32px" }}>We're not just a gym. We're a brotherhood of men pushing limits, breaking barriers, and proving that hard work always pays off. From personalised training plans to high-energy group sessions, everything we do is built to challenge you, motivate you, and keep you winning.</p>
        <button className="hero-btn">Start Your Transformation</button>
      </div>
    </section>
  );
}
