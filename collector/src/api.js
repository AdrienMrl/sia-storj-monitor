import Axios from 'axios';

process.env.NODE_ENV = 'prod';

let nuageMetricsAPI =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3002'
    : 'https://metrics-api.nuage.sh';

nuageMetricsAPI = 'https://metrics-api.nuage.sh';


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
export const updateNodeSettings = (nodeId, payload) => api.post(`/node/${nodeId}`, payload);