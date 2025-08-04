// debug-env.js - Run this to check your environment variables
require('dotenv').config();

console.log('=== ENVIRONMENT VARIABLES DEBUG ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET ✓' : 'MISSING ✗');
console.log('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? 'SET ✓' : 'MISSING ✗');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET ✓' : 'MISSING ✗');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);

if (process.env.SUPABASE_URL) {
  console.log('Supabase URL Preview:', process.env.SUPABASE_URL.substring(0, 20) + '...');
}

if (process.env.SUPABASE_SERVICE_KEY) {
  console.log('Service Key Preview:', process.env.SUPABASE_SERVICE_KEY.substring(0, 20) + '...');
}

console.log('=== TESTING SUPABASE CONFIG ===');
try {
  const supabase = require('./config/supabase');
  console.log('Supabase client type:', typeof supabase);
  console.log('Has .from method:', typeof supabase.from === 'function' ? 'YES ✓' : 'NO ✗');
  
  if (typeof supabase.from === 'function') {
    const query = supabase.from('test');
    console.log('Query builder type:', typeof query);
    console.log('Has .select method:', typeof query.select === 'function' ? 'YES ✓' : 'NO ✗');
    
    if (typeof query.select === 'function') {
      const selectQuery = query.select('*');
      console.log('Select query type:', typeof selectQuery);
      console.log('Has .or method:', typeof selectQuery.or === 'function' ? 'YES ✓' : 'NO ✗');
    }
  }
} catch (error) {
  console.error('Supabase config error:', error.message);
}

console.log('=== DEBUG COMPLETE ===');