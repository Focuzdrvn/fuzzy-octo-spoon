const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    imageUrl: {
      type: String,
    },
    voteCount: {
      type: Number,
      default: 0,
    },
    electionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Election",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index on electionId for fast queries (critical for voting page with 2000+ users)
candidateSchema.index({ electionId: 1, createdAt: 1 }); // Optimized for fetching candidates by election

// Index for result sorting
candidateSchema.index({ electionId: 1, voteCount: -1 }); // For leaderboard queries

module.exports = mongoose.model("Candidate", candidateSchema);
