import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import Youch from 'youch';
import * as Sentry from '@sentry/node';
import 'express-async-errors';
import routes from './routes';
import './database';
import configSentry from './config/sentry';

class App {
  constructor() {
    this.server = express();
    Sentry.init(configSentry);

    this.middlewares();
    this.routes();
    this.execeptionHandler();
  }

  middlewares() {
    this.server.use(Sentry.Handlers.requestHandler());
    this.server.use(cors());
    this.server.use(express.json());
    this.server.use(
      '/files',
      express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))
    );
  }

  routes() {
    this.server.use(routes);
    this.server.use(Sentry.Handlers.errorHandler());
  }

  execeptionHandler() {
    this.server.use(async (err, req, res, next) => {
      if (process.env.NODE_ENV === 'development') {
        const errros = await new Youch(err, req).toJSON();
        return res.status(500).json(errros);
      }

      res.status(500).json({ erro: 'Erro no lada do servidor' });
    });
  }
}
// esta exportando uma instacia
export default new App().server;
