import MapboxMap from '../MapboxMap';

export default function Location() {
  return (
    <section id="location">
      <div className="location-label-pill">EliteFiT Deroua</div>
      <h2>Visit us and see what makes EliteFiT Deroua special</h2>
      <div className="location-info">
        <div className="loc-block">
          <span className="loc-icon"><i className="ph ph-map-pin"></i></span>
          <div>
            <h4>Address</h4>
            <p>Deroua, Province de Nouaceur<br />Casablanca-Settat, Morocco</p>
          </div>
        </div>
        <div className="loc-block">
          <span className="loc-icon"><i className="ph ph-clock"></i></span>
          <div>
            <h4>Opening Hours</h4>
            <p>Monday – Friday: 6:00 AM – 10:00 PM<br />Saturday – Sunday: 8:00 AM – 8:00 PM</p>
          </div>
        </div>
        <div className="loc-block">
          <span className="loc-icon"><i className="ph ph-envelope"></i></span>
          <div>
            <h4>Phone and Email</h4>
            <p>+212 522-123456<br />nouaceur@elitefit.com</p>
          </div>
        </div>
      </div>
      <div className="map-container">
        <MapboxMap accessToken={import.meta.env.VITE_BOXMAP} />
      </div>
    </section>
  );
}
