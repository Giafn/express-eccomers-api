const express = require("express");
const userController = require("../controllers/userController");

const router = express.Router();

router.patch("/update", userController.updateProfile);
router.patch("/update-image", userController.updateProfileImage);
router.get("/profile", userController.getProfileWithImage);
router.patch("/update-password", userController.updatePassword);
router.delete("/delete", userController.deleteProfile);

module.exports = router;
