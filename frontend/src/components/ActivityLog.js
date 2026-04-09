import React, { useState, useEffect } from 'react';
import { damageService } from '../services/api';

const ActivityLog = ({ limit = 5 }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadActivities();
    // Refresh activities every 20 seconds
    const interval = setInterval(loadActivities, 20000);
    return () => clearInterval(interval);
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const data = await damageService.getActivityLog(limit);
      setActivities(data.activities || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="activity-log-container"><p>Loading activities...</p></div>;
  }

  return (
    <div className="activity-log-container">
      <h3>Recent Completed Work</h3>
      {error && <div className="error-message">{error}</div>}
      {activities.length > 0 ? (
        <div className="activity-list">
          {activities.map((activity) => (
            <div key={activity._id} className="activity-item">
              <div className="activity-header">
                <span className="activity-badge">✓ Completed</span>
                <span className="activity-date">
                  {new Date(activity.completedDate).toLocaleDateString()} at{' '}
                  {new Date(activity.completedDate).toLocaleTimeString()}
                </span>
              </div>
              <div className="activity-body">
                <p>
                  <strong>{activity.assignedTo?.username}</strong> completed work on{' '}
                  <strong>{activity.roadAsset?.roadName}</strong>
                </p>
                <p className="activity-detail">
                  Report ID: {activity.reportId} | Damage: {activity.damageType}
                </p>
                {activity.completionNotes && (
                  <p className="activity-notes">Notes: {activity.completionNotes}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-activities">No completed activities yet</p>
      )}
    </div>
  );
};

export default ActivityLog;
