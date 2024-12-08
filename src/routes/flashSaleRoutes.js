const express = require("express");
const flashSaleController = require("../controllers/flashSaleController");

const router = express.Router();

router.post("/", flashSaleController.create);
router.get("/active", flashSaleController.readActive);

module.exports = router;
