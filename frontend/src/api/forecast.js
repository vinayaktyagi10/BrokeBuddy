import axios from 'axios';
const api = axios.create({ baseURL: 'http://localhost:8000/api' });

export const getForecast = () => api.get('/forecast');
export const getRisk = () => api.get('/risk');
