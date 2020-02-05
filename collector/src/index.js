import * as R from 'ramda';
import os from 'os';
import * as sia from './sia.js';
import * as storj from './storj.js';
import schedule from 'node-schedule';
import { sendRecord, login, setAuthToken, registerNode } from './api.js';
import fs from 'fs';

const readConfig = () => {
  try {
    const content = fs.readFileSync('/etc/hostmonitor/config.json');
    return JSON.parse(content);
  } catch (err) {
    console.error(`could not read config file: ${err.message} Please create file at /etc/hostmonitor/config.json and make sure that the JSON is correct.`);
    process.exit(1);
  }
}

const collect = async (nodeId, port, type) => {
  let record = {};
  if (type === 'SIA') {
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
    console.log(spaceUsed);
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

const config = readConfig();

const ready = async (id, host) => {
  console.log(`connected to ${host.type}. Public key or ID is ${id}. Logging in...`);
  const resp = await login('hello@adrienmorel.co', 'kronos');
  console.log(`token: ${resp.data.token}`);
  setAuthToken(resp.data.token);
  console.log('login success');
  let nodeId = R.prop(
    '_id',
    R.find(k => k.hostKey === id, resp.data.hosts),
  );
  if (!nodeId) {
    console.log('node is new. Registering');
    const registerResp = await registerNode({
      ip: 'localhost',
      username: os.userInfo().username,
      nodeType: host.type,
      hostKey: id,
    });
    nodeId = R.path(['data', 'nodeId'], registerResp);
  }
  collect(nodeId, host.port, host.type);
  schedule.scheduleJob('*/30 * * * *', () => {
    collect(nodeId, host.port, host.type);
  });
}

config.hosts.forEach(host => {
  if (host.type === 'SIA') {
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
