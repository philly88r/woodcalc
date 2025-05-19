// CRM Integration for Wood Fence Calculator
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with anon key for client-side operations
const supabaseUrl = 'https://kdhwrlhzevzekoanusbs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaHdybGh6ZXZ6ZWtvYW51c2JzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDU5MzI1NDUsImV4cCI6MjAyMTUwODU0NX0.PXkR_PYOUPJvWRQGYNOy94VhgI4G9hVZ4Q6ZQ4Q4Z4Q';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
        console.error('No customer ID available');
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

        if (!estimateResponse.ok) throw new Error('Failed to create estimate');

        const estimateResult = await estimateResponse.json();
        console.log('Estimate created:', estimateResult);

        // Redirect to the estimate in CRM
        window.location.href = estimateResult.redirectUrl;

        return estimateResult;
    } catch (error) {
        console.error('Error saving calculation and creating estimate:', error);
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
