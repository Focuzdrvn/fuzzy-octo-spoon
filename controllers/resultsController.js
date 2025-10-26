const Election = require("../models/Election");
const Candidate = require("../models/Candidate");
const Vote = require("../models/Vote");
const VoterRoll = require("../models/VoterRoll");

/**
 * Get all election results (Admin)
 * GET /api/admin/results
 */
const getAdminResults = async (req, res, next) => {
  try {
    const elections = await Election.find().sort({ createdAt: -1 });

    const resultsPromises = elections.map(async (election) => {
      const candidates = await Candidate.find({
        electionId: election._id,
      }).sort({ voteCount: -1 });

      return {
        election,
        candidates,
      };
    });

    const results = await Promise.all(resultsPromises);

    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get detailed results for a specific election (Admin)
 * GET /api/admin/results/:electionId
 */
const getAdminResultsByElection = async (req, res, next) => {
  try {
    const election = await Election.findById(req.params.electionId);

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    // Get candidates with vote counts
    const candidates = await Candidate.find({ electionId: election._id }).sort({
      voteCount: -1,
    });

    // Calculate voter turnout
    const totalEligibleVoters = await VoterRoll.countDocuments();

    const uniqueVoters = await Vote.distinct("userId", {
      electionId: election._id,
    });
    const totalVotesCast = uniqueVoters.length;

    const turnoutPercentage =
      totalEligibleVoters > 0
        ? ((totalVotesCast / totalEligibleVoters) * 100).toFixed(2)
        : 0;

    // Calculate total votes and percentages
    const totalVotes = candidates.reduce((sum, c) => sum + c.voteCount, 0);

    const candidatesWithPercentages = candidates.map((c) => ({
      ...c.toObject(),
      percentage:
        totalVotes > 0 ? ((c.voteCount / totalVotes) * 100).toFixed(2) : 0,
    }));

    res.status(200).json({
      success: true,
      data: {
        election,
        candidates: candidatesWithPercentages,
        analytics: {
          totalEligibleVoters,
          totalVotesCast,
          turnoutPercentage: parseFloat(turnoutPercentage),
          totalVotes,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get vote log (Admin)
 * GET /api/admin/votelog
 */
const getVoteLog = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const votes = await Vote.find()
      .populate("electionId", "title")
      .populate("candidateId", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Vote.countDocuments();

    // Format votes without exposing userId (privacy)
    const formattedVotes = votes.map((vote) => ({
      _id: vote._id,
      electionTitle: vote.electionId?.title || "Unknown",
      candidateName: vote.candidateId?.name || "Unknown",
      timestamp: vote.createdAt,
    }));

    res.status(200).json({
      success: true,
      count: formattedVotes.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: formattedVotes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get public results for a closed election
 * GET /api/results/:slug
 */
const getPublicResults = async (req, res, next) => {
  try {
    const election = await Election.findOne({ slug: req.params.slug });

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    // Check if election is closed
    if (election.status !== "Closed") {
      return res.status(403).json({
        success: false,
        message: "Results are not yet available. Election must be closed.",
      });
    }

    // Get candidates with vote counts
    const candidates = await Candidate.find({ electionId: election._id }).sort({
      voteCount: -1,
    });

    // Calculate total votes and percentages
    const totalVotes = candidates.reduce((sum, c) => sum + c.voteCount, 0);

    const candidatesWithPercentages = candidates.map((c) => ({
      name: c.name,
      description: c.description,
      imageUrl: c.imageUrl,
      voteCount: c.voteCount,
      percentage:
        totalVotes > 0 ? ((c.voteCount / totalVotes) * 100).toFixed(2) : 0,
    }));

    res.status(200).json({
      success: true,
      data: {
        election: {
          title: election.title,
          slug: election.slug,
          electionType: election.electionType,
          startDate: election.startDate,
          endDate: election.endDate,
        },
        candidates: candidatesWithPercentages,
        totalVotes,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminResults,
  getAdminResultsByElection,
  getVoteLog,
  getPublicResults,
};
