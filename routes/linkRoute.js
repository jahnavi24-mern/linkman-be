const express = require("express");
const { createLink, editLink, readLink, readAllLinksOfUser, removeLink, searchLinksByRemarks } = require("../controllers/linkController");
const { auth } = require("../middleware/auth");
const router = express.Router();

router.get("/search", auth, searchLinksByRemarks);

router.post("/create", auth, createLink);
router.post("/edit/:id", auth, editLink);
router.get("/:id", auth, readLink);
router.get("/", auth, readAllLinksOfUser);
router.delete("/:id", auth, removeLink);



module.exports = router;