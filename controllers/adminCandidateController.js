const Candidate = require("../models/Candidate");
const Election = require("../models/Election");
const { validateCandidate } = require("../utils/validators");
const cloudinary = require("../config/cloudinary");

/**
 * Create a new candidate
 * POST /api/admin/candidates
 */
const createCandidate = async (req, res, next) => {
  try {
    // Validate request body
    const { error } = validateCandidate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    // Check if election exists
    const election = await Election.findById(req.body.electionId);
    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    // Add image URL if file was uploaded
    if (req.file) {
      req.body.imageUrl = req.file.path;
    }

    const candidate = await Candidate.create(req.body);

    res.status(201).json({
      success: true,
      data: candidate,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all candidates for an election
 * GET /api/admin/candidates/:electionId
 */
const getCandidatesByElection = async (req, res, next) => {
  try {
    const candidates = await Candidate.find({
      electionId: req.params.electionId,
    }).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: candidates.length,
      data: candidates,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a candidate
 * PUT /api/admin/candidates/:id
 */
const updateCandidate = async (req, res, next) => {
  try {
    const candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    // Validate update data (partial validation)
    const allowedUpdates = ["name", "description", "imageUrl"];
    const updates = {};

    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Add new image URL if file was uploaded
    if (req.file) {
      updates.imageUrl = req.file.path;

      // Delete old image from Cloudinary if exists
      if (candidate.imageUrl) {
        const publicId = candidate.imageUrl
          .split("/")
          .slice(-2)
          .join("/")
          .split(".")[0];
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error("Error deleting old image:", err);
        }
      }
    }

    const updatedCandidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedCandidate,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a candidate
 * DELETE /api/admin/candidates/:id
 */
const deleteCandidate = async (req, res, next) => {
  try {
    const candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    // Delete image from Cloudinary if exists
    if (candidate.imageUrl) {
      const publicId = candidate.imageUrl
        .split("/")
        .slice(-2)
        .join("/")
        .split(".")[0];
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error("Error deleting image:", err);
      }
    }

    await Candidate.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Candidate deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCandidate,
  getCandidatesByElection,
  updateCandidate,
  deleteCandidate,
};
