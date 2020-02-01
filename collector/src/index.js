import * as R from 'ramda';
import * as sia from './sia.js';
import schedule from 'node-schedule';
import { sendRecord, login, setAuthToken, registerNode } from './api.js';
import fs from 'fs';

let nodeId;

const readConfig = () => {
  try {
    const content = fs.readFileSync('/etc/hostmonitor/config.json');
    return JSON.parse(content);
  } catch (err) {
    console.error(`could not read config file: ${err.message} Please create file at /etc/hostmonitor/config.json and make sure that the JSON is correct.`);
    process.exit(1);
  }
}

const collect = async nodeId => {
  const resp = await sia.collectHost();
  const spaceUsed = await sia.getStorage();
  const record = {
    type: 'SIA',
    ...R.pick(
      ['storagerevenue', 'downloadbandwidthrevenue', 'uploadbandwidthrevenue', 'contractcompensation'],
      resp.financialmetrics,
    ),
    spaceUsed,
    nodeId,
    createdAt: new Date(),
  };
  await sendRecord(record);
  console.log('sent record.');
};

const config = readConfig();
config.hosts.forEach(host => {
  console.log(`connecting to sia on port ${host.port}...`);
  sia.prepare(host).then(async SiaPubKey => {
    console.log('connected to sia. Public key is ' + SiaPubKey);
    console.log('login...');
    const resp = await login('hello@adrienmorel.co', 'kronos');
    console.log(`token: ${resp.data.token}`);
    setAuthToken(resp.data.token);
    console.log('login success');
    //SiaPubKey = 'foobar2';
    nodeId = R.prop(
      '_id',
      R.find(k => k.hostKey === SiaPubKey, resp.data.hosts),
    );
    if (!nodeId) {
      console.log('node is new. Registering');
      const registerResp = await registerNode({
        SiaPubKey,
        ip: '127.0.0.1',
        username: 'adri',
        nodeType: 'SIA',
        hostKey: SiaPubKey,
      });
      nodeId = R.path(['data', 'nodeId'], registerResp);
    }
    collect(nodeId);
    schedule.scheduleJob('*/30 * * * *', () => {
      collect(nodeId);
    });
  });

});
