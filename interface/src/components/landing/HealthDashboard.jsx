import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ConnectModal from './ConnectModal';

export default function HealthDashboard() {
  const { t } = useTranslation('landing');
  const [modalOpen, setModalOpen] = useState(false);

  const adjustTimer = (delta) => { console.log('Timer adjusted by', delta); };
  const toggleTimer = () => { console.log('Timer toggled'); };
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  const startScan = () => { console.log('Device scan started'); };

  return (
    <section id="health-dashboard" className="landing-section">
      <div className="hd-label">{t('healthDashboard.label')}</div>
      <h2 className="hd-title">{t('healthDashboard.title')}</h2>
      <p className="hd-sub">{t('healthDashboard.subtitle')}</p>

      <div className="hd-row1">
        <div className="hd-activity-card">
          <div className="hd-activity-item">
            <div className="hd-act-left">
              <div className="hd-act-icon walk"><i className="ph ph-footprints-fill"></i></div>
              <div>
                <div className="hd-act-name">{t('healthDashboard.outdoorWalk')}</div>
                <div className="hd-act-val">0.57<span style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)" }}>MI</span></div>
              </div>
            </div>
            <span className="hd-act-time">{t('healthDashboard.today')} <i className="ph ph-caret-right"></i></span>
          </div>
          <div className="hd-activity-item">
            <div className="hd-act-left">
              <div className="hd-act-icon cycle"><i className="ph ph-bicycle-fill"></i></div>
              <div>
                <div className="hd-act-name">{t('healthDashboard.cycling')}</div>
                <div className="hd-act-val">5.51<span style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)" }}>KM</span></div>
              </div>
            </div>
            <span className="hd-act-time">{t('healthDashboard.today')} <i className="ph ph-caret-right"></i></span>
          </div>
          <div className="hd-activity-item">
            <div className="hd-act-left">
              <div className="hd-act-icon cardio"><i className="ph ph-heartbeat-fill"></i></div>
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

      <div className="hd-heart-section">
        <h3>{t('healthDashboard.heartTitle')}</h3>
        <p>{t('healthDashboard.heartDesc')}</p>
        <div className="hd-bpm">
          <span className="hd-bpm-num" id="bpmDisplay">129</span>
          <span className="hd-heart-icon"><i className="ph ph-heart-fill"></i></span>
        </div>

        <div className="hd-connect">
          <div className="hd-connect-device" id="watchBtn" onClick={openModal}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="7" y="2" width="10" height="20" rx="3" />
              <path d="M7 7h10M7 17h10" />
              <circle cx="12" cy="12" r="2" />
            </svg>
            <div>
              <div>{t('healthDashboard.appleWatch')}</div>
              <div className="hd-connect-status"><span className="status-dot"></span> {t('common:connected')}</div>
            </div>
          </div>
          <div className="hd-connect-or">or</div>
          <div className="hd-connect-device" id="phoneBtn" onClick={openModal}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="5" y="2" width="14" height="20" rx="3" />
              <circle cx="12" cy="17" r="1" />
            </svg>
            <div>
              <div>{t('healthDashboard.smartphone')}</div>
              <div className="hd-connect-status"><span className="status-dot"></span> {t('common:connected')}</div>
            </div>
          </div>
          <div className="hd-connect-or">or</div>
          <div className="hd-connect-device" id="garminBtn" onClick={openModal}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 3" />
            </svg>
            <div>
              <div>{t('healthDashboard.garmin')}</div>
              <div className="hd-connect-status"><span className="status-dot"></span> {t('common:connected')}</div>
            </div>
          </div>
        </div>

        <div className="hd-live-data" id="liveDataWidget">
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "16px" }}>{t('healthDashboard.liveHealthData')}</div>
          <div className="hd-live-grid">
            <div className="hd-live-metric"><div className="val" id="liveBpm">--</div><div className="lbl">{t('healthDashboard.bpm')}</div></div>
            <div className="hd-live-metric"><div className="val" id="liveSteps">--</div><div className="lbl">{t('healthDashboard.steps')}</div></div>
            <div className="hd-live-metric"><div className="val" id="liveCal">--</div><div className="lbl">{t('healthDashboard.calories')}</div></div>
            <div className="hd-live-metric"><div className="val" id="liveMin">--</div><div className="lbl">{t('healthDashboard.activeMin')}</div></div>
          </div>
          <div className="hd-webhook-status">
            <div className="hd-webhook-dot"></div>
            <span>{t('healthDashboard.liveSync')}</span>
          </div>
        </div>
      </div>

      <ConnectModal isOpen={modalOpen} onClose={closeModal} onScan={startScan} />
    </section>
  );
}
