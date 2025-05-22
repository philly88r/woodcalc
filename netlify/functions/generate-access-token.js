const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to generate a secure token
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { customerId } = JSON.parse(event.body);

    if (!customerId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Customer ID is required' })
      };
    }

    // Check if customer exists
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id, name')
      .eq('id', customerId)
      .single();

    if (customerError || !customer) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Customer not found' })
      };
    }

    // Generate a unique token
    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Token valid for 7 days

    // Store token in database
    const { data: accessToken, error: tokenError } = await supabase
      .from('access_tokens')
      .insert([{
        token,
        customer_id: customerId,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (tokenError) {
      console.error('Error creating token:', tokenError);
      
      // Check if the access_tokens table doesn't exist yet
      if (tokenError.code === '42P01') { // undefined_table
        // Create the table
        await supabase.rpc('create_access_tokens_table');
        
        // Try inserting again
        const { data: retryToken, error: retryError } = await supabase
          .from('access_tokens')
          .insert([{
            token,
            customer_id: customerId,
            expires_at: expiresAt.toISOString(),
            created_at: new Date().toISOString()
          }])
          .select()
          .single();
          
        if (retryError) throw retryError;
        
        return {
          statusCode: 200,
          body: JSON.stringify({
            token,
            customer: customer,
            expires_at: expiresAt.toISOString(),
            calculator_url: `${process.env.APP_URL || 'https://woodcalc-app.herokuapp.com'}/?token=${token}`
          })
        };
      }
      
      throw tokenError;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        token,
        customer: customer,
        expires_at: expiresAt.toISOString(),
        calculator_url: `${process.env.APP_URL || 'https://woodcalc-app.herokuapp.com'}/?token=${token}`
      })
    };
  } catch (error) {
    console.error('Error generating token:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate access token' })
    };
  }
};
