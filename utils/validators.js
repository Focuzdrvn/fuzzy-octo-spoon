const Joi = require("joi");

// Validate Google OAuth callback
const validateGoogleCallback = (data) => {
  const schema = Joi.object({
    supabaseToken: Joi.string().required(),
  });
  return schema.validate(data);
};

// Validate admin login
const validateAdminLogin = (data) => {
  const schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
  });
  return schema.validate(data);
};

// Validate election data
const validateElection = (data) => {
  const schema = Joi.object({
    title: Joi.string().required(),
    slug: Joi.string().optional(),
    status: Joi.string().valid("Draft", "Active", "Closed").optional(),
    startDate: Joi.date().required(),
    endDate: Joi.date().greater(Joi.ref("startDate")).required(),
    electionType: Joi.string()
      .valid("SingleChoice", "MultipleChoice")
      .required(),
    maxVotes: Joi.number().min(1).optional(),
  });
  return schema.validate(data);
};

// Validate candidate data
const validateCandidate = (data) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().optional().allow(""),
    imageUrl: Joi.string().uri().optional().allow(""),
    electionId: Joi.string().required(),
  }).unknown(true); // Allow unknown fields like 'image' from FormData
  return schema.validate(data);
};

// Validate voter roll email
const validateVoterRollEmail = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    emails: Joi.array().items(Joi.string().email()).optional(),
  });
  return schema.validate(data);
};

// Validate single choice vote
const validateSingleVote = (data) => {
  const schema = Joi.object({
    electionId: Joi.string().required(),
    candidateId: Joi.string().required(),
  });
  return schema.validate(data);
};

// Validate multiple choice vote
const validateMultipleVote = (data) => {
  const schema = Joi.object({
    electionId: Joi.string().required(),
    candidateIds: Joi.array().items(Joi.string()).min(1).required(),
  });
  return schema.validate(data);
};

module.exports = {
  validateGoogleCallback,
  validateAdminLogin,
  validateElection,
  validateCandidate,
  validateVoterRollEmail,
  validateSingleVote,
  validateMultipleVote,
};
