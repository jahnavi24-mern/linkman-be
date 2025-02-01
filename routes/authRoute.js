const express = require("express");
const { signup, signin, getProfile, editProfile } = require("../controllers/authController");
const { auth } = require("../middleware/auth");
const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/profile", auth, getProfile);
router.post("/edit-profile", auth, editProfile);

module.exports = router;