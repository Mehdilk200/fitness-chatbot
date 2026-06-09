import ConnectModal from './ConnectModal';
import { useState } from 'react';

export default function HealthDashboard() {
  const [modalOpen, setModalOpen] = useState(false);

  const adjustTimer = (delta) => { console.log('Timer adjusted by', delta); };
  const toggleTimer = () => { console.log('Timer toggled'); };
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  const startScan = () => { console.log('Device scan started'); };

  return (
    <section id="health-dashboard" className="landing-section">
      <div className="hd-label">Smart Health Tracking</div>
      <h2 className="hd-title">Your body. Live. Real-time.</h2>
      <p className="hd-sub">Connect your Apple Watch, Garmin, or phone and track every workout, rep, and heartbeat — synced directly to your EliteFiT profile and coach dashboard.</p>

      <div className="hd-row1">
        <div className="hd-activity-card">
          <div className="hd-activity-item">
            <div className="hd-act-left">
              <div className="hd-act-icon walk"><i className="ph ph-footprints-fill"></i></div>
              <div>
                <div className="hd-act-name">Outdoor Walk</div>
                <div className="hd-act-val">0.57<span style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)" }}>MI</span></div>
              </div>
            </div>
            <span className="hd-act-time">Today <i className="ph ph-caret-right"></i></span>
          </div>
          <div className="hd-activity-item">
            <div className="hd-act-left">
              <div className="hd-act-icon cycle"><i className="ph ph-bicycle-fill"></i></div>
              <div>
                <div className="hd-act-name">Cycling</div>
                <div className="hd-act-val">5.51<span style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)" }}>KM</span></div>
              </div>
            </div>
            <span className="hd-act-time">Sunday <i className="ph ph-caret-right"></i></span>
          </div>
          <div className="hd-activity-item">
            <div className="hd-act-left">
              <div className="hd-act-icon cardio"><i className="ph ph-heartbeat-fill"></i></div>
              <div>
                <div className="hd-act-name">Cardiovascular Training</div>
                <div className="hd-act-val">0.69<span style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)" }}>MI</span></div>
              </div>
            </div>
            <span className="hd-act-time">Sunday <i className="ph ph-caret-right"></i></span>
          </div>
          <div className="hd-activity-title">Choose your<br />activity.</div>
          <div className="hd-activity-desc">20+ different workout types, and Meditation too. With new sessions added every week.</div>
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
          <div className="hd-timer-title">Pick your<br />preferences</div>
          <div className="hd-timer-desc">5 to 45 minutes, with or without equipment. And you can even filter by trainer, music, or meditation theme.</div>
          <div style={{ display: "flex", gap: "12px", marginTop: "20px", alignItems: "center", justifyContent: "center" }}>
            <button onClick={() => adjustTimer(-5)} style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#2a2a2a", border: "none", color: "var(--white)", fontSize: "18px", cursor: "pointer" }}>−</button>
            <button id="timerPlayBtn" onClick={toggleTimer} style={{ background: "var(--lime)", color: "var(--black)", border: "none", padding: "10px 24px", borderRadius: "20px", fontFamily: "'Barlow Condensed',sans-serif", fontSize: "15px", fontWeight: "700", letterSpacing: "1px", cursor: "pointer" }}><i className="ph ph-play-fill"></i> START</button>
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
            <div className="hd-rings-stat move">204/280<span style={{ fontSize: "13px" }}>CAL</span></div>
            <div className="hd-rings-stat exercise">20/30<span style={{ fontSize: "13px" }}>MIN</span></div>
            <div className="hd-rings-stat stand">7/12<span style={{ fontSize: "13px" }}>HRS</span></div>
          </div>
        </div>

        <div className="hd-rings-chart">
          <div className="hd-chart-row">
            <div className="hd-chart-label">Move</div>
            <div className="hd-bars" id="moveBars"></div>
            <div className="hd-chart-time"><span>12 AM</span><span>6 AM</span><span>12 PM</span><span>6 PM</span></div>
          </div>
          <div className="hd-chart-row">
            <div className="hd-chart-label">Exercise</div>
            <div className="hd-bars" id="exerciseBars"></div>
          </div>
          <div className="hd-chart-row">
            <div className="hd-chart-label">Stand</div>
            <div className="hd-bars" id="standBars"></div>
          </div>
        </div>

        <div className="hd-rings-right">
          Exercise in<br />simplicity.
          <p>EliteFiT makes it quick and easy for everyone to work out or be more mindful. Over 25 new workouts and guided meditations are added each week.</p>
        </div>
      </div>

      <div className="hd-heart-section">
        <h3>Put your heart into it. Literally.</h3>
        <p>Keep an eye on your heart rate, check the status of your rings, and watch your celebrations come alive. It's all right there on the screen, so you can stay motivated throughout your workout without looking down at your wrist. Eyes forward. Progress ahead.</p>
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
              <div>Apple Watch</div>
              <div className="hd-connect-status"><span className="status-dot"></span> Connected</div>
            </div>
          </div>
          <div className="hd-connect-or">or</div>
          <div className="hd-connect-device" id="phoneBtn" onClick={openModal}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="5" y="2" width="14" height="20" rx="3" />
              <circle cx="12" cy="17" r="1" />
            </svg>
            <div>
              <div>Smartphone</div>
              <div className="hd-connect-status"><span className="status-dot"></span> Connected</div>
            </div>
          </div>
          <div className="hd-connect-or">or</div>
          <div className="hd-connect-device" id="garminBtn" onClick={openModal}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 3" />
            </svg>
            <div>
              <div>Garmin / Other</div>
              <div className="hd-connect-status"><span className="status-dot"></span> Connected</div>
            </div>
          </div>
        </div>

        <div className="hd-live-data" id="liveDataWidget">
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "16px" }}>Live Health Data</div>
          <div className="hd-live-grid">
            <div className="hd-live-metric"><div className="val" id="liveBpm">--</div><div className="lbl">BPM</div></div>
            <div className="hd-live-metric"><div className="val" id="liveSteps">--</div><div className="lbl">Steps</div></div>
            <div className="hd-live-metric"><div className="val" id="liveCal">--</div><div className="lbl">Calories</div></div>
            <div className="hd-live-metric"><div className="val" id="liveMin">--</div><div className="lbl">Active Min</div></div>
          </div>
          <div className="hd-webhook-status">
            <div className="hd-webhook-dot"></div>
            <span>Live sync active — data sent to your coach dashboard via webhook</span>
          </div>
        </div>
      </div>

      <ConnectModal isOpen={modalOpen} onClose={closeModal} onScan={startScan} />
    </section>
  );
}
