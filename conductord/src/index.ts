import * as R from 'ramda';
import * as sia from './sia';
import * as storj from './storj';

import { Host, HostType } from './model';
import { login, registerNode, sendRecord, setAuthToken, updateNodeSettings } from './api';

import fs from 'fs';
import os from 'os';
import schedule from 'node-schedule';

const readConfig = () => {
  try {
    const content = fs.readFileSync('/etc/conductord/config.json');
    return JSON.parse(content.toString());
  } catch (err) {
    console.error(`could not read config file: ${err.message} Please create file at /etc/conductord/config.json and make sure that the JSON is correct.`);
    process.exit(1);
  }
}

const collect = async (nodeId: string, port: number, type: HostType) => {
  let record = {};
  if (type === HostType.SIA) {
    const resp = await sia.collectHost(port);
    const spaceUsed = await sia.getStorage(port);
    record = {
      type: 'SIA',
      ...R.pick(
        ['storagerevenue', 'downloadbandwidthrevenue', 'uploadbandwidthrevenue', 'contractcompensation'],
        resp.data.financialmetrics,
      ),
      spaceUsed,
      nodeId,
      createdAt: new Date(),
    };
  } else {
    const spaceUsed = await storj.collect(port);
    record = {
      type: 'STORJ',
      spaceUsed,
      nodeId,
      createdAt: new Date(),
    };
  }
  await sendRecord(record);
  console.log('sent record.');
};

const checkNodeSettings = async (node: Host) => {
  if (node.type === HostType.SIA && node._id) {
    console.log('collecting node settigns for SIA');
    const settings = await sia.getHostSettings(node);
    await updateNodeSettings(node._id, settings);
  }
}

const config = readConfig();

const ready = async (id: string, hostInfo: Host) => {
  console.log(`connected to ${hostInfo.type}. Public key or ID is ${id}. Logging in...`);
  const resp = await login(process.env.NODE_ENV === 'development' ? 'test@adrienmorel.co' : 'hello@adrienmorel.co', 'kronos');
  console.log(`token: ${resp.data.token}`);
  setAuthToken(resp.data.token);
  console.log('login success');
  let host = resp.data.hosts.find((k: any) => k.hostKey === id);
  if (!host) {
    console.log('node is new. Registering');
    const registerResp = await registerNode({
      ip: 'localhost',
      username: os.userInfo().username,
      nodeType: hostInfo.type,
      hostKey: id,
    });
    host = R.prop('data', registerResp);
  }

  collect(host._id, hostInfo.port, host.nodeType);
  const hostWithPort = R.assoc('port', hostInfo.port, host);
  checkNodeSettings(hostWithPort);
  schedule.scheduleJob('*/30 * * * *', () => {
    collect(host._id, host.port, host.nodeType);
  });
  schedule.scheduleJob('0 */30 * * *', () => {
    checkNodeSettings(hostWithPort);
  });
}

config.hosts.forEach((host: Host) => {
  if (host.type === HostType.SIA) {
    console.log(`connecting to sia on port ${host.port}...`);
    sia.prepare(host).then(async SiaPubKey => {
      ready(SiaPubKey, host);
    });
  } else {
    storj.prepare(host).then(async id => {
      ready(id, host);
    })
  }
});
