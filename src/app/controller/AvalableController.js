import {
  startOfDay,
  format,
  endOfDay,
  setHours,
  setMinutes,
  setSeconds,
  isAfter,
} from 'date-fns';
import { Op } from 'sequelize';
import Appointment from '../models/Appointment';

class AvalableController {
  async index(req, res) {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ erro: 'Data Invalida' });
    }

    const serchDate = Number(date);

    const appointment = await Appointment.findAll({
      where: {
        provider_id: req.params.providerId,
        canceled_ate: null,
        date: {
          [Op.between]: [startOfDay(serchDate), endOfDay(serchDate)],
        },
      },
    });

    const schedule = [
      '08:00',
      '09:00',
      '10:00',
      '11:00',
      '12:00',
      '13:00',
      '14:00',
      '15:00',
      '16:00',
      '17:00',
      '18:00',
    ];

    const avaiable = schedule.map(time => {
      const [hour, minute] = time.split(':');
      const value = setSeconds(
        setMinutes(setHours(serchDate, hour), minute),
        0
      );
      return {
        time,
        value: format(value, "yyyy-MM-dd'T'HH:mm:ssxxx"),
        avaiable:
          isAfter(value, new Date()) &&
          !appointment.find(a => format(a.date, 'HH:mm') === time),
      };
    });

    return res.json(avaiable);
  }
}

export default new AvalableController();