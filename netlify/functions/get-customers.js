const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event, context) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const customerId = event.queryStringParameters?.id;

    // If ID is provided, fetch specific customer
    if (customerId) {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();

      if (error) throw error;

      return {
        statusCode: 200,
        body: JSON.stringify(data)
      };
    }
    // Get search term from query parameters
    const searchTerm = event.queryStringParameters?.search || '';
    
    // Make the API request to your CRM
    // Uncomment this section when ready to connect to your CRM
    /*
    const response = await axios({
      method: 'get',
      url: `${CRM_CONFIG.apiUrl}${CRM_CONFIG.customersEndpoint}`,
      params: {
        search: searchTerm,
        // Add any additional parameters your CRM requires
      },
      headers: {
        'Authorization': `Bearer ${CRM_CONFIG.apiKey}`
      }
    });

    // Return the CRM's response
    // Adjust this mapping based on your CRM's response structure
    const customers = response.data.map ? response.data.map(customer => ({
      id: customer.id,
      name: customer.name || `${customer.first_name} ${customer.last_name}`,
      email: customer.email,
      phone: customer.phone || customer.phone_number
    })) : response.data;

    return {
      statusCode: 200,
      body: JSON.stringify({ customers })
    };
    */

    // For testing/demo purposes, return mock data
    const mockCustomers = [
      { id: 1, name: 'John Doe', email: 'john@example.com', phone: '555-123-4567' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '555-987-6543' },
      { id: 3, name: 'Bob Johnson', email: 'bob@example.com', phone: '555-456-7890' }
    ];
    
    // Filter mock customers if search term is provided
    const filteredCustomers = searchTerm 
      ? mockCustomers.filter(customer => 
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.phone.includes(searchTerm)
        )
      : mockCustomers;
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        customers: filteredCustomers
      })
    };

  } catch (error) {
    console.error('Error fetching customers from CRM:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: 'Failed to fetch customers from CRM',
        error: error.message
      })
    };
  }
};
