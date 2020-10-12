import Axios, { AxiosInstance } from 'axios';

process.env.NODE_ENV = 'prod';

let nuageMetricsAPI =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3002'
    : 'https://metrics-api.nuage.sh';

nuageMetricsAPI = 'https://metrics-api.nuage.sh';


let api: AxiosInstance;

export const setAuthToken = (token: string) =>
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

export const sendRecord = (payload: any) => api.post(`/user/record`, payload);
export const login = (email: string, password: string) =>
  api.post(`/login`, { username: email, password });
export const registerNode = (payload: any) => api.put('/node', payload);
export const updateNodeSettings = (nodeId: string, payload: any) => api.post(`/node/${nodeId}`, payload);