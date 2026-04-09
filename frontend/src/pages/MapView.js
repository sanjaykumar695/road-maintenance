import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { roadService } from '../services/api';
import './Map.css';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const MapView = () => {
  const [roads, setRoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const defaultCenter = [20.5937, 78.9629]; // India center

  useEffect(() => {
    loadRoads();
    // Auto-refresh map every 30 seconds to show newly added roads
    const interval = setInterval(loadRoads, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadRoads = async () => {
    try {
      const data = await roadService.getAllRoads();
      setRoads(data.roads.filter((r) => r.location && r.location.coordinates));
    } catch (error) {
      console.error('Error loading roads:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="map-page"><p>Loading map...</p></div>;

  return (
    <div className="map-page">
      <h1>Road Network Map</h1>
      <MapContainer
        center={defaultCenter}
        zoom={5}
        scrollWheelZoom={false}
        className="map-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {roads.map((road) => {
          const [lon, lat] = road.location.coordinates;
          return (
            <Marker key={road._id} position={[lat, lon]}>
              <Popup>
                <div className="popup-content">
                  <h3>{road.roadName}</h3>
                  <p>
                    <strong>ID:</strong> {road.roadId}
                  </p>
                  <p>
                    <strong>Type:</strong> {road.roadType}
                  </p>
                  <p>
                    <strong>Address:</strong> {road.address}
                  </p>
                  <p>
                    <strong>Condition:</strong> <span className={`condition-${road.condition.toLowerCase()}`}>{road.condition}</span>
                  </p>
                  <p>
                    <strong>Added by:</strong> {road.createdBy?.username || 'Unknown'}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      <p className="map-info">Total Roads: {roads.length} (Auto-updates every 30 seconds)</p>
    </div>
  );
};

export default MapView;
