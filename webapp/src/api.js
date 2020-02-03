import axios from 'axios';
import * as R from 'ramda';

const getInstance = token =>
  axios.create({
    baseURL: `https://metrics-api.nuage.sh`,
    headers: {
      common: {
        Authorization: token && `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  });

let api = getInstance();

// /node/${nodeId}/records

export const login = async (email, password) => {
  const resp = await api.post('/login', { username: email, password });
  api = getInstance(R.path(['data', 'token'], resp));
  console.log('login success');
  return R.prop('data', resp);
};

export const getRecords = async nodeId => {
  const resp = await api.get(`/node/${nodeId}/records`);
  return R.path(['data'], resp);
};
