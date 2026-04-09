import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { roadService, damageService, maintenanceService } from '../services/api';
import ActivityLog from '../components/ActivityLog';
import './Dashboard.css';
import io from 'socket.io-client';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [roads, setRoads] = useState([]);
  const [criticalReports, setCriticalReports] = useState([]);
  const [completedWork, setCompletedWork] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user) return;

    // Initialize Socket.IO connection
    const socketConnection = io('http://localhost:5000');
    setSocket(socketConnection);

    // Listen for real-time stats updates
    socketConnection.on('statsUpdate', (updatedStats) => {
      console.log('Real-time stats update received:', updatedStats);
      setStats(updatedStats);
    });

    loadDashboardData();

    // Auto-refresh dashboard every 30 seconds for fallback
    const interval = setInterval(loadDashboardData, 30000);

    return () => {
      socketConnection.disconnect();
      clearInterval(interval);
    };
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const roadsData = await roadService.getAllRoads();
      setRoads(roadsData.roads.slice(0, 5));

      // Load stats for all users (live, real-time data)
      const statsData = await maintenanceService.getStatistics();
      setStats(statsData.stats);

      if (['Admin', 'Maintenance Manager'].includes(user?.role)) {
        const reportsData = await damageService.getCriticalReports();
        setCriticalReports(reportsData.reports.slice(0, 5));
      }

      if (['Admin', 'Maintenance Manager', 'End User/Inspector'].includes(user?.role)) {
        const completedData = await damageService.getCompletedReports();
        setCompletedWork(completedData.reports.slice(0, 5));
      }
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading) {
    return <div className="dashboard"><p>Loading dashboard...</p></div>;
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      {error && <div className="error-message">{error}</div>}

      {stats && (
        <div className="card-grid">
          <div className="stat-card">
            <h3>Total Schedules</h3>
            <p className="stat-value">{stats.total}</p>
          </div>
          <div className="stat-card">
            <h3>Completed</h3>
            <p className="stat-value">{stats.completed}</p>
          </div>
          <div className="stat-card">
            <h3>In Progress</h3>
            <p className="stat-value">{stats.inProgress}</p>
          </div>
        </div>
      )}

      <div className="dashboard-section">
        <h2>Road Assets Overview</h2>
        {roads.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Road ID</th>
                <th>Name</th>
                <th>Type</th>
                <th>Address</th>
                <th>Condition</th>
                <th>Added By</th>
              </tr>
            </thead>
            <tbody>
              {roads.map((road) => (
                <tr key={road._id}>
                  <td>{road.roadId}</td>
                  <td>{road.roadName}</td>
                  <td>{road.roadType}</td>
                  <td>{road.address}</td>
                  <td className={`condition-${road.condition.toLowerCase()}`}>{road.condition}</td>
                  <td>{road.createdBy?.username || 'Unknown'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No road assets found</p>
        )}
      </div>

      {['Admin', 'Maintenance Manager'].includes(user.role) && (
        <div className="dashboard-section">
          <h2>Critical Damage Reports</h2>
          {criticalReports.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Report ID</th>
                  <th>Road</th>
                  <th>Damage Type</th>
                  <th>Severity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {criticalReports.map((report) => (
                  <tr key={report._id}>
                    <td>{report.reportId}</td>
                    <td>{report.roadAsset?.roadName}</td>
                    <td>{report.damageType}</td>
                    <td className={`severity-${report.severity.toLowerCase()}`}>{report.severity}</td>
                    <td>{report.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No critical reports</p>
          )}
        </div>
      )}

      {['Admin', 'Maintenance Manager', 'End User/Inspector'].includes(user.role) && (
        <div className="dashboard-section">
          <h2>Recently Completed Work</h2>
          {completedWork.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Report ID</th>
                  <th>Road</th>
                  <th>Completed By</th>
                  <th>Completion Date</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {completedWork.map((report) => (
                  <tr key={report._id} className="completed-work-row">
                    <td>{report.reportId}</td>
                    <td>{report.roadAsset?.roadName}</td>
                    <td className="manager-name">{report.assignedTo?.username || 'N/A'}</td>
                    <td>{new Date(report.completedDate).toLocaleDateString()}</td>
                    <td className="notes-cell">{report.completionNotes || 'No notes'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No completed work yet</p>
          )}
        </div>
      )}

      {['Admin', 'End User/Inspector'].includes(user.role) && (
        <div className="dashboard-section">
          <ActivityLog limit={10} />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
