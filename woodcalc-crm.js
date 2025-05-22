// CRM Integration for Wood Fence Calculator

let currentCustomerId = null;
let currentCustomer = null;

// Function to get customer ID from URL
function getCustomerIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const customerId = urlParams.get('customerId');
    console.log('Customer ID from URL:', customerId);
    return customerId;
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
    // Try to get customer ID from multiple sources
    const customerId = currentCustomerId || window.currentCustomerId;
    
    if (!customerId) {
        alert('Error: No customer ID available. Please make sure you accessed this page with a proper customer ID in the URL.');
        return;
    }
    
    // Ensure currentCustomerId is set
    currentCustomerId = customerId;

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
    const customerId = getCustomerIdFromUrl();
    if (!customerId) {
        console.error('No customer ID provided in URL');
        document.getElementById('save-to-crm-btn').style.display = 'none';
        document.getElementById('save-calculation-btn').style.display = 'none';
        return;
    }

    currentCustomerId = customerId;
    console.log('Set current customer ID:', currentCustomerId);
    
    try {
        currentCustomer = await fetchCustomerDetails(customerId);
        
        if (currentCustomer) {
            console.log('Customer loaded:', currentCustomer);
        } else {
            console.error('Customer not found with ID:', customerId);
            document.getElementById('save-to-crm-btn').style.display = 'none';
            document.getElementById('save-calculation-btn').style.display = 'none';
        }
    } catch (error) {
        console.error('Error loading customer:', error);
    }
}

// Function to save calculation only (without creating an estimate)
async function saveCalculation(calculationData) {
    // Try to get customer ID from multiple sources
    const customerId = currentCustomerId || window.currentCustomerId;
    
    if (!customerId) {
        alert('Error: No customer ID available. Please make sure you accessed this page with a proper customer ID in the URL.');
        return;
    }
    
    // Ensure currentCustomerId is set
    currentCustomerId = customerId;

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
