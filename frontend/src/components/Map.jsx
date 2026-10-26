import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet default icon paths in React environment
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const MapComponent = ({ pharmacies = [], center = [13.0827, 80.2707], height = "350px" }) => {
  return (
    <div style={{ height, width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
      <MapContainer center={center} zoom={12} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {pharmacies.map((p) => (
          <Marker key={p.id || p.pharmacy_id} position={[p.latitude || 13.0827, p.longitude || 80.2707]}>
            <Popup>
              <div className="p-1">
                <h6 className="fw-bold text-primary mb-1">{p.name || p.pharmacy_name}</h6>
                <p className="small text-muted mb-1"><i className="bi bi-geo-alt me-1"></i>{p.address}</p>
                {p.distance_km !== undefined && (
                  <div className="badge bg-light text-dark border me-1 mb-1">
                    {p.distance_km} km away
                  </div>
                )}
                {p.price !== undefined && (
                  <div className="badge bg-success text-white mb-1">
                    ₹{p.price}
                  </div>
                )}
                <div className="small text-dark mt-1">
                  <i className="bi bi-telephone me-1"></i>{p.phone}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
