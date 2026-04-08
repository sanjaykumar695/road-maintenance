import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');

const apiCall = async (method, url, data = null) => {
  try {
    const config = {
      method,
      url: `${API_URL}${url}`,
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    };
    if (data) config.data = data;

    const response = await axios(config);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const roadService = {
  getAllRoads: () => apiCall('GET', '/roads'),
  getRoadById: (id) => apiCall('GET', `/roads/${id}`),
  createRoad: (data) => apiCall('POST', '/roads', data),
  updateRoad: (id, data) => apiCall('PUT', `/roads/${id}`, data),
  updateRoadCondition: (id, data) => apiCall('PUT', `/roads/${id}/condition`, data),
  deleteRoad: (id) => apiCall('DELETE', `/roads/${id}`),
  getRoadsNear: (longitude, latitude, maxDistance) =>
    apiCall('GET', `/roads/near?longitude=${longitude}&latitude=${latitude}&maxDistance=${maxDistance}`),
};

export const damageService = {
  getAllReports: () => apiCall('GET', '/damage-reports'),
  getReportById: (id) => apiCall('GET', `/damage-reports/${id}`),
  createReport: (data) => apiCall('POST', '/damage-reports', data),
  updateReport: (id, data) => apiCall('PUT', `/damage-reports/${id}`, data),
  getCriticalReports: () => apiCall('GET', '/damage-reports/critical'),
  getMyReports: () => apiCall('GET', '/damage-reports/my-reports'),
  getMyAssignments: () => apiCall('GET', '/damage-reports/my-assignments'),
  assignReport: (id, data) => apiCall('PUT', `/damage-reports/${id}/assign`, data),
  acceptAssignment: (id) => apiCall('PUT', `/damage-reports/${id}/accept`),
  completeWork: (id, data) => apiCall('PUT', `/damage-reports/${id}/complete`, data),
  verifyCompletion: (id, data) => apiCall('PUT', `/damage-reports/${id}/verify`, data),
};

export const maintenanceService = {
  getAllSchedules: () => apiCall('GET', '/maintenance-schedules'),
  getScheduleById: (id) => apiCall('GET', `/maintenance-schedules/${id}`),
  createSchedule: (data) => apiCall('POST', '/maintenance-schedules', data),
  updateSchedule: (id, data) => apiCall('PUT', `/maintenance-schedules/${id}`, data),
  getStatistics: () => apiCall('GET', '/maintenance-schedules/stats'),
};

export const userService = {
  getAllUsers: () => apiCall('GET', '/users'),
  getUserById: (id) => apiCall('GET', `/users/${id}`),
  updateUser: (id, data) => apiCall('PUT', `/users/${id}`, data),
  deleteUser: (id) => apiCall('DELETE', `/users/${id}`),
};
