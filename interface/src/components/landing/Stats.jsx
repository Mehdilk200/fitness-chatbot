import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('landing');

  return (
    <section id="stats" className="landing-section">
      <div className="radar-wrap">
        <div className="section-label">{t('stats.label')}</div>
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <Radar 
            data={{
              labels: [
                t('stats.radarUnstoppable'),
                t('stats.radarStronger'),
                t('stats.radarFocused'),
                t('stats.radarLimitless'),
                t('stats.radarRelentless'),
                t('stats.radarPowerful'),
              ],
              datasets: [
                {
                  label: t('stats.radarLabel'),
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
        <h2 className="section-title">{t('stats.title')}</h2>
        <div className="stats-grid">
          <div className="stat-box"><div className="num">1,200<span>+</span></div><div className="lbl">{t('stats.statMen')}</div></div>
          <div className="stat-box"><div className="num">10<span>+</span></div><div className="lbl">{t('stats.statYears')}</div></div>
          <div className="stat-box"><div className="num">35<span>%</span></div><div className="lbl">{t('stats.statFaster')}</div></div>
          <div className="stat-box"><div className="num">300<span>+</span></div><div className="lbl">{t('stats.statPlans')}</div></div>
        </div>
        <p className="stats-desc" style={{ marginTop: "32px" }}>{t('stats.description')}</p>
        <button className="hero-btn">{t('stats.cta')}</button>
      </div>
    </section>
  );
}
