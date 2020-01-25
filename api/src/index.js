import mongodb from 'mongodb';
import * as R from 'ramda';
import express from 'express';
import bcrypt from 'bcrypt';

import logger from './logger';
import jwt from 'express-jwt';
import jwtAlt from 'jsonwebtoken';
import bodyParser from 'body-parser';
import * as database from './database';
import cors from 'cors';

const SECRET =
  process.env.NODE_ENV === 'development'
    ? 'secret'
    : process.env.NUAGE_JWT_SECRET;

const authMiddleware = async (req, res, next) => {
  const userId = R.path(['user', 'userId'], req);
  const user = await database.getUser({ _id: mongodb.ObjectId(userId) });
  req.user = user;
  if (!user) return res.status(401).send({ error: 'unknown user' });
  next();
};

const corsOptions = {
  origin: '*',
};

const PUBLIC_PATHS = ['/register', '/login'];
const app = express();
app.use(cors(corsOptions));
app.use(jwt({ secret: SECRET }).unless({ path: PUBLIC_PATHS }));
app.use((err, req, res, next) => {
  console.log(err);
  if (err.name === 'UnauthorizedError') {
    res.status(401).send('invalid token...');
  }
});
app.use(bodyParser.json({ limit: '1mb' }));
const port = 3003;

app.get('/node/:id/records', authMiddleware, async (req, res) => {
  const nodeId = req.params.id;
  logger.debug('serving records', { userId: req.user._id, nodeId });
  const records = await database.getRecords(nodeId);
  res.send(records);
});
app.post('/user/record', authMiddleware, async (req, res) => {
  await database.createRecord({
    userId: req.user._id,
    ...req.body,
  });
  logger.debug(`new record from ${req.user._id}`);
  res.send({ success: true });
});
app.put('/node', authMiddleware, async (req, res) => {
  const resp = await database.addHost({
    userId: req.user._id,
    ip: req.body.ip,
    username: req.body.username,
    nodeType: req.body.nodeType,
    hostKey: req.body.hostKey,
  });
  logger.debug('host added', {
    userId: req.user._id,
    nodeType: req.body.nodeType,
  });
  res.send({ success: true, nodeId: resp.ops[0]._id });
});

app.post('/user/metrics', authMiddleware, (req, res) =>
  res.send({ success: true }),
);

(async () => {
  await database.setupDB();
  app.listen(port, () => {
    logger.info('Listening to incoming request', { port });
  });
})();

export const register = async (req, res) => {
  // TODO: better error handling
  const body = R.prop('body', req);
  const email = R.prop('email', body);
  logger.info('Register user', { email });
  //  const existingUser = await database.getUser({ email });
  //  if (existingUser) return res.status(401).send({ error: 'user exists' });
  const passwordHash = await bcrypt.hash(req.body.password, 10);
  await database.createUser(req.body.email, passwordHash);
  res.send({
    success: true,
  });
};

export const login = async (req, res) => {
  const user = await database.getUser({ email: req.body.username });
  if (!user)
    return res
      .status(401)
      .send({ error: `user ${req.body.username} not found` });
  const result = await bcrypt.compare(req.body.password, user.passwordHash);
  if (result) {
    const hosts = await database.getHostsForUser(user._id);
    const token = jwtAlt.sign({ userId: user._id.toHexString() }, SECRET);
    res.send({ success: true, token, hosts });
  }
  res.status(401).send();
};

app.post('/register', register);
app.post('/login', login);
