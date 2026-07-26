import { useTranslation } from 'react-i18next';

export default function HealthDashboard() {
  const { t } = useTranslation('landing');

  const adjustTimer = (delta) => { console.log('Timer adjusted by', delta); };
  const toggleTimer = () => { console.log('Timer toggled'); };

  return (
    <section id="health-dashboard" className="landing-section">
      <div className="hd-label">{t('healthDashboard.label')}</div>
      <h2 className="hd-title">{t('healthDashboard.title')}</h2>
      <p className="hd-sub">{t('healthDashboard.subtitle')}</p>

      <div className="hd-row1">
        <div className="hd-activity-card">
          <div className="hd-activity-item">
            <div className="hd-act-left">
              <div className="hd-act-icon walk"><i className="ph ph-footprints"></i></div>
              <div>
                <div className="hd-act-name">{t('healthDashboard.outdoorWalk')}</div>
                <div className="hd-act-val">0.57<span style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)" }}>MI</span></div>
              </div>
            </div>
            <span className="hd-act-time">{t('healthDashboard.today')} <i className="ph ph-caret-right"></i></span>
          </div>
          <div className="hd-activity-item">
            <div className="hd-act-left">
              <div className="hd-act-icon cycle"><i className="ph ph-bicycle"></i></div>
              <div>
                <div className="hd-act-name">{t('healthDashboard.cycling')}</div>
                <div className="hd-act-val">5.51<span style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)" }}>KM</span></div>
              </div>
            </div>
            <span className="hd-act-time">{t('healthDashboard.today')} <i className="ph ph-caret-right"></i></span>
          </div>
          <div className="hd-activity-item">
            <div className="hd-act-left">
              <div className="hd-act-icon cardio"><i className="ph ph-heartbeat"></i></div>
              <div>
                <div className="hd-act-name">{t('healthDashboard.cardio')}</div>
                <div className="hd-act-val">0.69<span style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)" }}>MI</span></div>
              </div>
            </div>
            <span className="hd-act-time">{t('healthDashboard.today')} <i className="ph ph-caret-right"></i></span>
          </div>
          <div className="hd-activity-title">{t('healthDashboard.activityTitle')}</div>
          <div className="hd-activity-desc">{t('healthDashboard.activityDesc')}</div>
        </div>

        <div className="hd-timer-card">
          <div style={{ width: "100%" }}>
            <div className="hd-ring-wrap">
              <svg className="hd-ring-svg" width="130" height="130" viewBox="0 0 130 130">
                <circle className="hd-ring-bg" cx="65" cy="65" r="54" />
                <circle className="hd-ring-fill" id="timerRing" cx="65" cy="65" r="54" />
              </svg>
              <div className="hd-ring-label">
                <div className="hd-ring-num" id="timerNum">15</div>
                <div className="hd-ring-unit">MIN</div>
              </div>
            </div>
          </div>
          <div className="hd-timer-title">{t('healthDashboard.timerTitle')}</div>
          <div className="hd-timer-desc">{t('healthDashboard.timerDesc')}</div>
          <div style={{ display: "flex", gap: "12px", marginTop: "20px", alignItems: "center", justifyContent: "center" }}>
            <button onClick={() => adjustTimer(-5)} style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#2a2a2a", border: "none", color: "var(--white)", fontSize: "18px", cursor: "pointer" }}>−</button>
            <button id="timerPlayBtn" onClick={toggleTimer} style={{ background: "var(--lime)", color: "var(--black)", border: "none", padding: "10px 24px", borderRadius: "20px", fontFamily: "'Barlow Condensed',sans-serif", fontSize: "15px", fontWeight: "700", letterSpacing: "1px", cursor: "pointer" }}><i className="ph ph-play-fill"></i> {t('healthDashboard.start')}</button>
            <button onClick={() => adjustTimer(5)} style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#2a2a2a", border: "none", color: "var(--white)", fontSize: "18px", cursor: "pointer" }}>+</button>
          </div>
        </div>
      </div>

      <div className="hd-rings-section">
        <div>
          <div style={{ position: "relative", width: "100px", height: "100px" }}>
            <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
              <circle className="ring-bg" cx="50" cy="50" r="45" stroke="#ff375f" />
              <circle className="ring-move" cx="50" cy="50" r="45" />
              <circle className="ring-bg" cx="50" cy="50" r="37" stroke="#c8f135" />
              <circle className="ring-exercise" cx="50" cy="50" r="37" />
              <circle className="ring-bg" cx="50" cy="50" r="29" stroke="#00b3ff" />
              <circle className="ring-stand" cx="50" cy="50" r="29" />
            </svg>
          </div>
          <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "2px" }}>
            <div className="hd-rings-stat move">{t('healthDashboard.move')} 204/280<span style={{ fontSize: "13px" }}>CAL</span></div>
            <div className="hd-rings-stat exercise">{t('healthDashboard.exercise')} 20/30<span style={{ fontSize: "13px" }}>MIN</span></div>
            <div className="hd-rings-stat stand">{t('healthDashboard.stand')} 7/12<span style={{ fontSize: "13px" }}>HRS</span></div>
          </div>
        </div>

        <div className="hd-rings-chart">
          <div className="hd-chart-row">
            <div className="hd-chart-label">{t('healthDashboard.move')}</div>
            <div className="hd-bars" id="moveBars"></div>
            <div className="hd-chart-time"><span>12 AM</span><span>6 AM</span><span>12 PM</span><span>6 PM</span></div>
          </div>
          <div className="hd-chart-row">
            <div className="hd-chart-label">{t('healthDashboard.exercise')}</div>
            <div className="hd-bars" id="exerciseBars"></div>
          </div>
          <div className="hd-chart-row">
            <div className="hd-chart-label">{t('healthDashboard.stand')}</div>
            <div className="hd-bars" id="standBars"></div>
          </div>
        </div>

        <div className="hd-rings-right">
          Exercise in<br />simplicity.
          <p>{t('healthDashboard.activityDesc')}</p>
        </div>
      </div>

    </section>
  );
}
