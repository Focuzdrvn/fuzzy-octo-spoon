const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Optimized MongoDB connection settings for high traffic (2000+ concurrent users)
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 100, // Maximum number of connections (increased from default 10)
      minPoolSize: 10, // Minimum number of connections to maintain
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      serverSelectionTimeoutMS: 10000, // Timeout for selecting a server
      heartbeatFrequencyMS: 10000, // Check server health every 10 seconds
      retryWrites: true, // Retry failed writes
      retryReads: true, // Retry failed reads
      w: "majority", // Write concern for data consistency
      readPreference: "primaryPreferred", // Read from primary, fallback to secondary
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Connection Pool Size: maxPoolSize=100, minPoolSize=10`);

    // Monitor connection events
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected. Attempting to reconnect...");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("MongoDB reconnected successfully");
    });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
