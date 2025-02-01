const express = require("express");
const router = express.Router();
const redirectController = require("../controllers/redirectController");

router.get("/:shortLink", redirectController.handleRedirect);

module.exports = router;
