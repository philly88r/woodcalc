// CRM Integration for Wood Fence Calculator

// Use the global Supabase client that was initialized in the HTML
// Avoid redeclaring supabase variable
let crmSupabase = null;
if (typeof window !== 'undefined') {
    if (typeof window.supabase !== 'undefined') {
        crmSupabase = window.supabase;
        console.log('CRM using global window.supabase client');
    } else if (typeof supabaseClient !== 'undefined') {
        crmSupabase = supabaseClient;
        console.log('CRM using supabaseClient from HTML');
    } else {
        console.warn('Supabase client not available for CRM - some features may not work');
    }
}

// Global variables
let currentCustomerId = null;
let currentCustomer = null;

// Function to get customer ID using token-based authentication
async function getCustomerId() {
    console.log('Attempting to get customer ID...');
    
    // Method 1: Try to get from access token in URL
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        
        if (token) {
            console.log('Found token in URL:', token);
            
            // Validate token with server
            const response = await fetch(`/api/validate-token?token=${token}`);
            
            if (response.ok) {
                const data = await response.json();
                
                if (data.valid && data.customer && data.customer.id) {
                    console.log('Valid token, customer ID:', data.customer.id);
                    currentCustomer = data.customer;
                    
                    // Store token and customer ID for future use
                    try { 
                        localStorage.setItem('woodcalc_access_token', token);
                        localStorage.setItem('woodcalc_customer_id', data.customer.id);
                        localStorage.setItem('woodcalc_customer_name', data.customer.name || '');
                    } catch (e) {}
                    
                    return data.customer.id;
                }
            } else {
                console.error('Invalid or expired token');
            }
        }
    } catch (error) {
        console.error('Error validating token:', error);
    }
    
    // Method 2: Try to get from stored token in localStorage
    try {
        const storedToken = localStorage.getItem('woodcalc_access_token');
        
        if (storedToken) {
            console.log('Found token in localStorage');
            
            // Validate token with server
            const response = await fetch(`/api/validate-token?token=${storedToken}`);
            
            if (response.ok) {
                const data = await response.json();
                
                if (data.valid && data.customer && data.customer.id) {
                    console.log('Valid stored token, customer ID:', data.customer.id);
                    currentCustomer = data.customer;
                    return data.customer.id;
                } else {
                    // Token is invalid or expired, remove it
                    localStorage.removeItem('woodcalc_access_token');
                }
            }
        }
    } catch (error) {
        console.error('Error validating stored token:', error);
    }
    
    // Method 3: Try to get from direct customer ID in URL
    try {
        const urlParams = new URLSearchParams(window.location.search);
        // First check for customer_id parameter (used by customer-integration.js)
        let customerId = urlParams.get('customer_id');
        
        // If not found, try customerId parameter (backward compatibility)
        if (!customerId) {
            customerId = urlParams.get('customerId');
        }
        
        if (customerId && customerId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            console.log('Valid customer ID from URL:', customerId);
            // Store it for future use
            try { localStorage.setItem('woodcalc_customer_id', customerId); } catch (e) {}
            return customerId;
        }
    } catch (error) {
        console.error('Error parsing URL parameters:', error);
    }
    
    // Method 4: Try to get from localStorage (if previously stored)
    try {
        const storedId = localStorage.getItem('woodcalc_customer_id');
        if (storedId && storedId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            console.log('Customer ID from localStorage:', storedId);
            return storedId;
        }
    } catch (error) {
        console.error('Error accessing localStorage:', error);
    }
    
    console.error('Could not determine customer ID using any method');
    return null;
}

// Function to fetch customer details
async function fetchCustomerDetails(customerId) {
    try {
        // First try using the API endpoint
        try {
            const response = await fetch(`/api/get-customers?id=${customerId}`);
            if (response.ok) {
                const data = await response.json();
                return data;
            }
        } catch (apiError) {
            console.warn('API endpoint failed, falling back to direct Supabase:', apiError);
        }
        
        // If API fails, try direct Supabase connection
        if (crmSupabase) {
            const { data, error } = await crmSupabase
                .from('customers')
                .select('*')
                .eq('id', customerId)
                .single();
                
            if (error) throw error;
            return data;
        }
        
        throw new Error('Failed to fetch customer');
    } catch (error) {
        console.error('Error fetching customer:', error);
        return null;
    }
}

// Function to save calculation and create estimate
async function saveCalculationToCrm(calculationData) {
    console.log('Save and create estimate called');
    
    // Try to get customer ID from multiple sources
    let customerId = currentCustomerId || window.currentCustomerId;
    
    // If we still don't have an ID, try to get it using all methods
    if (!customerId) {
        customerId = await getCustomerId();
    }
    
    console.log('Customer ID for save:', customerId);
    
    if (!customerId) {
        console.error('No customer ID available');
        alert('Error: No customer ID available. Please contact support for assistance.');
        return;
    }
    
    // Ensure currentCustomerId is set
    currentCustomerId = customerId;
    // Store for future use
    try { localStorage.setItem('woodcalc_customer_id', customerId); } catch (e) {}
    
    // Update debug display
    updateDebugDisplay();

    if (!calculationData || !calculationData.grandTotal) {
        alert('Error: No calculation data available. Please complete the calculation first.');
        return;
    }

    try {
        // Extract required fields from calculation data
        const {
            grandTotal,
            itemData,
            calculationDate
        } = calculationData;
        
        // Get fence dimensions from the form
        const totalLength = parseFloat(document.getElementById('totalLength').value) || 0;
        const postSpacing = parseFloat(document.getElementById('postSpacing').value) || 0;
        const fenceHeight = parseFloat(document.getElementById('fenceHeight').value) || 0;
        
        // Count posts, rails, and pickets from itemData
        const postCount = itemData[1] ? itemData[1].qty : 0;
        const railCount = (itemData[10] ? itemData[10].qty : 0) + 
                         (itemData[11] ? itemData[11].qty : 0) + 
                         (itemData[12] ? itemData[12].qty : 0);
        const picketCount = itemData[6] ? itemData[6].qty : 0;
        
        // Generate notes with fence dimensions
        const notes = `Fence calculation: ${fenceHeight}ft height, ${totalLength}ft length, ${postSpacing}ft post spacing`;
        
        // First save the calculation
        let calcResult;
        
        try {
            // Try API endpoint first
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
            } else {
                throw new Error('API endpoint failed');
            }
        } catch (apiError) {
            console.warn('API save failed, trying direct Supabase:', apiError);
            
            // If API fails, try direct Supabase connection
            if (crmSupabase) {
                const { data, error } = await crmSupabase
                    .from('wood_calculator')
                    .insert([{
                        customer_id: currentCustomerId,
                        total_length: totalLength || 0,
                        post_spacing: postSpacing || 0,
                        post_count: postCount || 0,
                        rail_count: railCount || 0,
                        picket_count: picketCount || 0,
                        total_cost: grandTotal || 0,
                        notes
                    }])
                    .select()
                    .single();
                
                if (error) throw error;
                calcResult = data;
                
                // Save line items if we have them
                if (itemData && Object.keys(itemData).length > 0) {
                    const lineItems = [];
                    
                    for (const [itemNumber, item] of Object.entries(itemData)) {
                        // Only save items with quantity > 0
                        if (item.qty > 0) {
                            lineItems.push({
                                calculation_id: calcResult.id,
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
                        }
                    }
                }
            } else {
                throw new Error('Failed to save calculation');
            }
        }

        // Note: calcResult is already set in the try/catch block above

        // Then create an estimate
        const estimateResponse = await fetch('/api/create-estimate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                customerId: currentCustomerId,
                calculatorId: calcResult.id,
                totalAmount: calculationData.grandTotal,
                notes: `Wood Fence Estimate - ${new Date().toLocaleDateString()}`
            })
        });

        if (!estimateResponse.ok) {
            const error = await estimateResponse.text();
            throw new Error(`Failed to create estimate: ${error}`);
        }

        const estimateResult = await estimateResponse.json();
        console.log('Estimate created:', estimateResult);

        // Redirect to the estimate in CRM
        if (estimateResult.redirectUrl) {
            window.location.href = estimateResult.redirectUrl;
        } else {
            alert('Estimate saved successfully!');
        }

        return estimateResult;
    } catch (error) {
        console.error('Error saving calculation and creating estimate:', error);
        alert(`Error: ${error.message}`);
        throw error;
    }
}

// Function to update debug display
function updateDebugDisplay() {
    // Update customer ID display
    const customerIdDisplay = document.getElementById('customer-id-display');
    if (customerIdDisplay) {
        customerIdDisplay.textContent = `Customer ID: ${currentCustomerId || 'None'}`;
    }
    
    // Update token display
    const tokenDisplay = document.getElementById('token-display');
    if (tokenDisplay) {
        const token = localStorage.getItem('woodcalc_access_token') || 'None';
        tokenDisplay.textContent = `Token: ${token.substring(0, 10)}...`;
    }
    
    // Update URL display
    const urlDisplay = document.getElementById('url-display');
    if (urlDisplay) {
        urlDisplay.textContent = `URL: ${window.location.href}`;
    }
}

// Initialize CRM integration
async function initCrmIntegration() {
    // Always show the buttons initially
    if (document.getElementById('save-to-crm-btn')) {
        document.getElementById('save-to-crm-btn').style.display = 'block';
    }
    
    if (document.getElementById('save-calculation-btn')) {
        document.getElementById('save-calculation-btn').style.display = 'block';
    }
    
    // Try to get customer ID using all available methods
    const customerId = await getCustomerId();
    
    if (customerId) {
        currentCustomerId = customerId;
        window.currentCustomerId = customerId; // Also set it on the window object
        console.log('Set current customer ID:', currentCustomerId);
        
        try {
            currentCustomer = await fetchCustomerDetails(customerId);
            
            if (currentCustomer) {
                console.log('Customer loaded:', currentCustomer);
            } else {
                console.error('Customer not found with ID:', customerId);
                // Don't hide buttons - we'll handle missing customer in the save functions
            }
        } catch (error) {
            console.error('Error loading customer:', error);
        }
    } else {
        console.error('Could not determine customer ID');
    }
    
    // Update debug display
    updateDebugDisplay();
}

// Function to save calculation only (without creating an estimate)
async function saveCalculation(calculationData) {
    console.log('Save calculation called');
    
    // Try to get customer ID from multiple sources
    let customerId = currentCustomerId || window.currentCustomerId;
    
    // If we still don't have an ID, try to get it using all methods
    if (!customerId) {
        customerId = await getCustomerId();
    }
    
    console.log('Customer ID for save:', customerId);
    
    if (!customerId) {
        console.error('No customer ID available');
        alert('Error: No customer ID available. Please contact support for assistance.');
        return;
    }
    
    // Ensure currentCustomerId is set
    currentCustomerId = customerId;
    // Store for future use
    try { localStorage.setItem('woodcalc_customer_id', customerId); } catch (e) {}
    
    // Update debug display
    updateDebugDisplay();

    if (!calculationData || !calculationData.grandTotal) {
        alert('Error: No calculation data available. Please complete the calculation first.');
        return;
    }

    try {
        let calcResult = null;
        
        // First try the new method using customer-integration.js
        if (typeof saveCalculationToSupabase === 'function') {
            try {
                calcResult = await saveCalculationToSupabase(calculationData);
                if (calcResult) {
                    console.log('Calculation saved using saveCalculationToSupabase:', calcResult);
                    alert('Calculation saved successfully!');
                    return calcResult;
                }
            } catch (newMethodError) {
                console.warn('Error using saveCalculationToSupabase:', newMethodError);
                // Continue to fallback methods
            }
        }
        
        // Extract required fields from calculation data
        const {
            grandTotal,
            itemData,
            calculationDate
        } = calculationData;
        
        // Get fence dimensions from the form
        const totalLength = parseFloat(document.getElementById('totalLength').value) || 0;
        const postSpacing = parseFloat(document.getElementById('postSpacing').value) || 0;
        const fenceHeight = parseFloat(document.getElementById('fenceHeight').value) || 0;
        
        // Count posts, rails, and pickets from itemData
        const postCount = itemData[1] ? itemData[1].qty : 0;
        const railCount = (itemData[10] ? itemData[10].qty : 0) + 
                         (itemData[11] ? itemData[11].qty : 0) + 
                         (itemData[12] ? itemData[12].qty : 0);
        const picketCount = itemData[6] ? itemData[6].qty : 0;
        
        // Generate notes with fence dimensions
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
                const { data, error } = await crmSupabase
                    .from('wood_calculator')
                    .insert([{
                        customer_id: currentCustomerId,
                        total_length: totalLength || 0,
                        post_spacing: postSpacing || 0,
                        post_count: postCount || 0,
                        rail_count: railCount || 0,
                        picket_count: picketCount || 0,
                        total_cost: grandTotal || 0,
                        notes
                    }])
                    .select()
                    .single();
                
                if (error) throw error;
                calcResult = data;
                console.log('Calculation saved via Supabase:', calcResult);
                
                // Save line items if we have them
                if (itemData && Object.keys(itemData).length > 0) {
                    const lineItems = [];
                    
                    for (const [itemNumber, item] of Object.entries(itemData)) {
                        // Only save items with quantity > 0
                        if (item.qty > 0) {
                            lineItems.push({
                                calculation_id: calcResult.id,
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
                        }
                    }
                }
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
}



// Make functions available globally
window.saveCalculationToCrm = saveCalculationToCrm;
window.saveCalculation = saveCalculation;
window.initCrmIntegration = initCrmIntegration;
