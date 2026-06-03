import React from 'react';
import { Map, Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

const containerStyle = {
  width: '100%',
  height: '450px',
  borderRadius: '24px',
  overflow: 'hidden',
  boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
  border: '1px solid rgba(255,255,255,0.05)'
};

const center = {
  longitude: -7.5340,
  latitude: 33.4120
};

function MapboxMap({ accessToken }) {
  if (!accessToken) {
    return (
      <div style={{...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', color: '#c8f135', textAlign: 'center', padding: '20px'}}>
        <div>
          <div style={{fontSize: '24px', marginBottom: '10px'}}>📍</div>
          <span style={{fontSize: '12px', letterSpacing: '2px', fontWeight: '600'}}>PLEASE ADD YOUR MAPBOX TOKEN TO .env</span>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <Map
        initialViewState={{
          ...center,
          zoom: 15.0
        }}
        style={{width: '100%', height: '100%'}}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={accessToken}
      >
        <Marker longitude={center.longitude} latitude={center.latitude} anchor="bottom">
          <div style={{ cursor: 'pointer' }}>
            <svg 
              width="50" 
              height="50" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              style={{ 
                filter: 'drop-shadow(0 0 8px rgba(200, 241, 53, 0.8))'
              }}
            >
              <path 
                d="M12 0C7.58 0 4 3.58 4 8C4 13.5 12 21 12 21C12 21 20 13.5 20 8C20 3.58 16.42 0 12 0Z" 
                fill="#008000" 
              />
              <circle cx="12" cy="8" r="4" fill="white" />
            </svg>
          </div>
        </Marker>
      </Map>
    </div>
  );
}

export default React.memo(MapboxMap);
