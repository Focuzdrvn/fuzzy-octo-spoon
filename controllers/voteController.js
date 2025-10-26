const mongoose = require("mongoose");
const Election = require("../models/Election");
const Candidate = require("../models/Candidate");
const Vote = require("../models/Vote");
const {
  validateSingleVote,
  validateMultipleVote,
} = require("../utils/validators");

/**
 * Get all active elections
 * GET /api/elections
 */
const getActiveElections = async (req, res, next) => {
  try {
    const elections = await Election.find({ status: "Active" }).sort({
      startDate: -1,
    });

    res.status(200).json({
      success: true,
      count: elections.length,
      data: elections,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get election by slug with candidates and vote status
 * GET /api/elections/:slug
 */
const getElectionBySlug = async (req, res, next) => {
  try {
    const election = await Election.findOne({ slug: req.params.slug });

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    // Get candidates for this election
    const candidates = await Candidate.find({ electionId: election._id }).sort({
      name: 1,
    });

    // Check if user has already voted
    const existingVote = await Vote.findOne({
      userId: req.user.id,
      electionId: election._id,
    });

    res.status(200).json({
      success: true,
      data: {
        election,
        candidates,
        hasVoted: !!existingVote,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cast vote (SingleChoice or MultipleChoice)
 * POST /api/vote
 */
const castVote = async (req, res, next) => {
  // Start a session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user.id;
    const { electionId, candidateId, candidateIds } = req.body;

    // Find the election
    const election = await Election.findById(electionId).session(session);

    if (!election) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    // CHECK 1: Verify election is active and within time window
    const now = new Date();
    if (
      election.status !== "Active" ||
      now < election.startDate ||
      now > election.endDate
    ) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Voting is closed for this election",
      });
    }

    // CHECK 2: Verify user hasn't already voted
    const existingVote = await Vote.findOne({
      userId,
      electionId,
    }).session(session);

    if (existingVote) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        success: false,
        message: "You have already voted in this election",
      });
    }

    // Handle based on election type
    if (election.electionType === "SingleChoice") {
      // Validate single choice vote
      const { error } = validateSingleVote({ electionId, candidateId });
      if (error) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: error.details[0].message,
        });
      }

      // Verify candidate exists and belongs to this election
      const candidate = await Candidate.findOne({
        _id: candidateId,
        electionId,
      }).session(session);

      if (!candidate) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          success: false,
          message: "Candidate not found",
        });
      }

      // Create vote record
      await Vote.create(
        [
          {
            userId,
            electionId,
            candidateId,
          },
        ],
        { session }
      );

      // Atomically increment vote count
      await Candidate.updateOne(
        { _id: candidateId },
        { $inc: { voteCount: 1 } },
        { session }
      );
    } else if (election.electionType === "MultipleChoice") {
      // Validate multiple choice vote
      const { error } = validateMultipleVote({ electionId, candidateIds });
      if (error) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: error.details[0].message,
        });
      }

      // CHECK 3: Verify number of selections doesn't exceed maxVotes
      if (candidateIds.length > election.maxVotes) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `You can only vote for up to ${election.maxVotes} candidate(s)`,
        });
      }

      // Verify all candidates exist and belong to this election
      const candidates = await Candidate.find({
        _id: { $in: candidateIds },
        electionId,
      }).session(session);

      if (candidates.length !== candidateIds.length) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          success: false,
          message: "One or more candidates not found",
        });
      }

      // Create vote records for each candidate
      const voteRecords = candidateIds.map((cId) => ({
        userId,
        electionId,
        candidateId: cId,
      }));

      await Vote.insertMany(voteRecords, { session });

      // Atomically increment vote count for each candidate
      for (const cId of candidateIds) {
        await Candidate.updateOne(
          { _id: cId },
          { $inc: { voteCount: 1 } },
          { session }
        );
      }
    } else {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Invalid election type",
      });
    }

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "Vote cast successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

module.exports = {
  getActiveElections,
  getElectionBySlug,
  castVote,
};
