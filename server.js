const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

// Add middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the current directory
app.use(express.static(__dirname));

// API endpoint to save calculation results to CRM
app.post('/api/save-to-crm', async (req, res) => {
  try {
    // Extract data from request body
    const { 
      customerInfo,  // Customer details
      fenceDetails,  // Fence specifications
      calculationResults, // Materials and costs
      grandTotal     // Total cost
    } = req.body;
    
    // TODO: Replace with your actual CRM database connection
    // This is where you would connect to your CRM database
    // Example using a generic database client:
    /*
    const db = require('./db-connector'); // Create this file with your DB connection
    
    // Save to your CRM database
    const result = await db.query(
      'INSERT INTO fence_quotes (customer_id, customer_name, fence_details, materials_json, total_cost, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [
        customerInfo.id || null,
        customerInfo.name,
        JSON.stringify(fenceDetails),
        JSON.stringify(calculationResults),
        grandTotal
      ]
    );
    */
    
    // For now, just log the data and return success
    console.log('Data received for CRM:', req.body);
    
    res.status(200).json({
      success: true,
      message: 'Quote saved to CRM successfully',
      // quoteId: result.insertId  // Uncomment when using actual DB
    });
  } catch (error) {
    console.error('Error saving to CRM:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save quote to CRM',
      error: error.message
    });
  }
});

// For all other routes, serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
