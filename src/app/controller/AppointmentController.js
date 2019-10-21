import * as Yup from 'yup';
import User from '../models/User';
import Appointment from '../models/Appointment';

class AppointmentController {
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

    const IsProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });
    if (!IsProvider) {
      return res.status(401).json({ erro: 'voce nao tem permição' });
    }

    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date,
    });

    res.json(appointment);
  }
}

export default new AppointmentController();
