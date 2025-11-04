import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://backend-service-0d12.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// This function attaches your login token to all protected requests
const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

// --- Auth Routes ---
const login = (email, password) => {
  return apiClient.post('/users/login', { email, password });
};

const signup = (agencyName, email, password) => {
  return apiClient.post('/users/signup', { agencyName, email, password });
};

// --- Project Routes ---
const getProjects = () => {
  return apiClient.get('/projects');
};

const createProject = (name) => {
  return apiClient.post('/projects', { name });
};

// --- Experiment Routes ---
const getExperimentsByProject = (projectId) => {
  return apiClient.get(`/experiments/project/${projectId}`);
};

const getExperimentById = (id) => {
  return apiClient.get(`/experiments/${id}`);
};

const createExperiment = (data) => {
  // data = { name, variations, projectId }
  return apiClient.post('/experiments', data);
};

const getExperimentStats = (id) => {
  return apiClient.get(`/experiments/${id}/stats`);
};

// --- Admin Routes ---
const getAdminUsers = () => {
  return apiClient.get('/admin/users');
};

const getAdminProjects = () => {
  return apiClient.get('/admin/projects');
};

// --- This is the export list ---
export default {
  setAuthToken,
  login,
  signup,
  getProjects,
  createProject,
  getExperimentsByProject,
  createExperiment,
  getAdminUsers,
  getAdminProjects,
  getExperimentById,
  getExperimentStats,
};
