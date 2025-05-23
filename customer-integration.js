// Customer Integration for Wood Fence Calculator
// This file handles loading customer data from the URL parameter and pre-filling the form

// Global variables
let customerData = null;
let supabaseClient = null;

// Initialize Supabase client if available
// Defer this initialization to avoid interfering with calculation scripts
function initSupabaseClient() {
    try {
        // Check if the Supabase library is loaded
        if (typeof supabase !== 'undefined') {
            const supabaseUrl = 'https://kdhwrlhzevzekoanusbs.supabase.co';
            const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaHdybGh6ZXZ6ZWtvYW51c2JzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDU5MzI1NDUsImV4cCI6MjAyMTUwODU0NX0.PXkR_PYOUPJvWRQGYNOy94VhgI4G9hVZ4Q6ZQ4Q4Z4Q';
            
            // Create the Supabase client using the global supabase object
            supabaseClient = supabase.createClient(supabaseUrl, supabaseAnonKey);
            console.log('Supabase client initialized for customer integration');
            
            // Make it available globally
            window.supabaseClient = supabaseClient;
            return supabaseClient;
        } else {
            console.error('Supabase library not loaded. Make sure the script is included before this file.');
            return null;
        }
    } catch (error) {
        console.error('Error initializing Supabase client:', error);
        return null;
    }
}

// Function to get customer ID from URL
function getCustomerIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    // First check for customer_id parameter (primary)
    let customerId = urlParams.get('customer_id');
    
    // If not found, try customerId parameter (backward compatibility)
    if (!customerId) {
        customerId = urlParams.get('customerId');
    }
    
    console.log('Customer ID from URL:', customerId);
    return customerId;
}

// Function to fetch customer data from API
async function fetchCustomerData(customerId) {
    if (!customerId) {
        console.error('No customer ID provided');
        return null;
    }
    
    try {
        // Try Netlify function endpoint
        try {
            const response = await fetch(`/.netlify/functions/get-customers?id=${customerId}`);
            if (response.ok) {
                const data = await response.json();
                return data;
            }
        } catch (apiError) {
            console.warn('Netlify function failed, trying direct Supabase:', apiError);
        }
        

        
        // If API fails, try direct Supabase connection
        if (supabaseClient) {
            const { data, error } = await supabaseClient
                .from('customers')
                .select('*')
                .eq('id', customerId)
                .single();
                
            if (error) throw error;
            return data;
        }
        
        throw new Error('Failed to fetch customer data');
    } catch (error) {
        console.error('Error fetching customer data:', error);
        return null;
    }
}

// Function to populate form fields with customer data
function populateCustomerForm(customer) {
    if (!customer) {
        console.error('No customer data to populate form');
        return;
    }
    
    console.log('Populating form with customer data:', customer);
    
    // Customer information fields
    const nameField = document.getElementById('customerName');
    const addressField = document.getElementById('customerAddress');
    const phoneField = document.getElementById('customerPhone');
    const emailField = document.getElementById('customerEmail');
    
    // Populate fields if they exist
    if (nameField) nameField.value = customer.name || '';
    if (addressField) addressField.value = customer.address || '';
    if (phoneField) phoneField.value = customer.phone || '';
    if (emailField) emailField.value = customer.email || '';
    
    // Store customer data globally
    customerData = customer;
    window.customerData = customer;
}

// Function to save calculation to Supabase
async function saveCalculationToSupabase(calculationData) {
    if (!supabaseClient) {
        console.error('Supabase client not available');
        return null;
    }
    
    const customerId = window.currentCustomerId || getCustomerIdFromUrl();
    if (!customerId) {
        console.error('No customer ID available');
        return null;
    }
    
    if (!calculationData || !calculationData.grandTotal) {
        console.error('No calculation data available');
        return null;
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
        
        // Save calculation to Supabase
        const { data, error } = await supabaseClient
            .from('wood_calculator')
            .insert([{
                customer_id: customerId,
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
        console.log('Calculation saved to Supabase:', data);
        
        // Save line items if we have them
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
                const { error: lineItemsError } = await supabaseClient
                    .from('calculation_items')
                    .insert(lineItems);
                
                if (lineItemsError) {
                    console.error('Error saving line items:', lineItemsError);
                }
            }
        }
        
        return data;
    } catch (error) {
        console.error('Error saving calculation to Supabase:', error);
        return null;
    }
}

// Main initialization function
async function initializeCustomerData() {
    try {
        // Initialize Supabase client if not already done
        if (!supabaseClient) {
            supabaseClient = initSupabaseClient();
        }
        
        const customerId = getCustomerIdFromUrl();
        
        if (customerId) {
            console.log('Initializing customer data for ID:', customerId);
            
            // Fetch customer data
            const customer = await fetchCustomerData(customerId);
            
            if (customer) {
                // Populate form with customer data
                populateCustomerForm(customer);
                
                // Set global customer ID
                window.currentCustomerId = customerId;
                
                return customer;
            } else {
                console.error('Failed to fetch customer data');
            }
        } else {
            console.log('No customer ID in URL, skipping customer data initialization');
        }
    } catch (error) {
        console.error('Error in customer data initialization:', error);
        // Don't let errors in customer integration break the calculator
    }
    
    return null;
}

// Make functions available globally
window.initializeCustomerData = initializeCustomerData;
window.getCustomerIdFromUrl = getCustomerIdFromUrl;
window.saveCalculationToSupabase = saveCalculationToSupabase;
