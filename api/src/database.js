import * as R from 'ramda';

import logger from './logger';
import mongodb from 'mongodb';

const url = 'mongodb://localhost:27017';
const dbname = 'nuage-metrics';
const client = new mongodb.MongoClient(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  //  auth: {
  //    user: 'sevauk',
  //    password: 'kronos',
  //password: 'password'
  //  process.env.NODE_ENV === 'development'
  //    ? 'password'
  //    : process.env.NUAGE_MONGO_PASSWD,
  //  },
});

let db = {};

export const setupDB = () =>
  new Promise((resolve, reject) => {
    client.connect(function (err) {
      if (err) return reject(err);
      db = client.db(dbname);
      logger.info('Connected to mongoDB', { url, dbname });
      //db.dropDatabase();
      resolve(db);
    });
  });

export const getUser = (query) => db.collection('user').findOne(query);

export const createUser = (email, passwordHash) =>
  db.collection('user').insertOne({
    email,
    passwordHash,
  });

export const createRecord = (payload) =>
  db.collection('records').insertOne(payload);

export const addHost = (payload) => db.collection('host').insertOne(payload);

export const getHostsForUser = (userId) =>
  db.collection('host').find({ userId }).toArray();
export const getRecords = (nodeId) =>
  db.collection('records').find({ nodeId }).toArray();

export const updateHostSettings = (nodeId, settings) =>
  db
    .collection('host')
    .updateOne({ _id: mongodb.ObjectID(nodeId) }, { $set: { settings } });
