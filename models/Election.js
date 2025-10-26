const mongoose = require("mongoose");

const electionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: false,
      unique: true,
    },
    status: {
      type: String,
      enum: ["Draft", "Active", "Closed"],
      default: "Draft",
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    electionType: {
      type: String,
      enum: ["SingleChoice", "MultipleChoice"],
      required: true,
      default: "SingleChoice",
    },
    maxVotes: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to auto-generate slug from title if not provided
electionSchema.pre("save", function (next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

// Indexes for high-traffic queries (2000+ concurrent users)
electionSchema.index({ slug: 1 }); // Unique index already set in schema
electionSchema.index({ status: 1, startDate: 1, endDate: 1 }); // Compound index for active elections query
electionSchema.index({ status: 1 }); // Index for status-based queries
electionSchema.index({ createdAt: -1 }); // Index for sorting by creation date

module.exports = mongoose.model("Election", electionSchema);
