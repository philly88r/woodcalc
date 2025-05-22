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
    // Get token from query parameters or request body
    let token;
    
    if (event.httpMethod === 'GET') {
      token = event.queryStringParameters?.token;
    } else {
      const body = JSON.parse(event.body);
      token = body.token;
    }

    if (!token) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Token is required' })
      };
    }

    // Check if token exists and is valid
    const { data: accessToken, error: tokenError } = await supabase
      .from('access_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (tokenError || !accessToken) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Invalid or expired token' })
      };
    }

    // Check if token is expired
    const expiresAt = new Date(accessToken.expires_at);
    const now = new Date();
    
    if (now > expiresAt) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Token has expired' })
      };
    }

    // Get customer details
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', accessToken.customer_id)
      .single();

    if (customerError || !customer) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Customer not found' })
      };
    }

    // Update last used timestamp
    await supabase
      .from('access_tokens')
      .update({ last_used_at: new Date().toISOString() })
      .eq('token', token);

    return {
      statusCode: 200,
      body: JSON.stringify({
        valid: true,
        customer: customer,
        expires_at: accessToken.expires_at
      })
    };
  } catch (error) {
    console.error('Error validating token:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to validate token' })
    };
  }
};
