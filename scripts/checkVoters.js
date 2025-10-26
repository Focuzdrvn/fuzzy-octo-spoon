const mongoose = require("mongoose");
const VoterRoll = require("../models/VoterRoll");
require("dotenv").config();

const checkVoters = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const voters = await VoterRoll.find();
    console.log(`\nRegistered voters: ${voters.length}`);
    voters.forEach((v) => {
      console.log(`  - ${v.email} (${v.name})`);
    });

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

checkVoters();
