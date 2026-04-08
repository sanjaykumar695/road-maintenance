import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { roadService } from '../services/api';
import './Roads.css';

const RoadManagement = () => {
  const { user } = useContext(AuthContext);
  const [roads, setRoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('');
  const [formData, setFormData] = useState({
    roadId: '',
    name: '',
    section: '',
    type: 'Highway',
    coordinates: [0, 0],
    address: '',
    length: '',
    width: '',
    budgetAllocation: '',
  });

  useEffect(() => {
    loadRoads();
  }, [filter]);

  const loadRoads = async () => {
    try {
      setLoading(true);
      const data = await roadService.getAllRoads();
      let filteredRoads = data.roads;
      if (filter) {
        filteredRoads = data.roads.filter((road) => road.type === filter);
      }
      setRoads(filteredRoads);
    } catch (error) {
      console.error('Error loading roads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await roadService.createRoad(formData);
      setFormData({
        roadId: '',
        name: '',
        section: '',
        type: 'Highway',
        coordinates: [0, 0],
        address: '',
        length: '',
        width: '',
        budgetAllocation: '',
      });
      setShowForm(false);
      loadRoads();
    } catch (error) {
      console.error('Error creating road:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  if (!user || loading) return <div className="roads-page"><p>Loading...</p></div>;

  return (
    <div className="roads-page">
      <h1>Road Assets Management</h1>

      {['Admin', 'Maintenance Manager'].includes(user.role) && (
        <>
          <button className="add-btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add New Road Assembly'}
          </button>

          {showForm && (
            <form className="road-form" onSubmit={handleSubmit}>
              <input
                type="text"
                name="roadId"
                placeholder="Road ID"
                value={formData.roadId}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="name"
                placeholder="Road Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="section"
                placeholder="Section"
                value={formData.section}
                onChange={handleChange}
              />
              <select name="type" value={formData.type} onChange={handleChange}>
                <option value="Highway">Highway</option>
                <option value="Urban Street">Urban Street</option>
                <option value="Bridge">Bridge</option>
                <option value="Rural Path">Rural Path</option>
                <option value="Other">Other</option>
              </select>
              <input
                type="text"
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
              />
              <input
                type="number"
                name="length"
                placeholder="Length (km)"
                value={formData.length}
                onChange={handleChange}
                required
              />
              <input
                type="number"
                name="width"
                placeholder="Width (m)"
                value={formData.width}
                onChange={handleChange}
              />
              <input
                type="number"
                name="budgetAllocation"
                placeholder="Budget Allocation (₹)"
                value={formData.budgetAllocation}
                onChange={handleChange}
              />
              <button type="submit">Create Road</button>
            </form>
          )}
        </>
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
        <table className="roads-table">
          <thead>
            <tr>
              <th>Road ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>Length (km)</th>
              <th>Condition</th>
              <th>Budget (₹)</th>
              <th>Manager</th>
            </tr>
          </thead>
          <tbody>
            {roads.map((road) => (
              <tr key={road._id}>
                <td>{road.roadId}</td>
                <td>{road.name}</td>
                <td>{road.type}</td>
                <td>{road.length}</td>
                <td className={`condition-${road.condition.toLowerCase()}`}>{road.condition}</td>
                <td>₹{road.budgetAllocation || 0}</td>
                <td>{road.assignedManager?.username || 'Unassigned'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="no-data">No road assets found</p>
      )}
    </div>
  );
};

export default RoadManagement;
