const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event, context) => {
  // Allow both GET and POST requests
  if (event.httpMethod !== 'GET' && event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Get the session token from cookies or headers
    const cookies = event.headers.cookie || '';
    const authHeader = event.headers.authorization || '';
    
    let token = '';
    
    // Try to extract token from cookies
    const tokenCookie = cookies.split(';').find(c => c.trim().startsWith('supabase-auth-token='));
    if (tokenCookie) {
      token = tokenCookie.split('=')[1];
    }
    
    // If no token in cookies, try authorization header
    if (!token && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    // If we have a token, try to get the user
    if (token) {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error) throw error;
      
      if (user) {
        // Get the customer associated with this user
        const { data: customer, error: customerError } = await supabase
          .from('customers')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (customerError) throw customerError;
        
        return {
          statusCode: 200,
          body: JSON.stringify({ user, customer })
        };
      }
    }
    
    // If we're here, we couldn't identify the user
    // Try to get a default customer for testing
    const { data: defaultCustomer, error: defaultError } = await supabase
      .from('customers')
      .select('*')
      .limit(1)
      .single();
    
    if (defaultError) throw defaultError;
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Using default customer for testing',
        customer: defaultCustomer
      })
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to get current user',
        details: error.message
      })
    };
  }
};
