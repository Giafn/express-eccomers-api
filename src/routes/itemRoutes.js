const express = require("express");
const upload = require("../utils/multerHelper");
const itemController = require("../controllers/itemController");

const router = express.Router();

// Create Item
router.post("/", upload.array("images", 5), itemController.create);

// Read Items with Filters
router.get("/", itemController.read);

// Update Item
router.put("/:id", upload.none(), itemController.update);

// Delete Item
router.delete("/:id", itemController.delete);

module.exports = router;
