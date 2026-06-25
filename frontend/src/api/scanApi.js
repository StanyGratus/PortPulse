import axios from 'axios';
require('dotenv').config();

export const runScan = async (target) => {
  const response = await axios.post(`${process.env.URL}/scan`, { target });
  return response.data;
};

export const fetchHistory = async () => {
  const response = await axios.get(`${process.env.URL}/scan/history`);
  return response.data;
};

export const clearHistory = async () => {
  const response = await axios.delete(`${process.env.URL}/scan/history`);
  return response.data;
};