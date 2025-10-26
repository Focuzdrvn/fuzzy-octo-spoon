/**
 * Performance Configuration for High Traffic (2000+ Concurrent Users)
 *
 * This file contains optimizations applied across the application
 * to handle large-scale voting events efficiently.
 */

module.exports = {
  // MongoDB Connection Pool Settings
  database: {
    maxPoolSize: 100, // Maximum number of connections in the pool
    minPoolSize: 10, // Minimum number of connections to maintain
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    serverSelectionTimeoutMS: 10000, // 10s timeout for server selection
    heartbeatFrequencyMS: 10000, // Check server health every 10s
  },

  // Rate Limiting Settings
  rateLimits: {
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 20, // 20 requests per window
    },
    voting: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 20, // 20 requests per window
    },
    general: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 500, // 500 requests per window
    },
  },

  // Express Body Parser Limits
  bodyParser: {
    jsonLimit: "50mb",
    urlEncodedLimit: "50mb",
    parameterLimit: 100000,
  },

  // Server Timeouts
  server: {
    keepAliveTimeout: 65000, // 65 seconds
    headersTimeout: 66000, // 66 seconds
  },

  // Database Indexes Applied
  indexes: {
    election: [
      "slug",
      "status",
      "status_startDate_endDate (compound)",
      "createdAt",
    ],
    vote: [
      "userId_electionId (compound, unique)",
      "electionId_createdAt (compound)",
      "candidateId_electionId (compound)",
    ],
    candidate: [
      "electionId_createdAt (compound)",
      "electionId_voteCount (compound)",
    ],
    user: ["email (unique)", "supabaseId (unique)"],
  },

  // Recommended Deployment Settings
  deployment: {
    nodeInstances: "Use PM2 with cluster mode: pm2 start server.js -i max",
    memory: "Minimum 2GB RAM per instance recommended",
    cpu: "Minimum 2 CPU cores recommended",
    loadBalancer: "Use Nginx or cloud load balancer for distributing traffic",
    caching: "Consider Redis for session management and caching (optional)",
    cdn: "Cloudinary CDN already configured for images",
    monitoring: "Use PM2 monitoring or cloud provider monitoring tools",
  },

  // Performance Tips
  tips: [
    "1. Run with NODE_ENV=production for optimizations",
    "2. Use PM2 cluster mode to utilize all CPU cores",
    "3. Enable compression middleware for API responses",
    "4. Monitor MongoDB connection pool usage",
    "5. Set up MongoDB replica set for high availability",
    "6. Use database read replicas for read-heavy operations",
    "7. Implement API response caching for election data",
    "8. Enable gzip compression on reverse proxy (Nginx)",
    "9. Use CDN for static assets",
    "10. Monitor and log slow queries (>100ms)",
  ],
};
