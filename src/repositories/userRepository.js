const { User } = require("../infrastructure/models");

class UserRepository {
  async create(user) {
    return await User.create(user);
  }

  async findByEmail(email) {
    return await User.findOne({ where: { email } });
  }

  async findById(id) {
    return await User.findByPk(id);
  }

  async update(id, data) {
    const user = await User.findByPk(id);
    return await user.update(data);
  }

  async updatePassword(id, password) {
    const user = await User.findByPk(id);
    return await user.update({ password });
  }

  async delete(id) {
    const user = await User.findByPk(id);
    return await user.destroy();
  }
}

module.exports = UserRepository;
