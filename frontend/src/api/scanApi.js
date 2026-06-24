import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

export const runScan = async (target) => {
  const response = await axios.post(`${BASE_URL}/scan`, { target });
  return response.data;
};

export const fetchHistory = async () => {
  const response = await axios.get(`${BASE_URL}/scan/history`);
  return response.data;
};

export const clearHistory = async () => {
  const response = await axios.delete(`${BASE_URL}/scan/history`);
  return response.data;
};