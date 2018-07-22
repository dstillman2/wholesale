import express from 'express';

const app = express();
const http = require('http').Server(app);

const createRouter = () => (
  express.Router()
);

export { app, http, createRouter };
