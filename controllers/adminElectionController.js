const Election = require("../models/Election");
const Candidate = require("../models/Candidate");
const Vote = require("../models/Vote");
const { validateElection } = require("../utils/validators");

/**
 * Create a new election
 * POST /api/admin/elections
 */
const createElection = async (req, res, next) => {
  try {
    // Validate request body
    const { error } = validateElection(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const election = await Election.create(req.body);

    res.status(201).json({
      success: true,
      data: election,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all elections
 * GET /api/admin/elections
 */
const getAllElections = async (req, res, next) => {
  try {
    const elections = await Election.find().sort({ createdAt: -1 });

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
 * Update an election
 * PUT /api/admin/elections/:id
 */
const updateElection = async (req, res, next) => {
  try {
    const election = await Election.findById(req.params.id);

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    // Validate update data
    const { error } = validateElection(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const updatedElection = await Election.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedElection,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an election
 * DELETE /api/admin/elections/:id
 */
const deleteElection = async (req, res, next) => {
  try {
    const election = await Election.findById(req.params.id);

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    // Delete all associated candidates
    await Candidate.deleteMany({ electionId: req.params.id });

    // Delete all associated votes
    await Vote.deleteMany({ electionId: req.params.id });

    // Delete the election
    await Election.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Election and associated data deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createElection,
  getAllElections,
  updateElection,
  deleteElection,
};
