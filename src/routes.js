import { Router } from 'express';
import multer from 'multer';
import UserController from './app/controller/UserController';
import SessionController from './app/controller/SessionController';
import authMidlleware from './app/middlewares/auth';
import multerConfig from './config/multer';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.use(authMidlleware);

routes.put('/user', UserController.update);

routes.post('/files', upload.single('file'), (req, res) => {
  res.json({ ok: true });
});
export default routes;
