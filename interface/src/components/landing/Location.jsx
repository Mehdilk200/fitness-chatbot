import { useTranslation } from 'react-i18next';
import MapboxMap from '../MapboxMap';

export default function Location() {
  const { t } = useTranslation('landing');

  return (
    <section id="location">
      <div className="location-label-pill">{t('location.pill')}</div>
      <h2>{t('location.title')}</h2>
      <div className="location-info">
        <div className="loc-block">
          <span className="loc-icon"><i className="ph ph-map-pin"></i></span>
          <div>
            <h4>{t('location.addressTitle')}</h4>
            <p>{t('location.address')}</p>
          </div>
        </div>
        <div className="loc-block">
          <span className="loc-icon"><i className="ph ph-clock"></i></span>
          <div>
            <h4>{t('location.hoursTitle')}</h4>
            <p>{t('location.hours')}</p>
          </div>
        </div>
        <div className="loc-block">
          <span className="loc-icon"><i className="ph ph-envelope"></i></span>
          <div>
            <h4>{t('location.phoneTitle')}</h4>
            <p>{t('location.phone')}</p>
          </div>
        </div>
      </div>
      <div className="map-container">
        <MapboxMap accessToken={import.meta.env.VITE_BOXMAP} />
      </div>
    </section>
  );
}
