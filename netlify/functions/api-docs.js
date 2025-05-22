exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html',
    },
    body: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Wood Calculator API Documentation</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 { color: #2563EB; }
    h2 { color: #1E40AF; margin-top: 30px; }
    code {
      background-color: #f1f5f9;
      padding: 2px 5px;
      border-radius: 3px;
      font-family: monospace;
    }
    pre {
      background-color: #f1f5f9;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
    }
    .endpoint {
      background-color: #e0f2fe;
      border-left: 4px solid #0284c7;
      padding: 15px;
      margin: 20px 0;
      border-radius: 0 5px 5px 0;
    }
    .method {
      font-weight: bold;
      color: #0284c7;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px 12px;
      text-align: left;
    }
    th {
      background-color: #f1f5f9;
    }
  </style>
</head>
<body>
  <h1>Wood Calculator API Documentation</h1>
  
  <p>This documentation describes the API endpoints available for integrating the Wood Calculator with your CRM system.</p>
  
  <h2>Authentication</h2>
  
  <p>The Wood Calculator uses a token-based authentication system to securely link customers to the calculator.</p>
  
  <div class="endpoint">
    <p><span class="method">POST</span> <code>/api/generate-access-token</code></p>
    <p>Generate a secure access token for a customer.</p>
    
    <h3>Request Body</h3>
    <pre>{
  "customerId": "uuid-of-customer"
}</pre>
    
    <h3>Response</h3>
    <pre>{
  "token": "generated-secure-token",
  "customer": {
    "id": "uuid-of-customer",
    "name": "Customer Name",
    ...
  },
  "expires_at": "2025-05-29T13:21:56.000Z",
  "calculator_url": "https://woodcalc-app.herokuapp.com/?token=generated-secure-token"
}</pre>
  </div>
  
  <h2>Integration Example</h2>
  
  <p>To integrate the Wood Calculator with your CRM system:</p>
  
  <ol>
    <li>
      <p>Generate a token for your customer:</p>
      <pre>fetch('https://wood-fence-calculator.windsurf.build/api/generate-access-token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    customerId: 'your-customer-uuid'
  })
})
.then(response => response.json())
.then(data => {
  // Redirect to the calculator URL or create a link
  const calculatorUrl = data.calculator_url;
  
  // Example: Create a link
  const link = document.createElement('a');
  link.href = calculatorUrl;
  link.textContent = 'Open Wood Calculator';
  document.getElementById('calculator-container').appendChild(link);
});</pre>
    </li>
    <li>
      <p>The customer can then click the link to open the calculator, which will automatically be associated with their account.</p>
    </li>
    <li>
      <p>When calculations are saved, they will be linked to the customer's account in the database.</p>
    </li>
  </ol>
  
  <h2>Token Validation</h2>
  
  <div class="endpoint">
    <p><span class="method">GET</span> <code>/api/validate-token?token=your-token</code></p>
    <p>Validate a token and get the associated customer.</p>
    
    <h3>Response</h3>
    <pre>{
  "valid": true,
  "customer": {
    "id": "uuid-of-customer",
    "name": "Customer Name",
    ...
  },
  "expires_at": "2025-05-29T13:21:56.000Z"
}</pre>
  </div>
  
  <h2>Security Considerations</h2>
  
  <ul>
    <li>Tokens are valid for 7 days from creation.</li>
    <li>Each token is uniquely tied to a specific customer.</li>
    <li>Tokens can be revoked if needed by updating the database.</li>
    <li>The system uses secure random token generation to prevent guessing.</li>
  </ul>
  
  <p>For any questions or support, please contact the development team.</p>
</body>
</html>
    `
  };
};
