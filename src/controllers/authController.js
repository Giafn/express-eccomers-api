const UserRepository = require("../repositories/userRepository");
const RegisterUser = require("../usecases/user/registerUser");
const LoginUser = require("../usecases/user/loginUser");

const userRepository = new UserRepository();
const joi = require("joi");

module.exports = {
  async register(req, res) {
    try {
      const schema = joi.object({
        name: joi.string().required(),
        email: joi.string().email().required(),
        password: joi.string().min(6).required(),
      });

      const { error } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.message });
      }

      const registerUser = new RegisterUser(userRepository);
      const user = await registerUser.execute(req.body);
      return res.status(201).json({
        message: "User registered successfully",
        user,
      });
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  },

  async login(req, res) {
    try {
      const loginUser = new LoginUser(userRepository);
      const { email, password } = req.body;
      const { user, token } = await loginUser.execute({ email, password });

      return res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          is_admin: user.is_admin,
        },
      });
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  },
};
