import { Router } from 'express';

const routes = new Router();

routes.get('/', (req, res) => {
  res.json({ msg: 'Hello there' });
});

export default routes;
