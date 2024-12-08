const express = require("express");
const upload = require("../utils/multerHelper");
const itemController = require("../controllers/itemController");

const router = express.Router();

router.post("/", upload.array("images", 5), itemController.create);
router.get("/", itemController.read);
router.get("/:id", itemController.readById);
router.put("/:id", upload.none(), itemController.update);
router.delete("/:id", itemController.delete);

module.exports = router;
