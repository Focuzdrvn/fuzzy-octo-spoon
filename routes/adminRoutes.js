const express = require("express");
const router = express.Router();
const { isAdmin } = require("../middleware/auth");
const { uploadCandidate } = require("../middleware/upload");

// Import controllers
const {
  createElection,
  getAllElections,
  updateElection,
  deleteElection,
} = require("../controllers/adminElectionController");

const {
  createCandidate,
  getCandidatesByElection,
  updateCandidate,
  deleteCandidate,
} = require("../controllers/adminCandidateController");

const {
  addVoterEmail,
  getAllVoters,
  deleteVoterEmail,
} = require("../controllers/adminVoterRollController");

const {
  getAdminResults,
  getAdminResultsByElection,
  getVoteLog,
} = require("../controllers/resultsController");

// Apply isAdmin middleware to all routes
router.use(isAdmin);

// Election Routes
router.post("/elections", createElection);
router.get("/elections", getAllElections);
router.put("/elections/:id", updateElection);
router.delete("/elections/:id", deleteElection);

// Candidate Routes (with image upload)
router.post("/candidates", uploadCandidate.single("image"), createCandidate);
router.get("/candidates/:electionId", getCandidatesByElection);
router.put("/candidates/:id", uploadCandidate.single("image"), updateCandidate);
router.delete("/candidates/:id", deleteCandidate);

// Voter Roll Routes
router.post("/voterroll", addVoterEmail);
router.get("/voterroll", getAllVoters);
router.delete("/voterroll", deleteVoterEmail);

// Results Routes (Admin)
router.get("/results", getAdminResults);
router.get("/results/:electionId", getAdminResultsByElection);
router.get("/votelog", getVoteLog);

module.exports = router;
