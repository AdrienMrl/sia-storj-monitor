import Axios from 'axios';

const nuageMetricsAPI =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3002'
    : 'http://149.56.13.45:3003';

let api;

export const setAuthToken = token =>
  (api = Axios.create({
    baseURL: nuageMetricsAPI,
    headers: {
      common: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  }));

setAuthToken('');

export const sendRecord = payload => api.post(`/user/record`, payload);
export const login = (email, password) =>
  api.post(`/login`, { username: email, password });
export const registerNode = payload => api.put('/node', payload);
