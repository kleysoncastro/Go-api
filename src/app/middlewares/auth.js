import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import authConfig from '../../config/auth';

export default async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (req.headers.authorization === undefined) {
    return res.status(401).json({ erro: 'Token não informando' });
  }
  if (req.headers.authorization === null) {
    return res.status(401).json({ erro: 'Token não aprovado 1' });
  }

  if (!authHeader) {
    return res.status(401).json({ erro: 'Token nao aprovado 2' });
  }

  const [, token] = authHeader.split(' ');

  try {
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);
    req.userId = decoded.id;

    return next();
  } catch (err) {
    return res.status(401).json({ error: 'token invalido catch' });
  }
};
