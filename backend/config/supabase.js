// backend/config/supabase.js
const { createClient } = require('@supabase/supabase-js');

// Validate environment variables
if (!process.env.SUPABASE_URL) {
  console.error('❌ SUPABASE_URL is required');
  process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_KEY is required');
  process.exit(1);
}

// Log environment status
console.log('🔧 Supabase Configuration:');
console.log(`   URL: ${process.env.SUPABASE_URL}`);
console.log(`   Service Key: ${process.env.SUPABASE_SERVICE_KEY ? 'Set (' + process.env.SUPABASE_SERVICE_KEY.substring(0, 20) + '...)' : 'Missing'}`);

// Create Supabase client with service role key for backend operations
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Simple connection test function (optional, doesn't run automatically)
const testConnection = async () => {
  try {
    console.log('🧪 Testing Supabase connection...');
    
    // Test with your specific project table
    const { data, error } = await supabase
      .from('projects')
      .select('id, title')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection test failed:', error.message);
      console.error('   This might be normal if you don\'t have a projects table yet');
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    if (data && data.length > 0) {
      console.log(`   Found ${data.length} project(s) in database`);
    }
    return true;
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    return false;
  }
};

// Export the client and test function
module.exports = supabase;
module.exports.testConnection = testConnection;

// Only run connection test in development and if explicitly requested
if (process.env.NODE_ENV === 'development' && process.env.TEST_SUPABASE_CONNECTION === 'true') {
  testConnection().catch(console.error);
}