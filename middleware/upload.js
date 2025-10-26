const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// Configure Cloudinary storage for candidate images
const candidateStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "ecell-voting/candidates",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 400, height: 400, crop: "fill" }],
  },
});

// Configure Cloudinary storage for election images
const electionStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "ecell-voting/elections",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 800, height: 400, crop: "fill" }],
  },
});

// Create multer instances
const uploadCandidate = multer({
  storage: candidateStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

const uploadElection = multer({
  storage: electionStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

module.exports = {
  uploadCandidate,
  uploadElection,
};
