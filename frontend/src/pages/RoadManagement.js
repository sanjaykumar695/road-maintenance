import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { roadService } from '../services/api';
import './Roads.css';

const RoadManagement = () => {
  // Sample Indian cities with coordinates and road names
  const indianCities = [
    {
      name: 'Mumbai-Pune Highway',
      address: 'Pune-Mumbai Route, Maharashtra',
      coordinates: [73.8567, 19.0760],
      type: 'Highway',
    },
    {
      name: 'Bangalore-Airport Road',
      address: 'Bangalore to International Airport, Karnataka',
      coordinates: [77.7064, 13.1939],
      type: 'Highway',
    },
    {
      name: 'Delhi Ring Road',
      address: 'Ring Road, Delhi',
      coordinates: [77.2245, 28.6139],
      type: 'Urban Street',
    },
    {
      name: 'Chennai Inner Ring Road',
      address: 'Inner Ring Road, Chennai',
      coordinates: [80.2707, 13.0827],
      type: 'Urban Street',
    },
    {
      name: 'Kolkata Bypass',
      address: 'Eastern Metropolitan Bypass, Kolkata',
      coordinates: [88.3668, 22.5726],
      type: 'Rural Path',
    },
    {
      name: 'Ahmedabad-Vadodara Highway',
      address: 'National Highway 48, Gujarat',
      coordinates: [72.5458, 23.0225],
      type: 'Highway',
    },
    {
      name: 'Hyderabad Outer Ring Road',
      address: 'HITEC City to Narsingi, Telangana',
      coordinates: [78.4744, 17.3850],
      type: 'Urban Street',
    },
    {
      name: 'Jaipur-Delhi National Highway',
      address: 'NH-8, Rajasthan',
      coordinates: [75.8270, 26.9124],
      type: 'Highway',
    },
    {
      name: 'Lucknow-Kanpur Eastern Highway',
      address: 'Kanpur Road, Uttar Pradesh',
      coordinates: [80.9462, 26.8467],
      type: 'Highway',
    },
    {
      name: 'Kochi Harbor Bridge',
      address: 'Ernakulathappan-Mattancherry, Kerala',
      coordinates: [76.2673, 9.9312],
      type: 'Bridge',
    },
    {
      name: 'Indore-Ujjain Highway',
      address: 'NH-59A, Madhya Pradesh',
      coordinates: [75.8577, 22.7196],
      type: 'Highway',
    },
    {
      name: 'Pune Bypass Road',
      address: 'Pune to Pimpri-Chinchwad, Maharashtra',
      coordinates: [73.8077, 18.6298],
      type: 'Rural Path',
    },
  ];

  const roadTypes = ['Highway', 'Urban Street', 'Bridge', 'Rural Path', 'Other'];

  const { user } = useContext(AuthContext);
  const [roads, setRoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    roadId: '',
    roadName: '',
    roadType: 'Highway',
    address: '',
    coordinates: [78.9629, 20.5937], // Default: India center
  });

  useEffect(() => {
    loadRoads();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadRoads, 30000);
    return () => clearInterval(interval);
  }, [filter]);

  const loadRoads = async () => {
    try {
      setLoading(true);
      const data = await roadService.getAllRoads();
      let filteredRoads = data.roads;
      if (filter) {
        filteredRoads = data.roads.filter((road) => road.roadType === filter);
      }
      setRoads(filteredRoads);
      setMessage('');
    } catch (error) {
      console.error('Error loading roads:', error);
      setMessage('Error loading roads: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentLocation = async () => {
    setLocationLoading(true);
    setMessage('🔄 Selecting random city location...');

    // Simulate a small delay for better UX
    setTimeout(() => {
      // Randomly select a city from Indian cities
      const randomCity = indianCities[Math.floor(Math.random() * indianCities.length)];

      // Generate next Road ID
      const nextId = `RD-${String(roads.length + 1).padStart(3, '0')}`;

      // Randomly select a road type (or use the city's default type)
      const randomType = roadTypes[Math.floor(Math.random() * roadTypes.length)];

      // Update form data with random city and auto-generated values
      setFormData({
        roadId: nextId,
        roadName: randomCity.name,
        roadType: randomCity.type || randomType,
        address: randomCity.address,
        coordinates: randomCity.coordinates,
      });

      setMessage(
        `✅ Location selected: ${randomCity.name} (${randomCity.address})\nCoordinates: ${randomCity.coordinates[1].toFixed(4)}, ${randomCity.coordinates[0].toFixed(4)}`
      );
      setLocationLoading(false);

      // Clear message after 5 seconds
      setTimeout(() => setMessage(''), 5000);
    }, 800); // Slight delay to simulate fetching
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.address.trim()) {
      setMessage('❌ Please enter the road address');
      return;
    }

    try {
      setMessage('Creating road...');
      await roadService.createRoad(formData);
      setFormData({
        roadId: '',
        roadName: '',
        roadType: 'Highway',
        address: '',
        coordinates: [78.9629, 20.5937],
      });
      setShowForm(false);
      loadRoads();
      setMessage('✅ Road added successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error creating road:', error);
      setMessage('❌ Error creating road: ' + (error.message || 'Unknown error'));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  if (!user || loading) return <div className="roads-page"><p>Loading...</p></div>;

  const isEndUser = user.role === 'End User/Inspector';
  const isAdminOrManager = ['Admin', 'Maintenance Manager'].includes(user.role);

  return (
    <div className="roads-page">
      <h1>Road Management</h1>

      {message && (
        <div className={`message-box ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {isEndUser && (
        <>
          <button className="add-btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '📍 Add New Road'}
          </button>

          {showForm && (
            <form className="road-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Road ID *</label>
                <input
                  type="text"
                  name="roadId"
                  placeholder="e.g., RD-001"
                  value={formData.roadId}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Road Name *</label>
                <input
                  type="text"
                  name="roadName"
                  placeholder="e.g., Mumbai-Pune Highway"
                  value={formData.roadName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Road Type *</label>
                <select name="roadType" value={formData.roadType} onChange={handleChange} required>
                  <option value="Highway">Highway</option>
                  <option value="Urban Street">Urban Street</option>
                  <option value="Bridge">Bridge</option>
                  <option value="Rural Path">Rural Path</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Road Address *</label>
                <div className="address-input-group">
                  <input
                    type="text"
                    name="address"
                    placeholder="Enter road address or auto-fill below"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="location-btn"
                    onClick={fetchCurrentLocation}
                    disabled={locationLoading}
                  >
                    {locationLoading ? 'Fetching...' : '📍 Get Location'}
                  </button>
                </div>
                <small>Coordinates: {formData.coordinates[1].toFixed(4)}, {formData.coordinates[0].toFixed(4)}</small>
              </div>

              <button type="submit" className="submit-btn">
                Add Road
              </button>
            </form>
          )}
        </>
      )}

      {isAdminOrManager && (
        <div className="info-box">
          <p>📌 Roads are added by End Users/Inspectors. You can view and manage damage reports for these roads.</p>
        </div>
      )}

      <div className="filter-section">
        <label>Filter by Type:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All Types</option>
          <option value="Highway">Highway</option>
          <option value="Urban Street">Urban Street</option>
          <option value="Bridge">Bridge</option>
          <option value="Rural Path">Rural Path</option>
        </select>
      </div>

      {roads.length > 0 ? (
        <div className="roads-grid">
          {roads.map((road) => (
            <div key={road._id} className="road-card">
              <div className="road-header">
                <h3>{road.roadName}</h3>
                <span className={`condition-badge condition-${road.condition.toLowerCase()}`}>
                  {road.condition}
                </span>
              </div>
              <div className="road-details">
                <p>
                  <strong>Road ID:</strong> {road.roadId}
                </p>
                <p>
                  <strong>Type:</strong> {road.roadType}
                </p>
                <p>
                  <strong>Address:</strong> {road.address}
                </p>
                <p>
                  <strong>Added by:</strong> {road.createdBy?.username || 'Unknown'}
                </p>
                <p>
                  <strong>Date Added:</strong> {new Date(road.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-data">No road assets found</p>
      )}
    </div>
  );
};

export default RoadManagement;
