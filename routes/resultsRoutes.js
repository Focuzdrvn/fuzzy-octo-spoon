const express = require("express");
const router = express.Router();
const { getPublicResults } = require("../controllers/resultsController");

// GET /api/results/:slug - Get public results for closed election (no auth)
router.get("/:slug", getPublicResults);

module.exports = router;
