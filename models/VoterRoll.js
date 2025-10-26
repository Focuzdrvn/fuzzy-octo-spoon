const mongoose = require("mongoose");

const voterRollSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Note: Email index is automatically created by unique: true above
// No need for explicit voterRollSchema.index({ email: 1 });

module.exports = mongoose.model("VoterRoll", voterRollSchema);
