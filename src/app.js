import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import io from 'socket.io';
import http from 'http';
import path from 'path';
import Youch from 'youch';
import * as Sentry from '@sentry/node';
import 'express-async-errors';
import routes from './routes';
import './database';
import configSentry from './config/sentry';

class App {
  constructor() {
    this.app = express();
    this.server = http.Server(this.app);
    Sentry.init(configSentry);

    this.socket();

    this.middlewares();
    this.routes();
    this.execeptionHandler();

    // guarda todos o usuarios conectados so socket

    this.connectedUser = {};
  }

  socket() {
    this.io = io(this.server);

    // recebe uma instacio do clinte que é uma hash
    this.io.on('connection', socket => {
      const { user_id } = socket.handshake.query;
      this.connectedUser[user_id] = socket.id;

      socket.on('disconnect', () => {
        delete this.connectedUser[user_id];
      });
    });
  }

  middlewares() {
    this.app.use(Sentry.Handlers.requestHandler());
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(
      '/files',
      express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))
    );

    this.app.use((req, res, next) => {
      req.io = this.io;
      req.connectedUser = this.connectedUser;
      next();
    });
  }

  routes() {
    this.app.use(routes);
    this.app.use(Sentry.Handlers.errorHandler());
  }

  execeptionHandler() {
    this.app.use(async (err, req, res, next) => {
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
