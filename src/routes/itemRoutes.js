const express = require("express");
const upload = require("../utils/multerHelper");
const itemController = require("../controllers/itemController");
const authMiddleware = require("../utils/authMiddleware");

const router = express.Router();

router.get("/", itemController.read);
router.get("/:id", itemController.readById);
router.post("/", authMiddleware, upload.array("images", 5), itemController.create);
router.put("/:id", authMiddleware, upload.array("images", 5), itemController.update);
router.delete("/:id", authMiddleware, itemController.delete);

module.exports = router;
