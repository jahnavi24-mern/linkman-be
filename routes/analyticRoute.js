const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const analyticsController = require("../controllers/analyticsController");

router.post("/track", analyticsController.trackAnalytics);
router.get("/user", auth, analyticsController.getUserAnalytics);

router.get("/:linkId", analyticsController.getAnalyticsForLink);

router.get("/", auth, analyticsController.dashboardAnalytics);

module.exports = router;
