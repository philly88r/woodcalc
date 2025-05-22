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
      notes,
      itemData, // Detailed line items
      calculationDate
    } = JSON.parse(event.body);

    // Save calculation summary to database
    const { data, error } = await supabase
      .from('wood_calculator')
      .insert([{
        customer_id: customerId,
        total_length: totalLength || 0,
        post_spacing: postSpacing || 0,
        post_count: postCount || 0,
        rail_count: railCount || 0,
        picket_count: picketCount || 0,
        total_cost: totalCost || 0,
        notes
      }])
      .select()
      .single();

    if (error) throw error;
    
    // If we have detailed item data, save each line item
    if (itemData && Object.keys(itemData).length > 0) {
      const lineItems = [];
      
      for (const [itemNumber, item] of Object.entries(itemData)) {
        // Only save items with quantity > 0
        if (item.qty > 0) {
          lineItems.push({
            calculation_id: data.id,
            item_number: parseInt(itemNumber),
            item_name: item.item,
            description: item.description,
            quantity: item.qty,
            unit_cost: item.unitCost,
            total_cost: item.totalCost
          });
        }
      }
      
      if (lineItems.length > 0) {
        const { error: lineItemsError } = await supabase
          .from('calculation_items')
          .insert(lineItems);
        
        if (lineItemsError) {
          console.error('Error saving line items:', lineItemsError);
          // Continue even if line items fail - we still have the main calculation
        }
      }
    }

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
