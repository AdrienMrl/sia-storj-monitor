import mongodb from 'mongodb';
import * as R from 'ramda';

const url = 'mongodb://localhost:27017';
const dbname = 'sia-storj-monitor';
const client = new mongodb.MongoClient(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
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
