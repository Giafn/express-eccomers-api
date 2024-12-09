const express = require("express");
const cartController = require("../controllers/cartController");

const router = express.Router();

router.post("/", cartController.addToCart);
router.get("/", cartController.getCart);

module.exports = router;

