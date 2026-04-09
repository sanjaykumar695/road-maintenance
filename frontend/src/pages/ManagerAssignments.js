import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { damageService } from '../services/api';
import './Maintenance.css';

const ManagerAssignments = () => {
  const { user } = useContext(AuthContext);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [completeForm, setCompleteForm] = useState({});
  const [submitting, setSubmitting] = useState({});

  useEffect(() => {
    if (user && user.role === 'Maintenance Manager') {
      loadAssignments();
      // Auto-refresh every 20 seconds
      const interval = setInterval(loadAssignments, 20000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const data = await damageService.getMyAssignments();
      setAssignments(data.reports || []);
    } catch (error) {
      console.error('Error loading assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptAssignment = async (reportId) => {
    try {
      setSubmitting({ ...submitting, [reportId]: true });
      await damageService.acceptAssignment(reportId);
      loadAssignments();
    } catch (error) {
      alert('Error accepting assignment: ' + (error.message || 'Unknown error'));
    } finally {
      setSubmitting({ ...submitting, [reportId]: false });
    }
  };

  const handleCompleteWork = async (reportId) => {
    try {
      setSubmitting({ ...submitting, [reportId]: true });
      await damageService.completeWork(reportId, {
        completionNotes: completeForm[reportId] || '',
      });
      setCompleteForm({ ...completeForm, [reportId]: '' });
      setExpandedId(null);
      loadAssignments();
    } catch (error) {
      alert('Error completing work: ' + (error.message || 'Unknown error'));
    } finally {
      setSubmitting({ ...submitting, [reportId]: false });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Under Review': '#f39c12',
      'In Progress': '#3498db',
      'Completed': '#27ae60',
      'Scheduled': '#667eea',
    };
    return colors[status] || '#95a5a6';
  };

  if (!user || user.role !== 'Maintenance Manager') {
    return (
      <div className="maintenance-page">
        <p>This page is only accessible to Maintenance Managers.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="maintenance-page"><p>Loading assignments...</p></div>;
  }

  const pendingAssignments = assignments.filter(
    (a) => a.status === 'Under Review' || a.status === 'In Progress'
  );
  const completedAssignments = assignments.filter((a) => a.status === 'Completed');

  return (
    <div className="maintenance-page">
      <h1>My Work Assignments</h1>

      {pendingAssignments.length > 0 && (
        <div className="dashboard-section">
          <h2>Pending Work ({pendingAssignments.length})</h2>
          <table className="schedules-table">
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Road</th>
                <th>Damage Type</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Assigned Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingAssignments.map((report) => (
                <React.Fragment key={report._id}>
                  <tr>
                    <td>{report.reportId}</td>
                    <td>{report.roadAsset?.roadName}</td>
                    <td>{report.damageType}</td>
                    <td className={`severity-${report.severity.toLowerCase()}`}>
                      {report.severity}
                    </td>
                    <td>
                      <span
                        style={{
                          backgroundColor: getStatusColor(report.status),
                          color: 'white',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '4px',
                          fontSize: '0.85rem',
                        }}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td>{new Date(report.assignedDate).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {report.status === 'Under Review' && (
                          <button
                            className="schedule-btn"
                            onClick={() => handleAcceptAssignment(report._id)}
                            disabled={submitting[report._id]}
                          >
                            {submitting[report._id] ? 'Accepting...' : 'Accept'}
                          </button>
                        )}
                        {report.acceptedByManager && (
                          <button
                            className="schedule-btn"
                            onClick={() =>
                              setExpandedId(expandedId === report._id ? null : report._id)
                            }
                          >
                            {expandedId === report._id ? 'Collapse' : 'Complete'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandedId === report._id && report.acceptedByManager && (
                    <tr className="expanded-row">
                      <td colSpan="7">
                        <div className="completion-form">
                          <h4>Complete Work for {report.reportId}</h4>
                          <p>
                            <strong>Description:</strong> {report.description}
                          </p>
                          <textarea
                            placeholder="Add completion notes (optional)"
                            value={completeForm[report._id] || ''}
                            onChange={(e) =>
                              setCompleteForm({
                                ...completeForm,
                                [report._id]: e.target.value,
                              })
                            }
                            rows="3"
                            style={{
                              width: '100%',
                              padding: '0.75rem',
                              marginBottom: '1rem',
                              fontFamily: 'inherit',
                            }}
                          />
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              className="schedule-btn"
                              onClick={() => handleCompleteWork(report._id)}
                              disabled={submitting[report._id]}
                              style={{ backgroundColor: '#27ae60' }}
                            >
                              {submitting[report._id] ? 'Submitting...' : 'Mark as Complete'}
                            </button>
                            <button
                              className="schedule-btn"
                              onClick={() => setExpandedId(null)}
                              style={{ backgroundColor: '#95a5a6' }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {completedAssignments.length > 0 && (
        <div className="dashboard-section">
          <h2>Completed Work ({completedAssignments.length})</h2>
          <table className="schedules-table">
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Road</th>
                <th>Damage Type</th>
                <th>Completed Date</th>
                <th>Completion Notes</th>
              </tr>
            </thead>
            <tbody>
              {completedAssignments.map((report) => (
                <tr key={report._id} style={{ backgroundColor: '#f0fff4' }}>
                  <td>{report.reportId}</td>
                  <td>{report.roadAsset?.roadName}</td>
                  <td>{report.damageType}</td>
                  <td>{new Date(report.completedDate).toLocaleDateString()}</td>
                  <td className="notes-cell">{report.completionNotes || 'No notes'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {assignments.length === 0 && (
        <div className="dashboard-section">
          <p>No assignments yet. Check back soon!</p>
        </div>
      )}
    </div>
  );
};

export default ManagerAssignments;
