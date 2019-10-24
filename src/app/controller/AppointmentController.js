import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';
import pt from 'date-fns/locale/pt-BR';
import User from '../models/User';
import Appointment from '../models/Appointment';
import File from '../models/File';
import Notification from '../schema/Notification';
import CancellationMail from '../jobs/CancellationMail';
import Queue from '../../lib/Queue';

class AppointmentController {
  /*
   * @parm attributes retorna apenas colunas no []
   */
  async index(req, res) {
    const { page = 1 } = req.query;

    const appointment = await Appointment.findAll({
      where: { user_id: req.userId, canceled_ate: null },
      order: ['date'],
      attributes: ['id', 'date', 'past', 'cancelable'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
    });

    res.json(appointment);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ erro: 'Falha, dadas icorretos' });
    }
    const { provider_id, date } = req.body;

    /*
     * Check se provider_id é um provider
     */

    const checkIsProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });
    if (!checkIsProvider) {
      return res
        .status(401)
        .json({ erro: 'Usuario informado nao é um prestar de servico' });
    }

    if (provider_id === req.userId) {
      return res
        .status(401)
        .json({ erro: 'Voce nao pode agendar consigo mesmo' });
    }

    /*
     * check se data para cadastro e menor que data atual.
     * startOfHour, pega data, e a hora inteira, ex: 18:00, 3:00
     */

    const hourStart = startOfHour(parseISO(date));

    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ erro: 'Essa data nao é permitida' });
    }

    /*
     * check se hara para agendamento esta disponivel
     */

    const checkHour = await Appointment.findOne({
      where: {
        provider_id,
        canceled_ate: null,
        date: hourStart,
      },
    });

    if (checkHour) {
      return res.status(400).json({ erro: 'Esse horario não é permitido' });
    }

    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date: hourStart,
    });

    /*
     * notifica prestador de servico
     */

    const user = await User.findByPk(req.userId);

    const formateDate = format(hourStart, "'dia' dd 'de' MMM', as' H:mm'h'", {
      locale: pt,
    });

    await Notification.create({
      content: `Novo agendamento de ${user.name} para o ${formateDate}`,
      user: provider_id,
    });

    return res.status(200).json(appointment);
  }

  async delete(req, res) {
    const appointment = await Appointment.findByPk(
      req.params.id,

      {
        include: [
          {
            model: User,
            as: 'provider',
            attributes: ['name', 'email'],
          },
          {
            model: User,
            as: 'user',
            attributes: ['name'],
          },
        ],
      }
    );

    if (appointment.user_id !== req.userId) {
      res
        .status(401)
        .json({ erro: 'Você nao tem permicao para fazer este procedimento' });
    }

    const dateWinthSub = subHours(appointment.date, 2);

    if (isBefore(dateWinthSub, new Date())) {
      return res.status(401).json({
        erro: 'Este procesimento só pode ser feito 2h antes da hora marcada',
      });
    }

    appointment.canceled_ate = new Date();
    await appointment.save();

    await Queue.add(CancellationMail.key, {
      appointment,
    });

    return res.json(appointment);
  }
}

export default new AppointmentController();
