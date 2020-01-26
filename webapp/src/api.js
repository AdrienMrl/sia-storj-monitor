import axios from 'axios';
import * as R from 'ramda';

const getInstance = token =>
  axios.create({
    baseURL: `http://149.56.13.45:3003`,
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
  console.log(resp);
  return R.path(['data'], resp);
};
