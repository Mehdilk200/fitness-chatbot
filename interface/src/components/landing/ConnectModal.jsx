import { useTranslation } from 'react-i18next';

export default function ConnectModal({ isOpen, onClose, onScan }) {
  const { t } = useTranslation('landing');
  if (!isOpen) return null;

  return (
    <div className="hd-modal" id="connectModal">
      <div className="hd-modal-box">
        <div id="modalStep1">
          <h3 id="modalTitle">{t('healthDashboard.connectDevice')}</h3>
          <p id="modalDesc">{t('healthDashboard.connectDesc')}</p>
          <div className="hd-modal-steps">
            <div className="hd-modal-step"><div className="hd-step-num">1</div><span>{t('healthDashboard.step1')}</span></div>
            <div className="hd-modal-step"><div className="hd-step-num">2</div><span>{t('healthDashboard.step2')}</span></div>
            <div className="hd-modal-step"><div className="hd-step-num">3</div><span>{t('healthDashboard.step3')}</span></div>
          </div>
          <button className="hd-modal-btn" onClick={onScan}>{t('healthDashboard.connectNow')}</button>
          <button className="hd-modal-close" onClick={onClose}>{t('common:cancel')}</button>
        </div>
        <div className="hd-scanning" id="modalScanning">
          <div className="hd-scan-ring"></div>
          <div className="hd-scan-text">{t('healthDashboard.scanning')}</div>
        </div>
        <div className="hd-scan-success" id="modalSuccess">
          <div className="hd-scan-check"><i className="ph ph-check-circle"></i></div>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "24px", fontWeight: "800", color: "var(--white)" }}>{t('healthDashboard.deviceConnected')}</div>
          <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginTop: "6px" }}>{t('healthDashboard.deviceConnectedDesc')}</div>
        </div>
      </div>
    </div>
  );
}
