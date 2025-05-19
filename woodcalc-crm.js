// CRM Integration for Wood Fence Calculator

let currentCustomerId = null;
let currentCustomer = null;

// Function to get customer ID from URL
function getCustomerIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('customerId');
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

// Function to save calculation to CRM
async function saveCalculationToCrm(calculationData) {
    if (!currentCustomerId) {
        console.error('No customer ID available');
        return;
    }

    try {
        const response = await fetch('/.netlify/functions/save-calculation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                customerId: currentCustomerId,
                ...calculationData
            })
        });

        if (!response.ok) throw new Error('Failed to save calculation');
        
        const result = await response.json();
        console.log('Calculation saved:', result);
        return result;
    } catch (error) {
        console.error('Error saving calculation:', error);
        throw error;
    }
}

// Initialize CRM integration
async function initCrmIntegration() {
    const customerId = getCustomerIdFromUrl();
    if (!customerId) {
        console.error('No customer ID provided in URL');
        return;
    }

    currentCustomerId = customerId;
    currentCustomer = await fetchCustomerDetails(customerId);
    
    if (currentCustomer) {
        console.log('Customer loaded:', currentCustomer);
    }
}

// Export functions
window.saveCalculationToCrm = saveCalculationToCrm;
window.initCrmIntegration = initCrmIntegration;
