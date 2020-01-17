import mongodb from 'mongodb';
import * as R from 'ramda';
import * as sia from './sia.js';
import schedule from 'node-schedule';

const url = 'mongodb://localhost:27018';
const dbname = 'sia-storj-monitor';
const client = new mongodb.MongoClient(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  auth: {
    user: 'sevauk',
    password: 'kronos',
  },
});

let db = {};

export const setupDB = () =>
  new Promise((resolve, reject) => {
    client.connect(function(err) {
      if (err) return reject(err);
      db = client.db(dbname);
      //db.dropDatabase();
      resolve(db);
    });
  });

setupDB().then(() => {
  console.log('Database is ready');
});

const collect = async () => {
  console.log('collecting...');
  const resp = await sia.collectHost();
  const spaceUsed = await sia.getStorage();
  const record = {
    ...R.pick(
      ['storagerevenue', 'downloadbandwidthrevenue', 'uploadbandwidthrevenue'],
      resp.financialmetrics,
    ),
    spaceUsed,
    createdAt: new Date(),
  };
  db.collection('sia-records').insertOne(record);
};

console.log('connecting to sia...');
sia.prepare().then(() => {
  console.log('connected');
  schedule.scheduleJob('*/5 * * * * *', () => {
    collect();
  });
});
