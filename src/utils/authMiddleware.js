const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]; // Ambil token dari header
  const token = authHeader && authHeader.split(" ")[1]; // Format: "Bearer TOKEN"

  if (!token) {
    return res.status(401).json(
      {
        "status": "unauthenticated",
        "message": "No token provided"
      }
    );
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json(
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
