#!/usr/bin/env node

const bcrypt = require("bcryptjs");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("=== E-Cell Voting System - Admin Password Setup ===\n");

rl.question("Enter admin password: ", async (password) => {
  if (password.length < 8) {
    console.log("\n❌ Password must be at least 8 characters long");
    rl.close();
    return;
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    console.log("\n✅ Password hashed successfully!");
    console.log("\n📋 Add this to your backend/.env file:");
    console.log(`ADMIN_HASH=${hash}`);
    console.log(
      "\n⚠️  Keep this hash secure and never commit it to version control!"
    );
  } catch (error) {
    console.error("\n❌ Error generating hash:", error.message);
  }

  rl.close();
});
