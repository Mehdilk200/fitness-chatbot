import { useState } from 'react';

export default function ConnectModal({ isOpen, onClose, onScan }) {
  if (!isOpen) return null;

  return (
    <div className="hd-modal" id="connectModal">
      <div className="hd-modal-box">
        <div id="modalStep1">
          <h3 id="modalTitle">Connect Device</h3>
          <p id="modalDesc">Follow the steps below to sync your health data with EliteFiT in real-time.</p>
          <div className="hd-modal-steps">
            <div className="hd-modal-step"><div className="hd-step-num">1</div><span>Open the EliteFiT app on your device and enable Health permissions</span></div>
            <div className="hd-modal-step"><div className="hd-step-num">2</div><span>Make sure Bluetooth is enabled and your device is nearby</span></div>
            <div className="hd-modal-step"><div className="hd-step-num">3</div><span>Tap "Connect Now" — your live data will sync to your coach dashboard instantly</span></div>
          </div>
          <button className="hd-modal-btn" onClick={onScan}>Connect Now</button>
          <button className="hd-modal-close" onClick={onClose}>Cancel</button>
        </div>
        <div className="hd-scanning" id="modalScanning">
          <div className="hd-scan-ring"></div>
          <div className="hd-scan-text">Scanning for device...</div>
        </div>
        <div className="hd-scan-success" id="modalSuccess">
          <div className="hd-scan-check"><i className="ph ph-check-circle"></i></div>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "24px", fontWeight: "800", color: "var(--white)" }}>Device Connected!</div>
          <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginTop: "6px" }}>Your health data is now syncing live to your EliteFiT coach dashboard.</div>
        </div>
      </div>
    </div>
  );
}
