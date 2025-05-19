// Netlify serverless function to save data to CRM
const axios = require('axios');

// CRM API configuration from environment variables
const CRM_CONFIG = {
  apiUrl: process.env.CRM_API_URL,
  apiKey: process.env.CRM_API_KEY,
  saveQuoteEndpoint: process.env.CRM_SAVE_QUOTE_ENDPOINT || '/quotes',
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
    const data = JSON.parse(event.body);
    const { customerInfo, fenceDetails, calculationResults, grandTotal } = data;
    
    // Validate required data
    if (!customerInfo || !calculationResults) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required data' })
      };
    }

    // Format data for your CRM API
    // This will vary based on your CRM's API requirements
    const crmData = {
      customer: {
        id: customerInfo.id,
        name: customerInfo.name,
        email: customerInfo.email,
        phone: customerInfo.phone
      },
      quote: {
        type: 'fence',
        details: fenceDetails,
        items: calculationResults,
        total: grandTotal,
        date: new Date().toISOString()
      }
    };

    // Make the API request to your CRM
    // Uncomment this section when ready to connect to your CRM
    /*
    const response = await axios({
      method: 'post',
      url: `${CRM_CONFIG.apiUrl}${CRM_CONFIG.saveQuoteEndpoint}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CRM_CONFIG.apiKey}`
      },
      data: crmData
    });

    // Return the CRM's response
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Quote saved to CRM successfully',
        quoteId: response.data.id
      })
    };
    */

    // For testing/demo purposes, just log and return success
    console.log('Data received for CRM:', crmData);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Quote saved to CRM successfully',
        quoteId: 'demo-' + Date.now()
      })
    };

  } catch (error) {
    console.error('Error saving to CRM:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: 'Failed to save quote to CRM',
        error: error.message
      })
    };
  }
};
