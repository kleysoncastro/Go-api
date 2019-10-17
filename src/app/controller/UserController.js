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

  async update(req, res) {
    const { email, oldPassword } = req.body;

    const user = await User.findByPk(req.userId);

    if (email !== user.email) {
      const userExists = await User.findOne({ where: { email } });

      if (userExists) {
        return res.status(400).json({ error: 'Usuario ja existe' });
      }
    }

    // So troca a senha se existir oldPassword no body

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      res.status(401).json({ erro: 'Passsword invalido' });
    }

    const { id, name, provider } = await user.update(req.body);

    return res.json({ id, email, name, provider });
  }
}
export default new UserController();
