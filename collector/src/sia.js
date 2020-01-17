import * as R from 'ramda';
import { connect } from 'sia.js';

let siad;

export const prepare = async () => {
  siad = await connect('localhost:9980');
};

export const collectHost = async () => {
  const hostData = await siad.call('/host');
  return hostData;
};

export const getStorage = async () => {
  const resp = await siad.call('/host/storage');
  return R.compose(
    R.sum,
    R.map(
      folder =>
        parseInt(R.prop('capacity', folder)) -
        parseInt(R.prop('capacityremaining', folder)),
    ),
    R.prop('folders'),
  )(resp);
};
