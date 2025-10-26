const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  electionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Election",
    required: true,
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Candidate",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for fast "already voted" checks (critical for 2000+ concurrent users)
voteSchema.index({ userId: 1, electionId: 1 }, { unique: true }); // Prevent duplicate votes at DB level

// Index on electionId for analytics queries
voteSchema.index({ electionId: 1, createdAt: -1 }); // Optimized for vote counting and time-series

// Index on candidateId for result aggregation
voteSchema.index({ candidateId: 1, electionId: 1 });

module.exports = mongoose.model("Vote", voteSchema);
