const { hashPassword } = require("../../utils/hashHelper");

class RegisterUser {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(userData) {
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error("Email already registered.");
    }

    userData.password = await hashPassword(userData.password);
    return await this.userRepository.create(userData);
  }
}

module.exports = RegisterUser;
