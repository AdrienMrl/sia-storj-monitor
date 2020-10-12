import * as R from 'ramda';

import axios, { AxiosInstance } from 'axios';

import { Host } from './model';

let storjs: Record<number,AxiosInstance> = {};

export const prepare = async (host: Host) => {
    storjs[host.port] = axios.create({
        baseURL: `http://localhost:${host.port}`,
        headers: {
            common: {
                'Content-Type': 'application/json',
            },
        },
    });
    const hostData = await storjs[host.port].get('/api/dashboard');
    return R.path(['data', 'data', 'nodeID'], hostData);
}

export const collect = async (port: number) => {
    const resp = await storjs[port].get('/api/dashboard');
    return R.path(['data', 'data', 'diskSpace', 'used'], resp);
};
