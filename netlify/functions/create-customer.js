// Netlify serverless function to create a new customer in CRM
const axios = require('axios');

// CRM API configuration from environment variables
const CRM_CONFIG = {
  apiUrl: process.env.CRM_API_URL,
  apiKey: process.env.CRM_API_KEY,
  createCustomerEndpoint: process.env.CRM_CREATE_CUSTOMER_ENDPOINT || '/customers',
  // Add any other configuration needed for your CRM
};

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse the incoming request body
    const customerData = JSON.parse(event.body);
    
    // Validate required data
    if (!customerData.name || !customerData.email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Name and email are required' })
      };
    }

    // Make the API request to your CRM
    // Uncomment this section when ready to connect to your CRM
    /*
    // Format data for your specific CRM if needed
    const formattedCustomerData = {
      // Map fields based on your CRM's expected format
      // This is just an example - adjust according to your CRM's requirements
      first_name: customerData.name.split(' ')[0],
      last_name: customerData.name.split(' ').slice(1).join(' ') || '',
      email: customerData.email,
      phone: customerData.phone,
      address: customerData.address,
      city: customerData.city,
      state: customerData.state,
      postal_code: customerData.zip
    };

    const response = await axios({
      method: 'post',
      url: `${CRM_CONFIG.apiUrl}${CRM_CONFIG.createCustomerEndpoint}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CRM_CONFIG.apiKey}`
      },
      data: formattedCustomerData
    });

    // Map the response to the expected format
    // Adjust this mapping based on your CRM's response structure
    const newCustomer = {
      id: response.data.id,
      name: customerData.name,
      email: customerData.email,
      phone: customerData.phone
    };

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Customer created successfully',
        customer: newCustomer
      })
    };
    */

    // For testing/demo purposes, just log and return success
    console.log('New customer data:', customerData);
    
    // Create a mock response with an ID
    const newCustomer = {
      id: Date.now(), // Simulated ID
      ...customerData
    };
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Customer created successfully',
        customer: newCustomer
      })
    };

  } catch (error) {
    console.error('Error creating customer in CRM:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: 'Failed to create customer in CRM',
        error: error.message
      })
    };
  }
};
