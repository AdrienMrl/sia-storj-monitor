import * as R from 'ramda';
import axios from 'axios';

let siad;

export const prepare = async host => {
  siad = axios.create({
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
  const hostData = await collectHost();
  return R.path(['data', 'publickey', 'key'], hostData);
}

export const collectHost = async () => {
  const hostData = await siad.get('/host');
  return hostData;
};

export const getStorage = async () => {
  const resp = await siad.get('/host/storage');
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
