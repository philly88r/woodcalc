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

// Function to save calculation and create estimate
async function saveCalculationToCrm(calculationData) {
    if (!currentCustomerId) {
        alert('Error: No customer ID available. Please make sure you accessed this page with a proper customer ID in the URL.');
        return;
    }

    if (!calculationData || !calculationData.grandTotal) {
        alert('Error: No calculation data available. Please complete the calculation first.');
        return;
    }

    try {
        // First save the calculation
        const calcResponse = await fetch('/.netlify/functions/save-calculation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                customerId: currentCustomerId,
                ...calculationData
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
    const customerId = getCustomerIdFromUrl();
    if (!customerId) {
        console.error('No customer ID provided in URL');
        document.getElementById('save-to-crm-btn').style.display = 'none';
        return;
    }

    currentCustomerId = customerId;
    currentCustomer = await fetchCustomerDetails(customerId);
    
    if (currentCustomer) {
        console.log('Customer loaded:', currentCustomer);
    } else {
        document.getElementById('save-to-crm-btn').style.display = 'none';
    }
}

// Make functions available globally
window.saveCalculationToCrm = saveCalculationToCrm;
window.initCrmIntegration = initCrmIntegration;
window.saveCalculationToCrm = saveCalculationToCrm;
window.initCrmIntegration = initCrmIntegration;
