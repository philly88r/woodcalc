// CRM Integration for Wood Fence Calculator
// This file handles the integration between the calculator and your CRM

// Function to save calculation results to CRM
async function saveResultsToCRM(customerInfo, calculationResults) {
    try {
        // Get all the fence details from form inputs
        const fenceDetails = {
            numStretches: getInputValue('numStretches'),
            totalLength: getInputValue('totalLength'),
            fenceHeight: getInputValue('fenceHeight'),
            fenceOrientation: getInputValue('fenceOrientation', false),
            fenceStyle: getInputValue('fenceStyle', false),
            postSpacing: getInputValue('postSpacing'),
            standardPostType: getInputValue('standardPostType', false),
            picketType: getInputValue('picketType', false),
            picketWidth: getInputValue('picketWidth'),
            numRails: getInputValue('numRails'),
            numSingleGates: getInputValue('numSingleGates'),
            numDoubleGates: getInputValue('numDoubleGates'),
            numSlidingGates: getInputValue('numSlidingGates')
        };

        // Extract the grand total from the results
        const grandTotalElement = document.getElementById('grandTotal');
        const grandTotal = grandTotalElement ? 
            parseFloat(grandTotalElement.textContent.replace('Grand Total: $', '')) : 0;

        // Prepare data for API call
        const data = {
            customerInfo,
            fenceDetails,
            calculationResults,
            grandTotal
        };

        // Send data to the Netlify function
        const response = await fetch('/.netlify/functions/save-to-crm', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        
        if (result.success) {
            showNotification('Quote saved to CRM successfully!', 'success');
            return result;
        } else {
            throw new Error(result.message || 'Failed to save to CRM');
        }
    } catch (error) {
        console.error('Error saving to CRM:', error);
        showNotification('Failed to save quote to CRM: ' + error.message, 'error');
        throw error;
    }
}

// Function to display notification messages
function showNotification(message, type = 'info') {
    // Create notification container if it doesn't exist
    let notificationContainer = document.getElementById('notification-container');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.style.position = 'fixed';
        notificationContainer.style.top = '20px';
        notificationContainer.style.right = '20px';
        notificationContainer.style.zIndex = '1000';
        document.body.appendChild(notificationContainer);
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.padding = '12px 20px';
    notification.style.marginBottom = '10px';
    notification.style.borderRadius = '4px';
    notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    notification.style.minWidth = '250px';
    
    // Set background color based on type
    if (type === 'success') {
        notification.style.backgroundColor = '#10B981'; // Green
        notification.style.color = 'white';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#EF4444'; // Red
        notification.style.color = 'white';
    } else {
        notification.style.backgroundColor = '#3B82F6'; // Blue
        notification.style.color = 'white';
    }
    
    notification.textContent = message;
    
    // Add close button
    const closeBtn = document.createElement('span');
    closeBtn.textContent = '×';
    closeBtn.style.marginLeft = '10px';
    closeBtn.style.float = 'right';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.fontWeight = 'bold';
    closeBtn.onclick = function() {
        notificationContainer.removeChild(notification);
    };
    notification.appendChild(closeBtn);
    
    // Add to container
    notificationContainer.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode === notificationContainer) {
            notificationContainer.removeChild(notification);
        }
    }, 5000);
}

// Function to open CRM customer selection modal
async function openCustomerSelectionModal() {
    // Create modal container
    const modalContainer = document.createElement('div');
    modalContainer.id = 'crm-customer-modal';
    modalContainer.style.position = 'fixed';
    modalContainer.style.top = '0';
    modalContainer.style.left = '0';
    modalContainer.style.width = '100%';
    modalContainer.style.height = '100%';
    modalContainer.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modalContainer.style.display = 'flex';
    modalContainer.style.justifyContent = 'center';
    modalContainer.style.alignItems = 'center';
    modalContainer.style.zIndex = '1001';
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = 'white';
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '8px';
    modalContent.style.width = '500px';
    modalContent.style.maxWidth = '90%';
    modalContent.style.maxHeight = '80vh';
    modalContent.style.overflowY = 'auto';
    
    // Create modal header
    const modalHeader = document.createElement('div');
    modalHeader.style.display = 'flex';
    modalHeader.style.justifyContent = 'space-between';
    modalHeader.style.alignItems = 'center';
    modalHeader.style.marginBottom = '20px';
    
    const modalTitle = document.createElement('h2');
    modalTitle.textContent = 'Select Customer from CRM';
    modalTitle.style.fontSize = '1.5rem';
    modalTitle.style.fontWeight = 'bold';
    modalTitle.style.margin = '0';
    
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.fontSize = '1.5rem';
    closeButton.style.cursor = 'pointer';
    closeButton.onclick = function() {
        document.body.removeChild(modalContainer);
    };
    
    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(closeButton);
    
    // Create search input
    const searchContainer = document.createElement('div');
    searchContainer.style.marginBottom = '20px';
    
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search customers...';
    searchInput.style.width = '100%';
    searchInput.style.padding = '8px';
    searchInput.style.borderRadius = '4px';
    searchInput.style.border = '1px solid #D1D5DB';
    
    searchContainer.appendChild(searchInput);
    
    // Create customer list container
    const customerList = document.createElement('div');
    customerList.id = 'customer-list';
    customerList.style.maxHeight = '300px';
    customerList.style.overflowY = 'auto';
    
    // Add loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.textContent = 'Loading customers...';
    loadingIndicator.style.textAlign = 'center';
    loadingIndicator.style.padding = '20px';
    customerList.appendChild(loadingIndicator);
    
    // Create "New Customer" button
    const newCustomerButton = document.createElement('button');
    newCustomerButton.textContent = 'Create New Customer';
    newCustomerButton.style.backgroundColor = '#2563EB';
    newCustomerButton.style.color = 'white';
    newCustomerButton.style.border = 'none';
    newCustomerButton.style.padding = '10px 15px';
    newCustomerButton.style.borderRadius = '4px';
    newCustomerButton.style.marginTop = '20px';
    newCustomerButton.style.cursor = 'pointer';
    newCustomerButton.style.width = '100%';
    
    newCustomerButton.onclick = function() {
        openNewCustomerForm();
        document.body.removeChild(modalContainer);
    };
    
    // Assemble modal
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(searchContainer);
    modalContent.appendChild(customerList);
    modalContent.appendChild(newCustomerButton);
    modalContainer.appendChild(modalContent);
    
    // Add to body
    document.body.appendChild(modalContainer);
    
    // Focus search input
    searchInput.focus();
    
    // Function to load customers
    async function loadCustomers(searchTerm = '') {
        try {
            // Clear previous customers
            customerList.innerHTML = '<div style="text-align: center; padding: 20px;">Loading customers...</div>';
            
            // Fetch customers from Netlify function
            const response = await fetch(`/.netlify/functions/get-customers${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''}`);
            const data = await response.json();
            
            // Clear loading indicator
            customerList.innerHTML = '';
            
            if (!data.customers || data.customers.length === 0) {
                customerList.innerHTML = '<div style="text-align: center; padding: 20px;">No customers found</div>';
                return;
            }
            
            // Create customer items
            data.customers.forEach(customer => {
                const customerItem = document.createElement('div');
                customerItem.className = 'customer-item';
                customerItem.style.padding = '10px';
                customerItem.style.borderBottom = '1px solid #E5E7EB';
                customerItem.style.cursor = 'pointer';
                
                const customerName = document.createElement('div');
                customerName.textContent = customer.name;
                customerName.style.fontWeight = 'bold';
                
                const customerDetails = document.createElement('div');
                customerDetails.textContent = `${customer.email} | ${customer.phone || 'No phone'}`;
                customerDetails.style.fontSize = '0.875rem';
                customerDetails.style.color = '#6B7280';
                
                customerItem.appendChild(customerName);
                customerItem.appendChild(customerDetails);
                
                // Add click event to select customer
                customerItem.onclick = function() {
                    selectCustomer(customer);
                    document.body.removeChild(modalContainer);
                };
                
                // Add hover effect
                customerItem.onmouseover = function() {
                    customerItem.style.backgroundColor = '#F3F4F6';
                };
                customerItem.onmouseout = function() {
                    customerItem.style.backgroundColor = 'white';
                };
                
                customerList.appendChild(customerItem);
            });
            
        } catch (error) {
            console.error('Error loading customers:', error);
            customerList.innerHTML = `<div style="text-align: center; padding: 20px; color: red;">Error loading customers: ${error.message}</div>`;
        }
    }
    
    // Load customers initially
    loadCustomers();
    
    // Add search functionality with debounce
    let debounceTimeout;
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.trim();
        
        // Clear previous timeout
        clearTimeout(debounceTimeout);
        
        // Set new timeout
        debounceTimeout = setTimeout(() => {
            loadCustomers(searchTerm);
        }, 300); // 300ms debounce
    });
}

// Function to open new customer form
function openNewCustomerForm() {
    // Create modal container
    const modalContainer = document.createElement('div');
    modalContainer.id = 'new-customer-modal';
    modalContainer.style.position = 'fixed';
    modalContainer.style.top = '0';
    modalContainer.style.left = '0';
    modalContainer.style.width = '100%';
    modalContainer.style.height = '100%';
    modalContainer.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modalContainer.style.display = 'flex';
    modalContainer.style.justifyContent = 'center';
    modalContainer.style.alignItems = 'center';
    modalContainer.style.zIndex = '1001';
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = 'white';
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '8px';
    modalContent.style.width = '500px';
    modalContent.style.maxWidth = '90%';
    
    // Create modal header
    const modalHeader = document.createElement('div');
    modalHeader.style.display = 'flex';
    modalHeader.style.justifyContent = 'space-between';
    modalHeader.style.alignItems = 'center';
    modalHeader.style.marginBottom = '20px';
    
    const modalTitle = document.createElement('h2');
    modalTitle.textContent = 'Create New Customer';
    modalTitle.style.fontSize = '1.5rem';
    modalTitle.style.fontWeight = 'bold';
    modalTitle.style.margin = '0';
    
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.fontSize = '1.5rem';
    closeButton.style.cursor = 'pointer';
    closeButton.onclick = function() {
        document.body.removeChild(modalContainer);
    };
    
    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(closeButton);
    
    // Create form
    const form = document.createElement('form');
    form.id = 'new-customer-form';
    
    // Create form fields
    const fields = [
        { id: 'name', label: 'Full Name', type: 'text', required: true },
        { id: 'email', label: 'Email', type: 'email', required: true },
        { id: 'phone', label: 'Phone', type: 'tel', required: true },
        { id: 'address', label: 'Address', type: 'text', required: false },
        { id: 'city', label: 'City', type: 'text', required: false },
        { id: 'state', label: 'State', type: 'text', required: false },
        { id: 'zip', label: 'ZIP Code', type: 'text', required: false }
    ];
    
    fields.forEach(field => {
        const fieldContainer = document.createElement('div');
        fieldContainer.style.marginBottom = '15px';
        
        const label = document.createElement('label');
        label.htmlFor = field.id;
        label.textContent = field.label + (field.required ? ' *' : '');
        label.style.display = 'block';
        label.style.marginBottom = '5px';
        label.style.fontWeight = '500';
        
        const input = document.createElement('input');
        input.type = field.type;
        input.id = field.id;
        input.name = field.id;
        input.required = field.required;
        input.style.width = '100%';
        input.style.padding = '8px';
        input.style.borderRadius = '4px';
        input.style.border = '1px solid #D1D5DB';
        
        fieldContainer.appendChild(label);
        fieldContainer.appendChild(input);
        form.appendChild(fieldContainer);
    });
    
    // Create submit button
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'Create Customer';
    submitButton.style.backgroundColor = '#2563EB';
    submitButton.style.color = 'white';
    submitButton.style.border = 'none';
    submitButton.style.padding = '10px 15px';
    submitButton.style.borderRadius = '4px';
    submitButton.style.marginTop = '10px';
    submitButton.style.cursor = 'pointer';
    submitButton.style.width = '100%';
    
    // Add loading state elements
    const loadingOverlay = document.createElement('div');
    loadingOverlay.style.position = 'absolute';
    loadingOverlay.style.top = '0';
    loadingOverlay.style.left = '0';
    loadingOverlay.style.width = '100%';
    loadingOverlay.style.height = '100%';
    loadingOverlay.style.backgroundColor = 'rgba(255,255,255,0.8)';
    loadingOverlay.style.display = 'none';
    loadingOverlay.style.justifyContent = 'center';
    loadingOverlay.style.alignItems = 'center';
    loadingOverlay.style.zIndex = '10';
    
    const loadingText = document.createElement('div');
    loadingText.textContent = 'Creating customer...';
    loadingText.style.fontWeight = 'bold';
    loadingOverlay.appendChild(loadingText);
    
    form.appendChild(submitButton);
    
    // Add form submission handler
    form.onsubmit = async function(e) {
        e.preventDefault();
        
        // Show loading state
        loadingOverlay.style.display = 'flex';
        submitButton.disabled = true;
        
        try {
            // Collect form data
            const formData = new FormData(form);
            const customerData = {};
            
            formData.forEach((value, key) => {
                customerData[key] = value;
            });
            
            // Send data to Netlify function
            const response = await fetch('/.netlify/functions/create-customer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(customerData)
            });
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Failed to create customer');
            }
            
            // Select the newly created customer
            selectCustomer(result.customer);
            
            // Close modal
            document.body.removeChild(modalContainer);
            
            // Show success notification
            showNotification('New customer created successfully!', 'success');
            
        } catch (error) {
            console.error('Error creating customer:', error);
            showNotification('Failed to create customer: ' + error.message, 'error');
            
            // Hide loading state
            loadingOverlay.style.display = 'none';
            submitButton.disabled = false;
        }
    };
    
    // Assemble modal
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(form);
    modalContent.style.position = 'relative';
    modalContent.appendChild(loadingOverlay);
    modalContainer.appendChild(modalContent);
    
    // Add to body
    document.body.appendChild(modalContainer);
    
    // Focus first input
    form.querySelector('input').focus();
}

// Store the selected customer
let selectedCustomer = null;

// Function to select a customer
function selectCustomer(customer) {
    selectedCustomer = customer;
    
    // Update the UI to show selected customer
    const customerInfoElement = document.getElementById('selected-customer-info');
    if (customerInfoElement) {
        customerInfoElement.textContent = `Selected Customer: ${customer.name}`;
    }
    
    // Enable the save button
    const saveButton = document.getElementById('save-to-crm-btn');
    if (saveButton) {
        saveButton.disabled = false;
    }
}

// Function to handle saving the current calculation to CRM
async function handleSaveToCRM() {
    if (!selectedCustomer) {
        showNotification('Please select a customer first', 'error');
        return;
    }
    
    try {
        // Get the calculation results from the table
        const resultsTable = document.querySelector('.results-table');
        if (!resultsTable) {
            throw new Error('No calculation results found');
        }
        
        // Extract data from the results table
        const calculationResults = [];
        const rows = resultsTable.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 6) {
                calculationResults.push({
                    itemNumber: cells[0].textContent,
                    item: cells[1].textContent,
                    description: cells[2].textContent,
                    quantity: cells[3].textContent,
                    unitCost: cells[4].textContent.replace('$', ''),
                    totalCost: cells[5].textContent.replace('$', '')
                });
            }
        });
        
        // Save to CRM
        await saveResultsToCRM(selectedCustomer, calculationResults);
        
        showNotification('Quote saved to CRM successfully!', 'success');
    } catch (error) {
        console.error('Error saving to CRM:', error);
        showNotification('Failed to save quote: ' + error.message, 'error');
    }
}

// Export functions for use in HTML
window.openCustomerSelectionModal = openCustomerSelectionModal;
window.handleSaveToCRM = handleSaveToCRM;
window.saveResultsToCRM = saveResultsToCRM;
