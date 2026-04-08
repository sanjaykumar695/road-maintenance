import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { roadService, damageService, maintenanceService } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [roads, setRoads] = useState([]);
  const [criticalReports, setCriticalReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const roadsData = await roadService.getAllRoads();
      setRoads(roadsData.roads.slice(0, 5));

      if (['Admin', 'Maintenance Manager'].includes(user?.role)) {
        const reportsData = await damageService.getCriticalReports();
        setCriticalReports(reportsData.reports.slice(0, 5));

        const statsData = await maintenanceService.getStatistics();
        setStats(statsData.stats);
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
          <div className="stat-card">
            <h3>Total Expenditure</h3>
            <p className="stat-value">₹{stats.totalExpenditure?.toFixed(2) || 0}</p>
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
                <th>Condition</th>
                <th>Manager</th>
              </tr>
            </thead>
            <tbody>
              {roads.map((road) => (
                <tr key={road._id}>
                  <td>{road.roadId}</td>
                  <td>{road.name}</td>
                  <td>{road.type}</td>
                  <td className={`condition-${road.condition.toLowerCase()}`}>{road.condition}</td>
                  <td>{road.assignedManager?.username || 'Unassigned'}</td>
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
                    <td>{report.roadAsset?.name}</td>
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
    </div>
  );
};

export default Dashboard;
