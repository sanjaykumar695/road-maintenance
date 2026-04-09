import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { damageService, roadService, userService } from '../services/api';
import './DamageReporting.css';

const DamageReporting = () => {
  const { user } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [roads, setRoads] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [formData, setFormData] = useState({
    roadAsset: '',
    damageType: 'Potholes',
    severity: 'Medium',
    description: '',
    photos: '',
  });

  React.useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      let reportsData;

      if (user.role === 'Maintenance Manager') {
        reportsData = await damageService.getMyAssignments();
      } else if (user.role === 'End User/Inspector') {
        reportsData = await damageService.getMyReports();
      } else {
        reportsData = await damageService.getAllReports();
      }

      const roadsData = await roadService.getAllRoads();
      setReports(reportsData.reports);
      setRoads(roadsData.roads);

      // Load managers for admin assignment
      if (user.role === 'Admin') {
        const allUsers = await userService.getAllUsers();
        const managerUsers = allUsers.users.filter(u => u.role === 'Maintenance Manager');
        setManagers(managerUsers);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Get coordinates from selected road
      const selectedRoad = roads.find(road => road._id === formData.roadAsset);
      if (!selectedRoad) {
        alert('Please select a valid road');
        return;
      }

      const submitData = {
        ...formData,
        coordinates: selectedRoad.location.coordinates,
        photos: formData.photos ? [formData.photos] : [],
      };
      await damageService.createReport(submitData);
      setFormData({
        roadAsset: '',
        damageType: 'Potholes',
        severity: 'Medium',
        description: '',
        photos: '',
      });
      setShowForm(false);
      loadData();
    } catch (error) {
      console.error('Error creating report:', error);
    }
  };

  const handleAssign = async (reportId, managerId) => {
    try {
      await damageService.assignReport(reportId, { assignedTo: managerId });
      setShowAssignForm(false);
      setSelectedReport(null);
      loadData();
    } catch (error) {
      console.error('Error assigning report:', error);
    }
  };

  const handleAccept = async (reportId) => {
    try {
      await damageService.acceptAssignment(reportId);
      loadData();
    } catch (error) {
      console.error('Error accepting assignment:', error);
    }
  };

  const handleComplete = async (reportId) => {
    try {
      await damageService.completeWork(reportId, { completionNotes });
      setCompletionNotes('');
      loadData();
    } catch (error) {
      console.error('Error completing work:', error);
    }
  };

  const handleVerify = async (reportId) => {
    try {
      await damageService.verifyCompletion(reportId, { verificationNotes });
      setVerificationNotes('');
      loadData();
    } catch (error) {
      console.error('Error verifying completion:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Reported': return 'status-reported';
      case 'Under Review': return 'status-review';
      case 'In Progress': return 'status-progress';
      case 'Completed': return 'status-completed';
      case 'Closed': return 'status-closed';
      default: return '';
    }
  };

  if (!user || loading) return <div className="damage-page"><p>Loading...</p></div>;

  return (
    <div className="damage-page">
      <h1>Damage Reporting</h1>

      {user.role === 'End User/Inspector' && (
        <button className="report-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Report New Damage'}
        </button>
      )}

      {showForm && (
        <form className="damage-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Road Asset *</label>
            <select name="roadAsset" value={formData.roadAsset} onChange={handleChange} required>
              <option value="">Select Road Asset</option>
              {roads.map((road) => (
                <option key={road._id} value={road._id}>
                  {road.roadId} - {road.roadName} ({road.address})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Damage Type *</label>
            <select name="damageType" value={formData.damageType} onChange={handleChange}>
              <option value="Potholes">Potholes</option>
              <option value="Cracks">Cracks</option>
              <option value="Surface Deterioration">Surface Deterioration</option>
              <option value="Flooding">Flooding</option>
              <option value="Subsidence">Subsidence</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Severity *</label>
            <select name="severity" value={formData.severity} onChange={handleChange}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              placeholder="Describe the damage in detail"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
            ></textarea>
          </div>
          <div className="form-group">
            <label>Photo URL (Optional)</label>
            <input
              type="url"
              name="photos"
              placeholder="https://example.com/photo.jpg"
              value={formData.photos}
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="submit-btn">Submit Damage Report</button>
        </form>
      )}

      {showAssignForm && selectedReport && (
        <div className="assign-form">
          <h3>Assign Report to Manager</h3>
          <select onChange={(e) => handleAssign(selectedReport._id, e.target.value)}>
            <option value="">Select Manager</option>
            {managers.map((manager) => (
              <option key={manager._id} value={manager._id}>
                {manager.username} - {manager.email}
              </option>
            ))}
          </select>
          <button onClick={() => setShowAssignForm(false)}>Cancel</button>
        </div>
      )}

      {reports.length > 0 ? (
        <table className="reports-table">
          <thead>
            <tr>
              <th>Report ID</th>
              <th>Road</th>
              <th>Damage Type</th>
              <th>Severity</th>
              <th>Description</th>
              <th>Status</th>
              <th>Assigned To</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report._id}>
                <td>{report.reportId}</td>
                <td>{report.roadAsset?.roadName || report.roadAsset}</td>
                <td>{report.damageType}</td>
                <td className={`severity-${report.severity.toLowerCase()}`}>{report.severity}</td>
                <td>{report.description?.substring(0, 30)}...</td>
                <td className={getStatusColor(report.status)}>{report.status}</td>
                <td>{report.assignedTo?.username || 'Not Assigned'}</td>
                <td>{new Date(report.reportDate).toLocaleDateString()}</td>
                <td>
                  {user.role === 'Admin' && report.status === 'Reported' && (
                    <button
                      className="action-btn assign-btn"
                      onClick={() => {
                        setSelectedReport(report);
                        setShowAssignForm(true);
                      }}
                    >
                      Assign
                    </button>
                  )}
                  {user.role === 'Maintenance Manager' && report.assignedTo?._id === user.id && !report.acceptedByManager && (
                    <button
                      className="action-btn accept-btn"
                      onClick={() => handleAccept(report._id)}
                    >
                      Accept
                    </button>
                  )}
                  {user.role === 'Maintenance Manager' && report.assignedTo?._id === user.id && report.acceptedByManager && report.status === 'In Progress' && (
                    <div>
                      <textarea
                        placeholder="Completion notes"
                        value={completionNotes}
                        onChange={(e) => setCompletionNotes(e.target.value)}
                      />
                      <button
                        className="action-btn complete-btn"
                        onClick={() => handleComplete(report._id)}
                      >
                        Complete
                      </button>
                    </div>
                  )}
                  {user.role === 'End User/Inspector' && report.reportedBy?._id === user.id && report.status === 'Completed' && !report.verifiedByUser && (
                    <div>
                      <textarea
                        placeholder="Verification notes"
                        value={verificationNotes}
                        onChange={(e) => setVerificationNotes(e.target.value)}
                      />
                      <button
                        className="action-btn verify-btn"
                        onClick={() => handleVerify(report._id)}
                      >
                        Verify
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="no-data">No damage reports found</p>
      )}
    </div>
  );
};

export default DamageReporting;
