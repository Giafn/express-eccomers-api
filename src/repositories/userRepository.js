const { User } = require("../infrastructure/models");

class UserRepository {
  async create(user) {
    return await User.create(user);
  }

  async findByEmail(email) {
    return await User.findOne({ where: { email } });
  }
}

module.exports = UserRepository;
