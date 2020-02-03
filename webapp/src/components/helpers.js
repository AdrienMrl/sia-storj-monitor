import * as R from 'ramda';
export const SC = 1000000000000000000000000;
export const prettyCurrency = (count, dec = 2) => (count / SC).toFixed(dec) + 'SC';
export const extractRevenueFromRecord = record => parseInt(record.storagerevenue) +
    parseInt(record.downloadbandwidthrevenue) +
    parseInt(record.uploadbandwidthrevenue) +
    parseInt(R.defaultTo(0, record.contractcompensation))

const KB = 1000;
const MB = KB * 1000;
const GB = MB * 1000;
const TB = GB * 1000;

export const myPrettyBytes = (count, dec = 3) => {
    if (count > TB) return `${(count / TB).toFixed(dec)}TB`;
    else if (count > GB) {
        return `${(count / GB).toFixed(dec)}GB`;
    }
    return `${(count / MB).toFixed(dec)}MB`;
};