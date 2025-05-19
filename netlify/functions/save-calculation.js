const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { 
      customerId,
      totalLength,
      postSpacing,
      postCount,
      railCount,
      picketCount,
      totalCost,
      notes
    } = JSON.parse(event.body);

    // Save calculation to database
    const { data, error } = await supabase
      .from('wood_calculator')
      .insert([{
        customer_id: customerId,
        total_length: totalLength,
        post_spacing: postSpacing,
        post_count: postCount,
        rail_count: railCount,
        picket_count: picketCount,
        total_cost: totalCost,
        notes
      }])
      .select()
      .single();

    if (error) throw error;

    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('Error saving calculation:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to save calculation' })
    };
  }
};
