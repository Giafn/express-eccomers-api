const jwt = require("jsonwebtoken");
const UserRepository = require("../repositories/userRepository");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]; // Ambil token dari header
  const token = authHeader && authHeader.split(" ")[1]; // Format: "Bearer TOKEN"

  if (!token) {
    res.status(401).json(
      {
        "status": "unauthenticated",
        "message": "No token provided"
      }
    );
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    if (err) {
      res.status(403).json(
        {
          "status": "unauthenticated",
          "message": "Token is not valid"
        }
      );
    }
    // cek apakah user ada di database
    let repo = new UserRepository();
    const userExist = await repo.findById(user.id);
    if (!userExist) {
      res.status(403).json(
        {
          "status": "unauthenticated",
          "message": "Token is not valid"
        }
      );
    }


    req.user = user; // Simpan data user dari token ke `req.user`
    next(); // Lanjut ke handler berikutnya
  });
};

module.exports = authenticateToken;
