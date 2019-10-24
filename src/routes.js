import { Router } from 'express';
import multer from 'multer';
import UserController from './app/controller/UserController';
import SessionController from './app/controller/SessionController';
import FileController from './app/controller/FileController';
import ProviderController from './app/controller/ProviderController';
import AppointmentController from './app/controller/AppointmentController';
import ScheduleController from './app/controller/ScheduleController';
import NotificationController from './app/controller/NotificationController';
import AvalableController from './app/controller/AvalableController';
import authMidlleware from './app/middlewares/auth';
import multerConfig from './config/multer';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.use(authMidlleware);

routes.get('/provider', ProviderController.index);

routes.put('/user', UserController.update);

routes.get('/prvider/:providerId/avalable', AvalableController.index);

routes.post('/appointment', AppointmentController.store);
routes.get('/appointment', AppointmentController.index);
routes.delete('/appointment/:id', AppointmentController.delete);

routes.get('/shcedule', ScheduleController.index);
routes.get('/notifications', NotificationController.index);
routes.put('/notifications/:id', NotificationController.update);

routes.post('/files', upload.single('file'), FileController.store);
export default routes;
