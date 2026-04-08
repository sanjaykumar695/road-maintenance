import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { maintenanceService, damageService } from '../services/api';
import './Maintenance.css';

const MaintenanceScheduling = () => {
  const { user } = useContext(AuthContext);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [reports, setReports] = useState([]);
  const [formData, setFormData] = useState({
    damageReport: '',
    roadAsset: '',
    scheduledDate: '',
    workDescription: '',
    estimatedCost: '',
  });

  useEffect(() => {
    if (!user) return;
    loadSchedules();
    if (['Admin', 'Maintenance Manager'].includes(user.role)) {
      loadReports();
    }
  }, [user?.role]);

  const loadSchedules = async () => {
    try {
      const data = await maintenanceService.getAllSchedules();
      setSchedules(data.schedules);
    } catch (error) {
      console.error('Error loading schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async () => {
    try {
      const data = await damageService.getAllReports();
      setReports(data.reports);
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await maintenanceService.createSchedule(formData);
      setFormData({
        damageReport: '',
        roadAsset: '',
        scheduledDate: '',
        workDescription: '',
        estimatedCost: '',
      });
      setShowForm(false);
      loadSchedules();
    } catch (error) {
      console.error('Error creating schedule:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleStatusUpdate = async (scheduleId, newStatus) => {
    try {
      await maintenanceService.updateSchedule(scheduleId, { status: newStatus });
      loadSchedules();
    } catch (error) {
      console.error('Error updating schedule:', error);
    }
  };

  if (!user || loading) return <div className="maintenance-page"><p>Loading...</p></div>;

  return (
    <div className="maintenance-page">
      <h1>Maintenance Scheduling & Management</h1>

      {['Admin', 'Maintenance Manager'].includes(user.role) && (
        <>
          <button className="schedule-btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Schedule Maintenance'}
          </button>

          {showForm && (
            <form className="maintenance-form" onSubmit={handleSubmit}>
              <select
                name="damageReport"
                value={formData.damageReport}
                onChange={handleChange}
                required
              >
                <option value="">Select Damage Report</option>
                {reports.map((report) => (
                  <option key={report._id} value={report._id}>
                    {report.reportId} - {report.roadAsset?.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                name="roadAsset"
                placeholder="Road Asset ID"
                value={formData.roadAsset}
                onChange={handleChange}
                required
              />
              <input
                type="datetime-local"
                name="scheduledDate"
                value={formData.scheduledDate}
                onChange={handleChange}
                required
              />
              <textarea
                name="workDescription"
                placeholder="Work Description"
                value={formData.workDescription}
                onChange={handleChange}
                required
                rows="3"
              ></textarea>
              <input
                type="number"
                name="estimatedCost"
                placeholder="Estimated Cost (₹)"
                value={formData.estimatedCost}
                onChange={handleChange}
                required
              />
              <button type="submit">Create Schedule</button>
            </form>
          )}
        </>
      )}

      {schedules.length > 0 ? (
        <table className="schedules-table">
          <thead>
            <tr>
              <th>Schedule ID</th>
              <th>Road</th>
              <th>Scheduled Date</th>
              <th>Work Description</th>
              <th>Est. Cost (₹)</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((schedule) => (
              <tr key={schedule._id}>
                <td>{schedule.scheduleId}</td>
                <td>{schedule.roadAsset?.name}</td>
                <td>{new Date(schedule.scheduledDate).toLocaleDateString()}</td>
                <td>{schedule.workDescription?.substring(0, 30)}...</td>
                <td>₹{schedule.estimatedCost || 0}</td>
                <td className={`status-${schedule.status.toLowerCase()}`}>{schedule.status}</td>
                <td>
                  {['Admin', 'Maintenance Manager'].includes(user.role) && (
                    <select
                      value={schedule.status}
                      onChange={(e) => handleStatusUpdate(schedule._id, e.target.value)}
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="no-data">No maintenance schedules found</p>
      )}
    </div>
  );
};

export default MaintenanceScheduling;
