const express = require("express");
const router = express.Router();
const { isVoter } = require("../middleware/auth");
const { voteLimiter } = require("../middleware/rateLimiter");

const {
  getActiveElections,
  getElectionBySlug,
  castVote,
} = require("../controllers/voteController");

// Apply isVoter middleware to all routes
router.use(isVoter);

// GET /api/elections - Get all active elections
router.get("/elections", getActiveElections);

// GET /api/elections/:slug - Get election by slug with candidates
router.get("/elections/:slug", getElectionBySlug);

// POST /api/vote - Cast vote (with rate limiting)
router.post("/vote", voteLimiter, castVote);

module.exports = router;
