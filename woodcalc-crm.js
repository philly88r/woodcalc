// CRM Integration for Wood Fence Calculator

let currentCustomerId = null;
let currentCustomer = null;

// Function to get customer ID using multiple methods
async function getCustomerId() {
    // Method 1: Try to get from URL parameters
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const customerId = urlParams.get('customerId');
        
        // Check if we have a valid UUID format
        if (customerId && customerId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            console.log('Valid customer ID from URL:', customerId);
            return customerId;
        } else if (customerId) {
            console.log('Invalid customer ID format:', customerId);
        }
    } catch (error) {
        console.error('Error parsing URL parameters:', error);
    }
    
    // Method 2: Try to get from localStorage (if previously stored)
    try {
        const storedId = localStorage.getItem('woodcalc_customer_id');
        if (storedId && storedId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            console.log('Customer ID from localStorage:', storedId);
            return storedId;
        }
    } catch (error) {
        console.error('Error accessing localStorage:', error);
    }
    
    // Method 3: Try to get from document.referrer
    try {
        const referrer = document.referrer;
        if (referrer) {
            console.log('Referrer URL:', referrer);
            
            // Try to extract customer ID from referrer URL
            const match = referrer.match(/customers\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
            if (match && match[1]) {
                console.log('Customer ID from referrer URL:', match[1]);
                // Store for future use
                try { localStorage.setItem('woodcalc_customer_id', match[1]); } catch (e) {}
                return match[1];
            }
        }
    } catch (error) {
        console.error('Error accessing referrer:', error);
    }
    
    // Method 4: Try to get from server (current logged-in user)
    try {
        const response = await fetch('/.netlify/functions/get-current-user');
        if (response.ok) {
            const data = await response.json();
            if (data.customer && data.customer.id) {
                console.log('Customer ID from server:', data.customer.id);
                // Store for future use
                try { localStorage.setItem('woodcalc_customer_id', data.customer.id); } catch (e) {}
                return data.customer.id;
            }
        }
    } catch (error) {
        console.error('Error getting current user from server:', error);
    }
    
    // Method 5: Check if we're in an iframe and try to get from parent
    try {
        if (window.parent && window.parent !== window) {
            // We might be in an iframe, try to get customer ID from parent URL
            const parentUrl = window.parent.location.href;
            console.log('Parent URL:', parentUrl);
            
            // Extract customer ID from parent URL if possible
            const match = parentUrl.match(/customers\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
            if (match && match[1]) {
                console.log('Customer ID from parent URL:', match[1]);
                // Store for future use
                try { localStorage.setItem('woodcalc_customer_id', match[1]); } catch (e) {}
                return match[1];
            }
        }
    } catch (error) {
        // This might fail due to cross-origin restrictions
        console.error('Error accessing parent frame:', error);
    }
    
    console.error('Could not determine customer ID using any method');
    return null;
}

// Function to fetch customer details
async function fetchCustomerDetails(customerId) {
    try {
        const response = await fetch(`/.netlify/functions/get-customers?id=${customerId}`);
        if (!response.ok) throw new Error('Failed to fetch customer');
        const data = await response.json();
        return data;
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
        alert('Error: No customer ID available. Please contact support for assistance.');
        return;
    }
    
    // Ensure currentCustomerId is set
    currentCustomerId = customerId;
    // Store for future use
    try { localStorage.setItem('woodcalc_customer_id', customerId); } catch (e) {}

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
        const calcResponse = await fetch('/.netlify/functions/save-calculation', {
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

        if (!calcResponse.ok) throw new Error('Failed to save calculation');
        
        const calcResult = await calcResponse.json();
        console.log('Calculation saved:', calcResult);

        // Then create an estimate
        const estimateResponse = await fetch('/.netlify/functions/create-estimate', {
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
        alert('Error: No customer ID available. Please contact support for assistance.');
        return;
    }
    
    // Ensure currentCustomerId is set
    currentCustomerId = customerId;
    // Store for future use
    try { localStorage.setItem('woodcalc_customer_id', customerId); } catch (e) {}

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
        
        // Save the calculation
        const calcResponse = await fetch('/.netlify/functions/save-calculation', {
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

        if (!calcResponse.ok) throw new Error('Failed to save calculation');
        
        const calcResult = await calcResponse.json();
        console.log('Calculation saved:', calcResult);
        
        alert('Calculation saved successfully!');
        return calcResult;
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
