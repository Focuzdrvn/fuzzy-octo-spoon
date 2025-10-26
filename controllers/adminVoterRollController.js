const VoterRoll = require("../models/VoterRoll");
const { validateVoterRollEmail } = require("../utils/validators");

/**
 * Add voter email(s) to the roll
 * POST /api/admin/voterroll
 */
const addVoterEmail = async (req, res, next) => {
  try {
    const { email, emails } = req.body;

    // Support both single email and bulk array
    if (emails && Array.isArray(emails)) {
      // Bulk add
      const voterDocs = emails.map((e) => ({ email: e.toLowerCase().trim() }));

      try {
        const result = await VoterRoll.insertMany(voterDocs, {
          ordered: false,
        });

        res.status(201).json({
          success: true,
          message: `${result.length} voter(s) added successfully`,
          count: result.length,
        });
      } catch (error) {
        // Handle duplicate errors in bulk insert
        if (error.code === 11000) {
          const insertedCount = error.insertedDocs
            ? error.insertedDocs.length
            : 0;
          return res.status(200).json({
            success: true,
            message: `${insertedCount} voter(s) added (duplicates skipped)`,
            count: insertedCount,
          });
        }
        throw error;
      }
    } else if (email) {
      // Single add
      const { error } = validateVoterRollEmail({ email });
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message,
        });
      }

      const voterEntry = await VoterRoll.create({
        email: email.toLowerCase().trim(),
      });

      res.status(201).json({
        success: true,
        message: "Voter added successfully",
        data: voterEntry,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Please provide email or emails array",
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Get all voters (paginated)
 * GET /api/admin/voterroll
 */
const getAllVoters = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const voters = await VoterRoll.find()
      .sort({ email: 1 })
      .skip(skip)
      .limit(limit);

    const total = await VoterRoll.countDocuments();

    res.status(200).json({
      success: true,
      count: voters.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: voters,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a voter email from the roll
 * DELETE /api/admin/voterroll
 */
const deleteVoterEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const result = await VoterRoll.findOneAndDelete({
      email: email.toLowerCase().trim(),
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Voter not found in roll",
      });
    }

    res.status(200).json({
      success: true,
      message: "Voter removed successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addVoterEmail,
  getAllVoters,
  deleteVoterEmail,
};
