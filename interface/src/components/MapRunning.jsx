import { useState, useRef, useCallback, useEffect } from 'react';
import Map, { Marker, Popup, Source, Layer } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { toast } from './Toast';

const containerStyle = {
  width: '100%',
  height: '540px',
  borderRadius: '20px',
  overflow: 'hidden',
  position: 'relative',
  boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
};

const defaultCenter = { longitude: -7.6233, latitude: 33.5469 };

const route = [
  [-7.6280, 33.5480],
  [-7.6265, 33.5470],
  [-7.6250, 33.5460],
  [-7.6240, 33.5450],
  [-7.6230, 33.5440],
  [-7.6220, 33.5430],
  [-7.6210, 33.5425],
  [-7.6200, 33.5420],
  [-7.6185, 33.5415],
  [-7.6170, 33.5410],
  [-7.6155, 33.5405],
  [-7.6140, 33.5400],
  [-7.6125, 33.5395],
  [-7.6110, 33.5390],
];

const startPoint = route[0];
const endPoint = route[route.length - 1];

const appleBtn = {
  width: '40px',
  height: '40px',
  borderRadius: '12px',
  background: 'rgba(255,255,255,0.85)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(0,0,0,0.06)',
  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '18px',
  color: '#1a1a1a',
  transition: 'all 0.2s ease',
};

const searchContainerStyle = {
  position: 'absolute',
  top: '16px',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 10,
  width: 'min(380px, 90%)',
};

export default function MapRunning({ accessToken }) {
  const [showPopup, setShowPopup] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [viewState, setViewState] = useState({
    longitude: defaultCenter.longitude,
    latitude: defaultCenter.latitude,
    zoom: 14.0,
  });
  const mapRef = useRef(null);
  const debounceRef = useRef(null);
  const searchRef = useRef(null);

  const fetchSuggestions = useCallback(async (query) => {
    if (!query.trim() || !accessToken) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${accessToken}&types=place,locality,neighborhood,address&limit=5&language=fr`
      );
      const data = await res.json();
      if (data.features) {
        setSuggestions(data.features);
        setShowSuggestions(true);
      }
    } catch {
      setSuggestions([]);
    }
  }, [accessToken]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(searchQuery);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, fetchSuggestions]);

  const handleSelectSuggestion = useCallback((suggestion) => {
    const [lng, lat] = suggestion.center;
    setViewState({ longitude: lng, latitude: lat, zoom: 15.0 });
    setSearchQuery(suggestion.place_name_fr || suggestion.place_name);
    setSuggestions([]);
    setShowSuggestions(false);
    toast(`📍 ${suggestion.place_name_fr || suggestion.place_name}`, 'info', 2500);
  }, []);

  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) return;
    fetchSuggestions(searchQuery);
  }, [searchQuery, fetchSuggestions]);

  const handleZoomIn = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (map) map.zoomIn({ duration: 300 });
  }, []);

  const handleZoomOut = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (map) map.zoomOut({ duration: 300 });
  }, []);

  const handleFullscreen = useCallback(() => {
    const el = mapRef.current?.getMap()?.getContainer();
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
      toast('Mode normal', 'info', 1500);
    } else {
      el.requestFullscreen();
      toast('Plein écran', 'success', 1500);
    }
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      if (suggestions.length > 0) {
        handleSelectSuggestion(suggestions[0]);
      } else {
        handleSearch();
      }
    }
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  }, [handleSearch, suggestions, handleSelectSuggestion]);

  const handleBlur = useCallback(() => {
    setTimeout(() => setShowSuggestions(false), 200);
  }, []);

  if (!accessToken) {
    return (
      <div style={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9f9f7', color: '#888', textAlign: 'center', padding: '20px' }}>
        <div>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🏃</div>
          <span style={{ fontSize: '13px', letterSpacing: '0.5px', fontWeight: 500 }}>Ajoutez votre clé Mapbox dans le fichier .env</span>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Search bar with suggestions */}
      <div style={searchContainerStyle} ref={searchRef}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: '14px',
          padding: '6px 6px 6px 16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.05)',
        }}>
          <i className="ph ph-magnifying-glass" style={{ fontSize: '16px', color: '#999', flexShrink: 0 }}></i>
          <input
            type="text"
            placeholder="Rechercher une ville, un lieu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
            style={{
              flex: 1,
              border: 'none',
              background: 'none',
              outline: 'none',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif',
              fontSize: '14px',
              color: '#1a1a1a',
              padding: '8px 0',
            }}
          />
          <button
            onClick={handleSearch}
            style={{
              ...appleBtn,
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: '#c8f135',
              border: 'none',
              boxShadow: 'none',
              fontSize: '14px',
              color: '#000',
              flexShrink: 0,
            }}
          >
            <i className="ph ph-arrow-right"></i>
          </button>
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div style={{
            marginTop: '8px',
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderRadius: '14px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: '1px solid rgba(0,0,0,0.05)',
            overflow: 'hidden',
            maxHeight: '280px',
            overflowY: 'auto',
          }}>
            {suggestions.map((s, i) => (
              <button
                key={s.id}
                onClick={() => handleSelectSuggestion(s)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif',
                  borderBottom: i < suggestions.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <i className="ph ph-map-pin" style={{ fontSize: '16px', color: '#c8f135', flexShrink: 0 }}></i>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#1d1d1f', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {s.place_name_fr || s.place_name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#86868b', marginTop: '2px' }}>
                    {s.context?.map(c => c.text).join(' · ') || s.text}
                  </div>
                </div>
                <span style={{ fontSize: '11px', color: '#86868b', flexShrink: 0 }}>
                  {s.relevance ? Math.round(s.relevance * 100) + '%' : ''}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Zoom + Fullscreen controls */}
      <div style={{
        position: 'absolute',
        right: '16px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        <button onClick={handleZoomIn} style={appleBtn} title="Zoom avant" aria-label="Zoom avant">
          <i className="ph ph-plus"></i>
        </button>
        <button onClick={handleZoomOut} style={appleBtn} title="Zoom arrière" aria-label="Zoom arrière">
          <i className="ph ph-minus"></i>
        </button>
        <div style={{ width: '40px', height: '1px', background: 'rgba(0,0,0,0.06)', margin: '4px 0' }} />
        <button onClick={handleFullscreen} style={appleBtn} title="Plein écran" aria-label="Plein écran">
          <i className="ph ph-arrows-out"></i>
        </button>
      </div>

      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        mapboxAccessToken={accessToken}
      >
        <Source
          id="routeSource"
          type="geojson"
          data={{
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: route,
            },
          }}
        >
          <Layer
            id="glowLayer"
            type="line"
            paint={{
              'line-color': '#c8f135',
              'line-width': 10,
              'line-opacity': 0.25,
            }}
          />
          <Layer
            id="routeLayer"
            type="line"
            paint={{
              'line-color': '#c8f135',
              'line-width': 4,
              'line-opacity': 0.9,
            }}
          />
        </Source>

        <Marker longitude={startPoint[0]} latitude={startPoint[1]} anchor="bottom">
          <div
            style={{ cursor: 'pointer' }}
            onMouseEnter={() => setShowPopup('start')}
            onMouseLeave={() => setShowPopup(null)}
          >
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <circle cx="18" cy="18" r="16" fill="#34c759" stroke="white" strokeWidth="3" />
              <text x="18" y="22" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">S</text>
            </svg>
          </div>
        </Marker>

        <Marker longitude={endPoint[0]} latitude={endPoint[1]} anchor="bottom">
          <div
            style={{ cursor: 'pointer' }}
            onMouseEnter={() => setShowPopup('end')}
            onMouseLeave={() => setShowPopup(null)}
          >
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <circle cx="18" cy="18" r="16" fill="#ff3b30" stroke="white" strokeWidth="3" />
              <text x="18" y="22" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">E</text>
            </svg>
          </div>
        </Marker>

        {showPopup === 'start' && (
          <Popup longitude={startPoint[0]} latitude={startPoint[1]} anchor="bottom" closeButton={false} style={{ zIndex: 10 }}>
            <div style={{
              fontFamily: '-apple-system, "SF Pro Display", sans-serif',
              fontSize: '12px',
              fontWeight: 600,
              color: '#1a1a1a',
            }}>
              Départ<br />
              <span style={{ fontSize: '11px', fontWeight: 400, color: '#666' }}>Sidi Marouf, Casablanca</span>
            </div>
          </Popup>
        )}

        {showPopup === 'end' && (
          <Popup longitude={endPoint[0]} latitude={endPoint[1]} anchor="bottom" closeButton={false} style={{ zIndex: 10 }}>
            <div style={{
              fontFamily: '-apple-system, "SF Pro Display", sans-serif',
              fontSize: '12px',
              fontWeight: 600,
              color: '#1a1a1a',
            }}>
              Arrivée<br />
              <span style={{ fontSize: '11px', fontWeight: 400, color: '#666' }}>Sidi Marouf, Casablanca</span>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
