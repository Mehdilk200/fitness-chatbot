import { useState, useEffect } from 'react';
import { wearableApi } from '../services/api';

const PROVIDERS = [
  {
    id: 'strava',
    name: 'Strava',
    icon: 'ph ph-map-trifold',
    color: '#FC4C02',
    bg: '#FC4C0215',
    desc: 'Cycling, running, swimming',
  },
  {
    id: 'fitbit',
    name: 'Fitbit',
    icon: 'ph ph-activity',
    color: '#00B0B9',
    bg: '#00B0B915',
    desc: 'Steps, sleep, heart rate',
  },
];

export default function WearableModal({ isOpen, onClose, onConnected }) {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState({});

  useEffect(() => {
    if (isOpen) {
      setError(null);
      loadStatus();
    }
  }, [isOpen]);

  const loadStatus = async () => {
    try {
      const res = await wearableApi.getStatus();
      setConnections(res.connections || []);
    } catch (e) {
      console.warn('Failed to load wearable status:', e);
    }
  };

  const getConnected = (providerId) => {
    return connections.find((c) => c.provider === providerId && c.connected);
  };

  const handleConnect = async (providerId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await wearableApi.getConnectUrl(providerId);
      if (res.authorization_url) {
        window.location.href = res.authorization_url;
      } else {
        setError('Failed to get authorization URL');
      }
    } catch (e) {
      setError(e.message || 'Connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async (providerId) => {
    setLoading(true);
    setError(null);
    try {
      await wearableApi.disconnect(providerId);
      await loadStatus();
      if (onConnected) onConnected();
    } catch (e) {
      setError(e.message || 'Disconnect failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (providerId) => {
    setSyncing((prev) => ({ ...prev, [providerId]: true }));
    setError(null);
    try {
      await wearableApi.sync(providerId);
      await loadStatus();
      if (onConnected) onConnected();
    } catch (e) {
      setError(e.message || 'Sync failed');
    } finally {
      setSyncing((prev) => ({ ...prev, [providerId]: false }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="terra-modal-overlay" onClick={onClose}>
      <div className="terra-modal" onClick={(e) => e.stopPropagation()}>
        <button className="terra-modal-close" onClick={onClose}>
          <i className="ph ph-x"></i>
        </button>
        <div className="terra-modal-header">
          <i className="ph ph-watch"></i>
          <h2>Connect Your Device</h2>
          <p>Sync workouts from your favorite apps</p>
        </div>

        <div className="terra-modal-body">
          {error && (
            <div className="terra-modal-status terra-modal-error" style={{ padding: '0 0 16px' }}>
              <p style={{ fontSize: 13, margin: 0 }}>{error}</p>
            </div>
          )}

          <div className="terra-device-grid">
            {PROVIDERS.map((p) => {
              const conn = getConnected(p.id);
              const isSyncing = syncing[p.id];
              return (
                <div key={p.id} className={`terra-device-card-wrapper ${conn ? 'connected' : ''}`}>
                  <button
                    className="terra-device-card"
                    onClick={() => !conn && handleConnect(p.id)}
                    disabled={loading || isSyncing}
                    style={{ cursor: conn ? 'default' : 'pointer' }}
                  >
                    <div className="terra-device-icon" style={{ background: p.bg, color: p.color }}>
                      <i className={p.icon}></i>
                    </div>
                    <span className="terra-device-name">{p.name}</span>
                    <span className="terra-device-desc">{p.desc}</span>
                    {conn && (
                      <span className="terra-badge-connected">
                        <i className="ph ph-check-circle"></i> Connected
                      </span>
                    )}
                  </button>
                  {conn && (
                    <div className="terra-device-actions">
                      <button
                        className="terra-btn terra-btn-sync"
                        onClick={() => handleSync(p.id)}
                        disabled={isSyncing}
                      >
                        <i className={`ph ${isSyncing ? 'ph-spinner ph-spin' : 'ph-arrows-clockwise'}`}></i>
                        {isSyncing ? ' Syncing...' : ' Sync'}
                      </button>
                      <button
                        className="terra-btn terra-btn-disconnect"
                        onClick={() => handleDisconnect(p.id)}
                      >
                        Disconnect
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 20 }}>
            Your data is stored securely. No paid third-party services used.
          </p>
        </div>
      </div>
    </div>
  );
}
