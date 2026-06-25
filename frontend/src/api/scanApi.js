import axios from 'axios';

// Create React App reads variables from the environment automatically using process.env.REACT_APP_
const API_BASE_URL = process.env.REACT_APP_RENDER_URL;

export const runScan = async (target) => {
  const response = await axios.post(`${API_BASE_URL}/scan`, { target });
  return response.data;
};

export const fetchHistory = async () => {
  const response = await axios.get(`${API_BASE_URL}/scan/history`);
  return response.data;
};

export const clearHistory = async () => {
  const response = await axios.delete(`${API_BASE_URL}/scan/history`);
  return response.data;
};
