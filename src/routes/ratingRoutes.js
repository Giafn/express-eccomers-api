const express = require("express");
const ratingController = require("../controllers/ratingController");

const router = express.Router();

router.post("/", ratingController.addrating);
router.get("/", ratingController.getAllRatings);
router.get("/get/:itemId", ratingController.getRatingByItemId);
router.get("/buyed-item", ratingController.getItemHasBuyed);


module.exports = router;

