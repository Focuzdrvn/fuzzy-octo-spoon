const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Verify Supabase JWT token
 * @param {string} token - The JWT token from Supabase
 * @returns {Promise<object>} - User data from token
 */
const verifySupabaseToken = async (token) => {
  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error) {
      throw new Error("Invalid Supabase token");
    }

    return data.user;
  } catch (error) {
    throw new Error("Token verification failed");
  }
};

module.exports = { supabase, verifySupabaseToken };
