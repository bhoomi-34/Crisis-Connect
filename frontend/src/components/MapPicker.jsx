import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition, setAddress }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
        .then(res => res.json())
        .then(data => {
          const addr = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          setAddress(addr);
        })
        .catch(() => setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`));
    }
  });
  return position ? <Marker position={position} /> : null;
}

export default function MapPicker({ onLocationSelect }) {
  const [position, setPosition] = useState([12.9716, 77.5946]);
  const [address, setAddress] = useState('MG Road, Bengaluru');
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapRef, setMapRef] = useState(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`);
      const data = await res.json();
      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        setPosition([lat, lng]);
        setAddress(data[0].display_name);
        if (mapRef) mapRef.flyTo([lat, lng], 16);
      }
    } catch (err) {}
    setSearching(false);
  };

  useEffect(() => {
    onLocationSelect({
      latitude: position[0],
      longitude: position[1],
      location_name: address.split(',').slice(0, 3).join(',').trim()
    });
  }, [position, address]);

  return (
    <div style={s.wrap}>
      <div style={s.searchRow}>
        <input
          style={s.searchInput}
          placeholder="Search location (e.g. Koramangala, Bengaluru)"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <button style={s.searchBtn} onClick={handleSearch} disabled={searching}>
          {searching ? '...' : 'Search'}
        </button>
      </div>

      <div style={s.mapWrap}>
        <MapContainer
          center={position}
          zoom={14}
          style={{ height: '300px', width: '100%', borderRadius: '10px' }}
          ref={setMapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          <LocationMarker
            position={position}
            setPosition={setPosition}
            setAddress={setAddress}
          />
        </MapContainer>
        <div style={s.mapHint}>Tap anywhere on the map to pin your location</div>
      </div>

      <div style={s.locCard}>
        <div style={s.locDot}></div>
        <div style={s.locInfo}>
          <div style={s.locName}>{address.split(',').slice(0, 3).join(',')}</div>
          <div style={s.locCoords}>{position[0].toFixed(5)}° N, {position[1].toFixed(5)}° E</div>
        </div>
        <div style={s.locAcc}>±15m</div>
      </div>
    </div>
  );
}

const s = {
  wrap: { display: 'flex', flexDirection: 'column', gap: '10px' },
  searchRow: { display: 'flex', gap: '8px' },
  searchInput: { flex: 1, padding: '11px 14px', background: '#141414', border: '1px solid #1f1f1f', borderRadius: '8px', fontSize: '13px', color: '#fff', outline: 'none' },
  searchBtn: { padding: '11px 18px', background: '#E24B4A', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  mapWrap: { position: 'relative', borderRadius: '10px', overflow: 'hidden', border: '1px solid #1f1f1f' },
  mapHint: { position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '11px', padding: '5px 12px', borderRadius: '20px', pointerEvents: 'none', whiteSpace: 'nowrap', zIndex: 999 },
  locCard: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', background: '#141414', border: '1px solid #1f1f1f', borderRadius: '8px' },
  locDot: { width: '8px', height: '8px', borderRadius: '50%', background: '#1D9E75', flexShrink: 0 },
  locInfo: { flex: 1 },
  locName: { fontSize: '13px', color: '#ccc', fontWeight: '500' },
  locCoords: { fontSize: '11px', color: '#444', marginTop: '2px' },
  locAcc: { fontSize: '11px', color: '#1D9E75', background: '#0a1a0f', padding: '3px 8px', borderRadius: '20px', border: '1px solid #1a4a1a' }
};