// This script fixes the Supabase client reference issue
// Add this to the end of woodcalc-crm.js

// Function to fix the saveCalculation function
function fixSaveCalculation() {
  // Replace the original saveCalculation function with a fixed version
  window.saveCalculation = async function(calculationData) {
    try {
      console.log('Saving calculation with fixed function...');
      
      // Make sure we have a Supabase client
      if (!crmSupabase) {
        crmSupabase = initCrmSupabase();
        if (!crmSupabase) {
          throw new Error('No Supabase client available');
        }
      }
      
      // Make sure we have a customer ID
      if (!currentCustomerId) {
        // Try to get customer ID from multiple sources
        currentCustomerId = window.currentCustomerId;
        
        // If still no ID, try to get it from the UI
        if (!currentCustomerId) {
          const customerIdElement = document.getElementById('calculator-customer-id');
          if (customerIdElement && customerIdElement.textContent && customerIdElement.textContent !== 'N/A') {
            currentCustomerId = customerIdElement.textContent.trim();
            console.log('Using customer ID from UI:', currentCustomerId);
          }
        }
        
        // If still no ID, check URL parameters
        if (!currentCustomerId) {
          const urlParams = new URLSearchParams(window.location.search);
          currentCustomerId = urlParams.get('customerId') || urlParams.get('customer_id');
          if (currentCustomerId) {
            console.log('Using customer ID from URL parameters:', currentCustomerId);
          }
        }
        
        // If we still don't have a valid ID, we can't proceed with saving
        if (!currentCustomerId) {
          throw new Error('No valid customer ID found. Cannot save calculation without a customer ID.');
        }
      }
      
      console.log('Customer ID for save:', currentCustomerId);
      
      // Extract data from the calculation
      const {
        totalLength,
        postSpacing,
        postCount,
        railCount,
        picketCount,
        grandTotal,
        itemData,
        fenceHeight
      } = calculationData;
      
      // We don't need to get calculation data from lastCalculationResult again
      // as we already have it from calculationData
      
      // Get the total project cost with 20% profit if available
      const totalProjectCost = window.lastLaborCalculation?.totalCost20 || grandTotal || 0;
      
      console.log('Total project cost with 20% profit for saving:', totalProjectCost);
      console.log('Materials cost (not being saved):', grandTotal);
      const calculationDate = new Date().toISOString();
      const notes = `Fence calculation: ${fenceHeight}ft height, ${totalLength}ft length, ${postSpacing}ft post spacing`;
      
      // Try API endpoint
      try {
        const calcResponse = await fetch('/api/save-calculation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerId: currentCustomerId,
            totalLength,
            postSpacing,
            postCount,
            railCount,
            picketCount,
            totalCost: grandTotal,
            notes,
            itemData,
            calculationDate
          })
        });
        
        if (calcResponse.ok) {
          calcResult = await calcResponse.json();
          console.log('Calculation saved via API:', calcResult);
        } else {
          throw new Error('API endpoint failed');
        }
      } catch (apiError) {
        console.warn('API save failed, trying direct Supabase:', apiError);
        
        // If API fails, try direct Supabase connection
        if (crmSupabase) {
          console.log('Saving calculation via direct Supabase connection');
          
          // Process material line items to save in the material_items JSONB column
          const materialItems = [];
          
          if (itemData && Object.keys(itemData).length > 0) {
            for (const [itemNumber, item] of Object.entries(itemData)) {
              // Only save items with quantity > 0
              if (item.qty > 0) {
                materialItems.push({
                  item_number: parseInt(itemNumber),
                  item_name: item.item,
                  description: item.description,
                  quantity: item.qty,
                  unit_cost: item.unitCost,
                  total_cost: item.totalCost
                });
                
                console.log(`Adding material line item: ${item.item}, Qty: ${item.qty}, Cost: $${item.totalCost}`);
              }
            }
          }
          
          console.log(`Saving ${materialItems.length} material line items to wood_calculator table`);
          
          // Ensure we have valid data - use columns that exist in the wood_calculator table
          const calculationRecord = {
            customer_id: currentCustomerId,
            total_length: totalLength || 0,
            post_spacing: postSpacing || 0,
            post_count: postCount || 0,
            rail_count: railCount || 0,
            picket_count: picketCount || 0,
            total_cost: totalProjectCost || 0, // Use total project cost (includes labor if available)
            material_items: materialItems, // Save material line items as JSONB
            notes
          };
          
          console.log('Saving calculation record:', calculationRecord);
          
          const { data, error } = await crmSupabase
            .from('wood_calculator')
            .insert([calculationRecord])
            .select()
            .single();
          
          if (error) {
            console.error('Error saving calculation:', error);
            throw error;
          }
          
          calcResult = data;
          console.log('Calculation saved via Supabase:', calcResult);
          
          // No longer saving individual line items to calculation_items table per user request
          console.log('Skipping line items saving - only saving total project cost to wood_calculator table');
          
        } else {
          throw new Error('Failed to save calculation - no database connection available');
        }
      }
      
      alert('Calculation saved successfully!');
      return calcResult || { id: 'local-' + Date.now(), success: true };
    } catch (error) {
      console.error('Error saving calculation:', error);
      alert(`Error: ${error.message}`);
      throw error;
    }
  };
  
  console.log('SaveCalculation function fixed and replaced');
}

// Apply the fix when the page is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('Applying Supabase client fix...');
  fixSaveCalculation();
});

// Also try to apply it immediately
fixSaveCalculation();
