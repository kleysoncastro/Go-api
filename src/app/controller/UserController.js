import User from '../models/User';

class UserController {
  async store(req, res) {
    const userExist = await User.findOne({ where: { email: req.body.email } });

    if (userExist) {
      return res.status(400).json({ erro: 'Usuario ja cadastrado' });
    }
    const { id, email, name, provider } = await User.create(req.body);

    return res.json({ id, email, name, provider });
  }
}
export default new UserController();
