// Wood Fence Calculator - Main Integration File
// This file integrates all the calculation modules and provides the main calculation function

// Main calculation function that uses all the item calculation functions
function calculateFence() {
    const errorDiv = document.getElementById('errorMessage');
    const tableContainer = document.getElementById('resultsTableContainer');
    const grandTotalP = document.getElementById('grandTotal');
    if (errorDiv) errorDiv.textContent = '';
    if (tableContainer) tableContainer.innerHTML = '';
    if (grandTotalP) grandTotalP.textContent = '';
    
    // Initialize results
    let results = { html: '<table class="min-w-full results-table"><thead><tr><th>#</th><th>Item</th><th>Description</th><th>Qty</th><th>Unit Cost</th><th>Total Cost</th></tr></thead><tbody>', grandTotal: 0 };
    let itemData = {}; 
    
    try {
        // --- Get All Inputs ---
        const numStretches = getInputValue('numStretches');
        const totalLengthWithGates = getInputValue('totalLength');
        const numCorners = getInputValue('numCorners');
        
        // Get pull lengths if using stretches
        const pullLengths = [];
        if (numStretches > 0) {
            for (let i = 1; i <= numStretches; i++) {
                const len = getInputValue(`pullLength_${i}`);
                if (len > 0) pullLengths.push(len);
            }
        } else if (totalLengthWithGates > 0) {
            pullLengths.push(totalLengthWithGates); // Treat as one pull
        }
        
        const fenceHeight = getInputValue('fenceHeight');
        const fenceOrientation = getInputValue('fenceOrientation', false);
        const fenceStyle = getInputValue('fenceStyle', false);
        const postSpacing = getInputValue('postSpacing');
        const standardPostType = getInputValue('standardPostType', false);
        const holeDepthInches = getInputValue('holeDepth');
        const holeWidthInches = getInputValue('holeWidth');
        const concreteType = getInputValue('concreteType', false);
        
        const numFlangedCentered = getInputValue('numFlangedCentered');
        const numFlangedOffCentered = getInputValue('numFlangedOffCentered');
        const flangedPostHeight = getInputValue('flangedPostHeight');
        
        const picketType = getInputValue('picketType', false);
        const picketWidth = getInputValue('picketWidth');
        
        const numRails = getInputValue('numRails');
        
        const addBaseboard = getInputValue('addBaseboard', false);
        const baseboardMaterialSize = getInputValue('baseboardMaterialSize', false);
        
        const trimType = getInputValue('trimType', false);
        const trimWoodType = getInputValue('trimWoodType', false);
        const capBoardType = getInputValue('capBoardType', false);
        const capBoardWoodType = getInputValue('capBoardWoodType', false);
        
        const numSingleGates = getInputValue('numSingleGates');
        const numDoubleGates = getInputValue('numDoubleGates');
        const numSlidingGates = getInputValue('numSlidingGates');
        
        // Get gate widths
        const singleGateWidths = [];
        for (let i = 1; i <= numSingleGates; i++) {
            singleGateWidths.push(getInputValue(`singleGateWidth_${i}`));
        }
        
        const doubleGateWidths = [];
        for (let i = 1; i <= numDoubleGates; i++) {
            doubleGateWidths.push(getInputValue(`doubleGateWidth_${i}`));
        }
        
        const slidingGateWidths = [];
        for (let i = 1; i <= numSlidingGates; i++) {
            slidingGateWidths.push(getInputValue(`slidingGateWidth_${i}`));
        }
        
        // Calculate total gate width
        let totalGateWidth = 0;
        singleGateWidths.forEach(w => totalGateWidth += w);
        doubleGateWidths.forEach(w => totalGateWidth += w);
        slidingGateWidths.forEach(w => totalGateWidth += w);
        
        const totalLengthWithoutGates = totalLengthWithGates - totalGateWidth;
        
        const useDifferentGatePosts = getInputValue('useDifferentGatePosts', false);
        const gatePostType = getInputValue('gatePostType', false);
        
        const useMetalGateFrames = getInputValue('useMetalGateFrames', false);
        const industrialLatch = getInputValue('industrialLatch', false);
        
        const useScrews = getInputValue('useScrews', false);
        
        // Collect all inputs into a single object for easier passing to calculation functions
        const inputs = {
            numStretches,
            totalLengthWithGates,
            totalLengthWithoutGates,
            pullLengths,
            numCorners,
            fenceHeight,
            fenceOrientation,
            fenceStyle,
            postSpacing,
            standardPostType,
            holeDepthInches,
            holeWidthInches,
            concreteType,
            numFlangedCentered,
            numFlangedOffCentered,
            flangedPostHeight,
            picketType,
            picketWidth,
            numRails,
            addBaseboard,
            baseboardMaterialSize,
            trimType,
            trimWoodType,
            capBoardType,
            capBoardWoodType,
            numSingleGates,
            numDoubleGates,
            numSlidingGates,
            singleGateWidths,
            doubleGateWidths,
            slidingGateWidths,
            useDifferentGatePosts,
            gatePostType,
            useMetalGateFrames,
            industrialLatch,
            useScrews
        };
        
        // Initialize itemData with all 33 items
        for (let i = 1; i <= 33; i++) {
            itemData[i] = { item: `Item ${i}`, description: "", qty: 0, unitCost: 0, totalCost: 0 };
        }
        
        // Set item names
        itemData[1].item = "Post";
        itemData[2].item = "4x4x8 incense cedar gate posts";
        itemData[3].item = "Flanged posts centered";
        itemData[4].item = "Flanged posts off centered";
        itemData[5].item = "Concrete";
        itemData[6].item = "Picket";
        itemData[7].item = "Picket for gate with baseboard";
        itemData[8].item = "5/4 x 12 beveled deck board";
        itemData[9].item = "2x4x8 incense cedar gate rail";
        itemData[10].item = "2x4x10 treated";
        itemData[11].item = "2x4x12 treated";
        itemData[12].item = "2x4x16 treated";
        itemData[13].item = "2x6x16 treated";
        itemData[14].item = "2x12x16 treated";
        itemData[15].item = "Cap";
        itemData[16].item = "Trim";
        itemData[17].item = "Pipe tie/ wood to metal connector";
        itemData[18].item = "Post cap";
        itemData[19].item = "Lag screw (100pc)";
        itemData[20].item = "Gate hardware";
        itemData[21].item = "Hinge set for double gate";
        itemData[22].item = "Cane bolt set (Wooden privacy)";
        itemData[23].item = "Industrial drop latch";
        itemData[24].item = "Industrial drop latch guides";
        itemData[25].item = "EMT";
        itemData[26].item = "Metal frames";
        itemData[27].item = "Framing screws";
        itemData[28].item = "Picket nails";
        itemData[29].item = "Star head wood deck screws - 1 5/8\"";
        itemData[30].item = "Wedge anchors";
        itemData[31].item = "Cantilever / sliding gate post";
        itemData[32].item = "Cantilever / sliding gate rollers";
        itemData[33].item = "Cantilever / sliding gate latch";
        
        // --- Calculate all items ---
        // Items 1-10
        calculateItem1(itemData, inputs);
        calculateItem2(itemData, inputs);
        calculateItems3And4(itemData, inputs);
        calculateItem5(itemData, inputs);
        calculateItem6(itemData, inputs);
        calculateItem7(itemData, inputs);
        calculateItem8(itemData, inputs);
        calculateItem9(itemData, inputs);
        calculateItem10(itemData, inputs);
        
        // Items 11-20
        calculateItem11(itemData, inputs);
        calculateItem12(itemData, inputs);
        calculateItem13(itemData, inputs);
        calculateItem14(itemData, inputs);
        calculateItem15(itemData, inputs);
        calculateItem16(itemData, inputs);
        calculateItem17(itemData, inputs);
        calculateItem18(itemData, inputs);
        calculateItem19(itemData, inputs);
        calculateItem20(itemData, inputs);
        
        // Items 21-33
        calculateItem21(itemData, inputs);
        calculateItem22(itemData, inputs);
        calculateItem23(itemData, inputs);
        calculateItem24(itemData, inputs);
        calculateItem25(itemData, inputs);
        calculateItem26(itemData, inputs);
        calculateItem27(itemData, inputs);
        calculateItem28(itemData, inputs);
        calculateItem29(itemData, inputs);
        calculateItem30(itemData, inputs);
        calculateItem31(itemData, inputs);
        calculateItem32(itemData, inputs);
        calculateItem33(itemData, inputs);
        
        // --- Generate Table and Grand Total ---
        for (let i = 1; i <= Object.keys(itemData).length; i++) {
            if (itemData[i] && itemData[i].qty > 0) {
                addResultRow(results, i, itemData[i].item, itemData[i].description, itemData[i].qty, itemData[i].unitCost, itemData[i].totalCost);
            }
        }

        // Display results
        results.html += '</tbody></table>';
        if (tableContainer) tableContainer.innerHTML = results.html;
        if (grandTotalP) grandTotalP.textContent = `Grand Total: $${results.grandTotal.toFixed(2)}`;

        // Store calculation result
        window.lastCalculationResult = {
            grandTotal: results.grandTotal,
            itemData: itemData,
            calculationDate: new Date().toISOString()
        };
        
        // Also update labor calculations if the function exists
        if (typeof calculateLaborCosts === 'function') {
            calculateLaborCosts();
            
            // Ensure the labor results container is visible but don't scroll to it
            const laborContainer = document.getElementById('laborResultsContainer');
            if (laborContainer) {
                laborContainer.style.display = 'block';
                // Removed automatic scrolling to prevent page jumping when inputs change
            }
        }

    } catch (error) {
        console.error('Error in calculation:', error);
        if (errorDiv) errorDiv.textContent = `Error: ${error.message}`;
        window.lastCalculationResult = null;
    }
}

// Export functions for use in HTML

// Set up event listeners for save buttons when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Save calculation button
    const saveCalculationBtn = document.getElementById('save-calculation-btn');
    if (saveCalculationBtn) {
        saveCalculationBtn.addEventListener('click', async function() {
            const saveMessage = document.getElementById('saveMessage');
            const saveError = document.getElementById('saveError');
            
            // Clear previous messages
            if (saveMessage) {
                saveMessage.textContent = '';
                saveMessage.classList.add('hidden');
            }
            if (saveError) {
                saveError.textContent = '';
                saveError.classList.add('hidden');
            }
            
            // Check if we have calculation results
            if (!window.lastCalculationResult) {
                if (saveError) {
                    saveError.textContent = 'Please complete a calculation first.';
                    saveError.classList.remove('hidden');
                }
                return;
            }
            
            try {
                // Show loading state
                saveCalculationBtn.disabled = true;
                saveCalculationBtn.textContent = 'Saving...';
                
                // Call the save function
                if (typeof window.saveCalculation === 'function') {
                    await window.saveCalculation(window.lastCalculationResult);
                    
                    // Show success message
                    if (saveMessage) {
                        saveMessage.textContent = 'Calculation saved successfully!';
                        saveMessage.classList.remove('hidden');
                    }
                } else {
                    throw new Error('Save function not available');
                }
            } catch (error) {
                console.error('Error saving calculation:', error);
                if (saveError) {
                    saveError.textContent = `Error: ${error.message || 'Failed to save calculation'}`;
                    saveError.classList.remove('hidden');
                }
            } finally {
                // Reset button state
                saveCalculationBtn.disabled = false;
                saveCalculationBtn.textContent = 'Save Calculation';
            }
        });
    }
    
    // Save and create estimate button
    const saveToCrmBtn = document.getElementById('save-to-crm-btn');
    if (saveToCrmBtn) {
        saveToCrmBtn.addEventListener('click', async function() {
            const saveMessage = document.getElementById('saveMessage');
            const saveError = document.getElementById('saveError');
            
            // Clear previous messages
            if (saveMessage) {
                saveMessage.textContent = '';
                saveMessage.classList.add('hidden');
            }
            if (saveError) {
                saveError.textContent = '';
                saveError.classList.add('hidden');
            }
            
            // Check if we have calculation results
            if (!window.lastCalculationResult) {
                if (saveError) {
                    saveError.textContent = 'Please complete a calculation first.';
                    saveError.classList.remove('hidden');
                }
                return;
            }
            
            try {
                // Show loading state
                saveToCrmBtn.disabled = true;
                saveToCrmBtn.textContent = 'Saving...';
                
                // Call the save to CRM function
                if (typeof window.saveCalculationToCrm === 'function') {
                    await window.saveCalculationToCrm(window.lastCalculationResult);
                    
                    // Show success message
                    if (saveMessage) {
                        saveMessage.textContent = 'Calculation saved successfully!';
                        saveMessage.classList.remove('hidden');
                    }
                    
                    // Get customer ID to redirect to profile
                    let customerId = window.currentCustomerId;
                    if (!customerId) {
                        // Try to get it from the UI element
                        const customerIdElement = document.getElementById('calculator-customer-id');
                        if (customerIdElement && customerIdElement.textContent) {
                            customerId = customerIdElement.textContent.trim();
                        }
                        
                        // If still no ID, try URL parameters
                        if (!customerId) {
                            const params = new URLSearchParams(window.location.search);
                            customerId = params.get('customerId') || params.get('customer_id');
                        }
                    }
                    
                    // Redirect to customer profile on STFAD site
                    if (customerId) {
                        // Short delay to show the success message before redirecting
                        setTimeout(() => {
                            window.location.href = `https://stfad.netlify.app/customers/${customerId}`;
                        }, 1000);
                    }
                } else {
                    throw new Error('Save to CRM function not available');
                }
            } catch (error) {
                console.error('Error saving to CRM:', error);
                if (saveError) {
                    saveError.textContent = `Error: ${error.message || 'Failed to save to CRM'}`;
                    saveError.classList.remove('hidden');
                }
            } finally {
                // Reset button state
                saveToCrmBtn.disabled = false;
                saveToCrmBtn.textContent = 'Save & Return to Profile';
            }
        });
    }
});
window.calculateFence = calculateFence;
