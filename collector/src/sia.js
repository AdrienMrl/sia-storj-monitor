import * as R from 'ramda';
import axios from 'axios';

let siads = {};

export const prepare = async host => {
  siads[host.port] = axios.create({
    baseURL: `http://localhost:${host.port}`,
    auth: {
      username: '',
      password: host.apipassword
    },
    headers: {
      common: {
        'Content-Type': 'application/json',
        'User-Agent': 'Sia-Agent',
      },
    },
  });
  const hostData = await collectHost(host.port);
  return R.path(['data', 'publickey', 'key'], hostData);
}

export const collectHost = async (port) => {
  const hostData = await siads[port].get('/host');
  return hostData;
};

export const getStorage = async (port) => {
  const resp = await siads[port].get('/host/storage');
  return R.compose(
    R.sum,
    R.map(
      folder =>
        parseInt(R.prop('capacity', folder)) -
        parseInt(R.prop('capacityremaining', folder)),
    ),
    R.path(['data', 'folders']),
  )(resp);
};
