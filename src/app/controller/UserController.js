import * as Yup from 'yup';
import User from '../models/User';
import File from '../models/File';

class UserController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(6),
    });

    if (!(await schema.isValid(req.body))) {
      return res
        .status(400)
        .json({ erro: 'Campos invalidos, verifique e tente novamente' });
    }

    const userExist = await User.findOne({ where: { email: req.body.email } });

    if (userExist) {
      return res.status(400).json({ erro: 'Usuario ja cadastrado' });
    }
    const { id, email, name, provider } = await User.create(req.body);

    return res.json({ id, email, name, provider });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when(
          'oldPassword',
          (oldPassword, field) => (oldPassword ? field.required() : field)

          // .when tem acesso a todas os compos de Yup.
          // 2 parametros.
          // 1º variavel a ser a valiada, ex: oldPassword.
          // 2º uma funcao.
          // field se refere a password.
          // field.required() torna password obrigatorio.
        ),
      confirmPassword: Yup.string().when(
        'password',
        (password, field) =>
          password ? field.required().oneOf([Yup.ref('password')]) : field
        // Yup.ref referencia um ou mais compos de Yup
        // oneOf, possibilidades que o campo field/password pode conter
      ),
    });

    if (!(await schema.isValid(req.body))) {
      res
        .status(400)
        .json({ erro: 'Campos invalidos, verifique e tente novamente' });
    }

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

    const { id, name, avatar } = await User.findByPk(req.userId, {
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    return res.json({ id, email, name, avatar });
  }
}
export default new UserController();
