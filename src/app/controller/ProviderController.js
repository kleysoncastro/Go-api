import User from '../models/User';
import File from '../models/File';

class ProviderController {
  /*
   *@param File, se tiver mais de um relacionameto
   * deve-se para como arrays
   */
  async index(req, res) {
    const provider = await User.findAll({
      where: { provider: true },
      attributes: ['id', 'name', 'email', 'avatar_id'],
      include: [
        { model: File, as: 'avatar', attributes: ['name', 'path', 'url'] },
      ],
    });
    res.status(200).json(provider);
  }
}

export default new ProviderController();
