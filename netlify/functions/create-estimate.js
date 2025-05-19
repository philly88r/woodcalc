const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to generate estimate number
function generateEstimateNumber() {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `EST-${year}${month}-${random}`;
}

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { 
      customerId,
      calculatorId,
      totalAmount,
      notes
    } = JSON.parse(event.body);

    // Create the estimate
    const { data: estimate, error: estimateError } = await supabase
      .from('estimates')
      .insert([{
        customer_id: customerId,
        calculator_id: calculatorId,
        estimate_number: generateEstimateNumber(),
        total_amount: totalAmount,
        notes: notes,
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Valid for 30 days
      }])
      .select()
      .single();

    if (estimateError) throw estimateError;

    // Get the CRM URL from environment variable
    const crmUrl = process.env.CRM_URL || 'https://your-crm-url.com';
    const estimateUrl = `${crmUrl}/estimates/${estimate.id}`;

    return {
      statusCode: 200,
      body: JSON.stringify({
        estimate,
        redirectUrl: estimateUrl
      })
    };
  } catch (error) {
    console.error('Error creating estimate:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create estimate' })
    };
  }
};
