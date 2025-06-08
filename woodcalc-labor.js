// Wood Fence Calculator - Labor Calculations
// This file contains the labor calculation functions for the Wood Fence Calculator

// Calculate field labor costs based on fence length
function calculateFieldLabor(totalLength, needsTearOut, needsLineClearing, travellingCost) {
    let laborCost = 0;
    let leadCost = 0;
    let crewCost = 0;
    let tearOutCost = 0;
    let lineClearingCost = 0;
    
    // Calculate lead cost
    if (totalLength <= 300) {
        if (totalLength <= 250) {
            // 0-250 feet: 1 lead
            leadCost = 400;
        } else {
            // 251-300 feet: 2 leads
            leadCost = 800;
        }
    }
    
    // Calculate crew cost
    if (totalLength <= 300) {
        if (totalLength <= 150) {
            // 0-150 feet: 1 crew
            crewCost = 230;
        } else {
            // 151-300 feet: 2 crew
            crewCost = 460;
        }
    }
    
    // Additional costs
    if (needsTearOut) {
        tearOutCost = totalLength * 1.24;
    }
    
    if (needsLineClearing) {
        lineClearingCost = totalLength * 2.00;
    }
    
    // Calculate total field labor cost
    laborCost = leadCost + crewCost + tearOutCost + lineClearingCost + parseFloat(travellingCost || 0);
    
    return {
        leadCost,
        crewCost,
        tearOutCost,
        lineClearingCost,
        travellingCost: parseFloat(travellingCost || 0),
        total: laborCost
    };
}

// Calculate sub labor costs based on fence specifications
function calculateSubLabor(totalLength, fenceStyle, needsTearOut, needsLineClearing, hasBaseboard, 
                          hasCapAndTrim, numSingleGates, numDoubleGates, slidingGateWidths, useScrews, travellingCost) {
    let laborCost = 0;
    let baseLabor = 0;
    let fenceTypeAddOn = 0;
    let tearOutCost = 0;
    let lineClearingCost = 0;
    let baseboardCost = 0;
    let capAndTrimCost = 0;
    let gatesCost = 0;
    let screwsUpgradeCost = 0;
    
    // Base labor
    baseLabor = totalLength * 5.00;
    
    // Fence type add-ons
    if (fenceStyle === "Shadowbox" || fenceStyle === "Board on Board") {
        fenceTypeAddOn = totalLength * 2.00;
    }
    
    // Additional costs
    if (needsTearOut) {
        tearOutCost = totalLength * 2.00;
    }
    
    if (needsLineClearing) {
        lineClearingCost = totalLength * 2.00;
    }
    
    if (hasBaseboard === "yes") {
        baseboardCost = totalLength * 0.50;
    }
    
    if (hasCapAndTrim === "yes") {
        capAndTrimCost = totalLength * 2.00;
    }
    
    // Gates
    let singleGatesCost = numSingleGates * 75;
    let doubleGatesCost = numDoubleGates * 150;
    
    let slidingGatesCost = 0;
    if (slidingGateWidths && slidingGateWidths.length > 0) {
        for (const width of slidingGateWidths) {
            slidingGatesCost += width * 20;
        }
    }
    
    gatesCost = singleGatesCost + doubleGatesCost + slidingGatesCost;
    
    // Screws upgrade
    if (useScrews === "Yes") {
        screwsUpgradeCost = totalLength * 3.00;
    }
    
    // Calculate total sub labor cost
    laborCost = baseLabor + fenceTypeAddOn + tearOutCost + lineClearingCost + 
                baseboardCost + capAndTrimCost + gatesCost + screwsUpgradeCost + 
                parseFloat(travellingCost || 0);
    
    return {
        baseLabor,
        fenceTypeAddOn,
        tearOutCost,
        lineClearingCost,
        baseboardCost,
        capAndTrimCost,
        singleGatesCost,
        doubleGatesCost,
        slidingGatesCost,
        screwsUpgradeCost,
        travellingCost: parseFloat(travellingCost || 0),
        total: laborCost
    };
}

// Get recommended crew size based on fence length
function getRecommendedCrew(totalLength) {
    if (totalLength <= 150) {
        return "2 person crew, 1 day";
    } else if (totalLength <= 250) {
        return "3 person crew, 1 day";
    } else if (totalLength <= 300) {
        return "2 person crew, 2 days";
    } else {
        return "Recommend using subcontractor";
    }
}

// Calculate total labor costs
function calculateLaborCosts() {
    try {
        console.log('Starting labor cost calculation...');
        
        // Check if all required elements exist in the DOM
        const requiredElements = [
            'totalLength', 'fenceStyle', 'needsTearOut', 'needsLineClearing', 
            'useScrews', 'travelDistance', 'numSingleGates', 'numDoubleGates', 'numSlidingGates'
        ];
        
        // Optional elements that might not exist in all configurations
        const optionalElements = ['addBaseboard', 'trimType', 'capBoardType'];
        
        // Check required elements
        for (const elementId of requiredElements) {
            if (!document.getElementById(elementId)) {
                console.error(`Required element ${elementId} not found in DOM`);
                throw new Error(`Required input element ${elementId} not found`);
            }
        }
        
        // Get inputs from the existing form
        const totalLength = getInputValue('totalLength');
        const fenceStyle = getInputValue('fenceStyle', false);
        
        // Get values with null checks
        const needsTearOutElement = document.getElementById('needsTearOut');
        const needsTearOut = needsTearOutElement ? needsTearOutElement.value === "yes" : false;
        
        const needsLineClearingElement = document.getElementById('needsLineClearing');
        const needsLineClearing = needsLineClearingElement ? needsLineClearingElement.value === "yes" : false;
        
        // Optional elements with fallbacks
        const addBaseboardElement = document.getElementById('addBaseboard');
        const hasBaseboard = addBaseboardElement ? addBaseboardElement.value : "no";
        
        const trimTypeElement = document.getElementById('trimType');
        const capBoardTypeElement = document.getElementById('capBoardType');
        
        const hasCapAndTrim = (
            (trimTypeElement && trimTypeElement.value !== "none") || 
            (capBoardTypeElement && capBoardTypeElement.value !== "none")
        ) ? "yes" : "no";
        
        const useScrewsElement = document.getElementById('useScrews');
        const useScrews = useScrewsElement ? useScrewsElement.value : "No";
        
        // Travel distance (miles) - convert to cost
        const travelDistance = getInputValue('travelDistance');
        const fieldTravellingCost = travelDistance * 2; // $2 per mile for field labor
        const subTravellingCost = travelDistance * 2; // $2 per mile for sub labor
        
        // Get gate counts from the existing form
        const numSingleGates = getInputValue('numSingleGates');
        const numDoubleGates = getInputValue('numDoubleGates');
        const numSlidingGates = getInputValue('numSlidingGates');
        
        // Get sliding gate widths from the existing form
        const slidingGateWidths = [];
        try {
            for (let i = 1; i <= numSlidingGates; i++) {
                // Use the existing sliding gate width fields
                const widthFieldId = `slidingGateWidth_${i}`;
                const widthElement = document.getElementById(widthFieldId);
                if (widthElement) {
                    slidingGateWidths.push(getInputValue(widthFieldId));
                } else {
                    console.warn(`Sliding gate width element ${widthFieldId} not found, using default value of 10`);
                    slidingGateWidths.push(10); // Default width if element not found
                }
            }
            console.log('Sliding gate widths:', slidingGateWidths);
        } catch (error) {
            console.error('Error getting sliding gate widths:', error);
        }
        
        // Calculate field labor
        const fieldLabor = calculateFieldLabor(
            totalLength, 
            needsTearOut, 
            needsLineClearing, 
            fieldTravellingCost
        );
        
        // Calculate sub labor
        const subLabor = calculateSubLabor(
            totalLength, 
            fenceStyle, 
            needsTearOut, 
            needsLineClearing, 
            hasBaseboard, 
            hasCapAndTrim, 
            numSingleGates, 
            numDoubleGates, 
            slidingGateWidths, 
            useScrews, 
            subTravellingCost
        );
        
        // Calculate total labor cost
        const totalLaborCost = fieldLabor.total + subLabor.total;
        
        // Get recommended crew size
        const recommendedCrew = getRecommendedCrew(totalLength);
        
        // Display results
        displayLaborResults(fieldLabor, subLabor, totalLaborCost, recommendedCrew);
        
    } catch (error) {
        console.error('Error in labor calculation:', error);
        document.getElementById('laborErrorMessage').textContent = `Error: ${error.message}`;
    }
}

// Display labor calculation results
function displayLaborResults(fieldLabor, subLabor, totalLaborCost, recommendedCrew) {
    const laborResultsContainer = document.getElementById('laborResultsContainer');
    
    if (!laborResultsContainer) {
        console.error('Labor results container not found');
        return;
    }
    
    console.log('Displaying labor results in container:', laborResultsContainer);
    // Make sure the container is visible
    laborResultsContainer.style.display = 'block';
    
    // Get materials cost from the main calculation
    const materialsCost = window.lastCalculationResult ? window.lastCalculationResult.grandTotal : 0;
    
    // Calculate costs according to the proper formulas
    // Formula: (Material + Labor) / 0.72 * percentage
    
    // Calculate the base for percentage calculations
    const laborTotal = fieldLabor.total + subLabor.total;
    const costBase = (materialsCost + laborTotal) / 0.72;
    
    // Calculate additional costs using the proper formula
    const insideLabor = costBase * 0.09; // 9% of the base
    const overhead = costBase * 0.07; // 7% of the base
    const sales = costBase * 0.07; // 7% of the base
    
    // Calculate subtotal (before profit)
    const subtotal = materialsCost + fieldLabor.total + subLabor.total + insideLabor + overhead + sales;
    
    // Calculate the subtotal (sum of B7:B11)
    const costSubtotal = materialsCost + fieldLabor.total + subLabor.total + insideLabor + overhead + sales;
    
    // Calculate profit using the proper formula: costBase * percentage
    const profit = costBase * 0.12; // 12% of the base
    const profit5 = costBase * 0.05; // 5% of the base
    const profit20 = costBase * 0.20; // 20% of the base
    
    // Calculate estimated selling price (should equal the cost base)
    const estimatedSellingPrice = costBase;
    
    // Calculate totals with different profit options
    const totalCost = costSubtotal + profit;
    const totalCost5 = costSubtotal + profit5;
    const totalCost20 = costSubtotal + profit20;
    
    // Store labor calculation results in the window object for saving to the database
    window.lastLaborCalculation = {
        materialsCost,
        fieldLabor,
        subLabor,
        insideLabor,
        overhead,
        sales,
        costSubtotal,
        profit,
        profit5,
        profit20,
        totalCost,
        totalCost5,
        totalCost20,
        estimatedSellingPrice
    };
    
    console.log('Labor calculation stored for saving:', window.lastLaborCalculation);
    
    // Create the labor breakdown table (Table 2)
    let laborTableHtml = `
        <div class="overflow-x-auto shadow-md rounded-lg mb-8">
            <table class="min-w-full results-table" style="border: 2px solid #9F7B4F;">
                <thead>
                    <tr style="background-color: #8B2324; color: white;">
                        <th colspan="2" class="text-center py-3 text-xl font-bold">Labor and Sub Labor Breakdown</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="background-color: #f1e8d8;">
                        <td colspan="2" class="py-2 text-lg font-bold pl-4" style="color: #8B2324;">Field Labor Calculation</td>
                    </tr>
                    <tr class="border-b" style="border-color: #C8A77D;">
                        <td class="py-2 pl-4">In-house Labour (Lead):</td>
                        <td class="text-right pr-4">$${fieldLabor.leadCost.toFixed(2)}</td>
                    </tr>
                    <tr class="border-b" style="border-color: #C8A77D;">
                        <td class="py-2 pl-4">In-house Labour (Crew):</td>
                        <td class="text-right pr-4">$${fieldLabor.crewCost.toFixed(2)}</td>
                    </tr>
                    ${fieldLabor.tearOutCost > 0 ? `
                    <tr class="border-b" style="border-color: #C8A77D;">
                        <td class="py-2 pl-4">Tear out:</td>
                        <td class="text-right pr-4">$${fieldLabor.tearOutCost.toFixed(2)}</td>
                    </tr>` : ''}
                    ${fieldLabor.lineClearingCost > 0 ? `
                    <tr class="border-b" style="border-color: #C8A77D;">
                        <td class="py-2 pl-4">Line clearing:</td>
                        <td class="text-right pr-4">$${fieldLabor.lineClearingCost.toFixed(2)}</td>
                    </tr>` : ''}
                    ${fieldLabor.travellingCost > 0 ? `
                    <tr class="border-b" style="border-color: #C8A77D;">
                        <td class="py-2 pl-4">Travelling cost:</td>
                        <td class="text-right pr-4">$${fieldLabor.travellingCost.toFixed(2)}</td>
                    </tr>` : ''}
                    <tr class="border-b" style="border-color: #C8A77D; background-color: #f8f4e8;">
                        <td class="py-2 text-lg font-semibold pl-4">Field Labor Total:</td>
                        <td class="text-right text-lg font-bold pr-4">$${fieldLabor.total.toFixed(2)}</td>
                    </tr>
                    
                    <tr style="background-color: #f1e8d8;">
                        <td colspan="2" class="py-2 text-lg font-bold pl-4" style="color: #8B2324;">Sub Labour Calculation</td>
                    </tr>
                    <tr class="border-b" style="border-color: #C8A77D;">
                        <td class="py-2 pl-4">Base labor:</td>
                        <td class="text-right pr-4">$${subLabor.baseLabor.toFixed(2)}</td>
                    </tr>
                    ${subLabor.fenceTypeAddOn > 0 ? `
                    <tr class="border-b" style="border-color: #C8A77D;">
                        <td class="py-2 pl-4">Fence type add-on:</td>
                        <td class="text-right pr-4">$${subLabor.fenceTypeAddOn.toFixed(2)}</td>
                    </tr>` : ''}
                    ${subLabor.tearOutCost > 0 ? `
                    <tr class="border-b" style="border-color: #C8A77D;">
                        <td class="py-2 pl-4">Tear out:</td>
                        <td class="text-right pr-4">$${subLabor.tearOutCost.toFixed(2)}</td>
                    </tr>` : ''}
                    ${subLabor.lineClearingCost > 0 ? `
                    <tr class="border-b" style="border-color: #C8A77D;">
                        <td class="py-2 pl-4">Line clearing:</td>
                        <td class="text-right pr-4">$${subLabor.lineClearingCost.toFixed(2)}</td>
                    </tr>` : ''}
                    ${subLabor.baseboardCost > 0 ? `
                    <tr class="border-b" style="border-color: #C8A77D;">
                        <td class="py-2 pl-4">Baseboard:</td>
                        <td class="text-right pr-4">$${subLabor.baseboardCost.toFixed(2)}</td>
                    </tr>` : ''}
                    ${subLabor.capAndTrimCost > 0 ? `
                    <tr class="border-b" style="border-color: #C8A77D;">
                        <td class="py-2 pl-4">Cap and trim:</td>
                        <td class="text-right pr-4">$${subLabor.capAndTrimCost.toFixed(2)}</td>
                    </tr>` : ''}
                    ${subLabor.singleGatesCost > 0 ? `
                    <tr class="border-b" style="border-color: #C8A77D;">
                        <td class="py-2 pl-4">Single gates:</td>
                        <td class="text-right pr-4">$${subLabor.singleGatesCost.toFixed(2)}</td>
                    </tr>` : ''}
                    ${subLabor.doubleGatesCost > 0 ? `
                    <tr class="border-b" style="border-color: #C8A77D;">
                        <td class="py-2 pl-4">Double gates:</td>
                        <td class="text-right pr-4">$${subLabor.doubleGatesCost.toFixed(2)}</td>
                    </tr>` : ''}
                    ${subLabor.slidingGatesCost > 0 ? `
                    <tr class="border-b" style="border-color: #C8A77D;">
                        <td class="py-2 pl-4">Sliding gates:</td>
                        <td class="text-right pr-4">$${subLabor.slidingGatesCost.toFixed(2)}</td>
                    </tr>` : ''}
                    ${subLabor.screwsUpgradeCost > 0 ? `
                    <tr class="border-b" style="border-color: #C8A77D;">
                        <td class="py-2 pl-4">Screws upgrade:</td>
                        <td class="text-right pr-4">$${subLabor.screwsUpgradeCost.toFixed(2)}</td>
                    </tr>` : ''}
                    ${subLabor.travellingCost > 0 ? `
                    <tr class="border-b" style="border-color: #C8A77D;">
                        <td class="py-2 pl-4">Travelling cost:</td>
                        <td class="text-right pr-4">$${subLabor.travellingCost.toFixed(2)}</td>
                    </tr>` : ''}
                    <tr class="border-b" style="border-color: #C8A77D; background-color: #f8f4e8;">
                        <td class="py-2 text-lg font-semibold pl-4">Sub Labor Total:</td>
                        <td class="text-right text-lg font-bold pr-4">$${subLabor.total.toFixed(2)}</td>
                    </tr>
                    
                    <tr class="border-b" style="border-color: #C8A77D; background-color: #e8e0d0;">
                        <td class="py-2 text-lg font-bold pl-4" style="color: #8B2324;">Total Labor Cost:</td>
                        <td class="text-right text-lg font-bold pr-4" style="color: #8B2324;">$${totalLaborCost.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div class="mb-8 p-4 rounded-lg border shadow-md" style="background-color: #f1e8d8; border-color: #9F7B4F;">
            <h4 class="text-lg font-bold mb-2" style="color: #8B2324;">Recommended Crew Size</h4>
            <p class="text-md font-semibold">${recommendedCrew}</p>
        </div>
    `;
    
    // Create the total project cost table (Table 3)
    let totalProjectCostHtml = `
        <div class="overflow-x-auto shadow-md rounded-lg mb-8">
            <table class="min-w-full results-table" style="border: 2px solid #9F7B4F;">
                <thead>
                    <tr style="background-color: #8B2324; color: white;">
                        <th colspan="2" class="text-center py-3 text-xl font-bold">Total Project Cost</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="border-b" style="border-color: #C8A77D;">
                        <td class="py-2 pl-4">Materials Cost:</td>
                        <td class="text-right pr-4">$${materialsCost.toFixed(2)}</td>
                    </tr>
                    <tr class="border-b" style="border-color: #C8A77D;">
                        <td class="py-2 pl-4">Field Labor:</td>
                        <td class="text-right pr-4">$${fieldLabor.total.toFixed(2)}</td>
                    </tr>
                    <tr class="border-b" style="border-color: #C8A77D;">
                        <td class="py-2 pl-4">Sub Labor:</td>
                        <td class="text-right pr-4">$${subLabor.total.toFixed(2)}</td>
                    </tr>
                    <tr class="border-b" style="border-color: #C8A77D;">
                        <td class="py-2 pl-4">Inside Labor (9%):</td>
                        <td class="text-right pr-4">$${insideLabor.toFixed(2)}</td>
                    </tr>
                    <tr class="border-b" style="border-color: #C8A77D;">
                        <td class="py-2 pl-4">Overhead (7%):</td>
                        <td class="text-right pr-4">$${overhead.toFixed(2)}</td>
                    </tr>
                    <tr class="border-b" style="border-color: #C8A77D;">
                        <td class="py-2 pl-4">Sales:</td>
                        <td class="text-right pr-4">$${sales.toFixed(2)}</td>
                    </tr>
                    <tr class="border-b" style="border-color: #C8A77D; background-color: #f8f4e8;">
                        <td class="py-2 text-lg font-semibold pl-4">Subtotal:</td>
                        <td class="text-right text-lg font-bold pr-4">$${costSubtotal.toFixed(2)}</td>
                    </tr>
                    <tr class="border-b" style="border-color: #C8A77D;">
                        <td class="py-2 pl-4">Estimated Selling Price:</td>
                        <td class="text-right pr-4">$${estimatedSellingPrice.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div class="p-4 rounded-lg border shadow-md" style="background-color: #f1e8d8; border-color: #9F7B4F;">
                <h4 class="text-lg font-bold mb-2" style="color: #8B2324;">Standard Profit Option (5%)</h4>
                <table class="w-full">
                    <tr class="border-b" style="border-color: #9F7B4F;">
                        <td class="py-1 pl-2">Subtotal:</td>
                        <td class="text-right font-bold pr-2">$${costSubtotal.toFixed(2)}</td>
                    </tr>
                    <tr class="border-b" style="border-color: #9F7B4F;">
                        <td class="py-1 pl-2">Profit (5% of Base):</td>
                        <td class="text-right font-bold pr-2">$${profit5.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td class="py-2 text-lg font-bold pl-2" style="color: #8B2324;">TOTAL PROJECT COST:</td>
                        <td class="text-right text-xl font-bold pr-2" style="color: #8B2324;">$${totalCost5.toFixed(2)}</td>
                    </tr>
                </table>
            </div>
            
            <div class="p-4 rounded-lg border shadow-md" style="background-color: #8B2324; border-color: #9F7B4F; color: white;">
                <h4 class="text-lg font-bold mb-2 text-white">Premium Profit Option (20%)</h4>
                <table class="w-full">
                    <tr class="border-b" style="border-color: #9F7B4F;">
                        <td class="py-1 pl-2">Subtotal:</td>
                        <td class="text-right font-bold pr-2">$${costSubtotal.toFixed(2)}</td>
                    </tr>
                    <tr class="border-b" style="border-color: #9F7B4F;">
                        <td class="py-1 pl-2">Profit (20% of Base):</td>
                        <td class="text-right font-bold pr-2">$${profit20.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td class="py-2 text-lg font-bold pl-2 text-white">TOTAL PROJECT COST:</td>
                        <td class="text-right text-xl font-bold pr-2 text-white">$${totalCost20.toFixed(2)}</td>
                    </tr>
                </table>
            </div>
        </div>
    `;
    
    // Check if materials calculation has been performed
    if (materialsCost <= 0) {
        laborResultsContainer.innerHTML = `
            <div class="p-4 rounded-lg border shadow-md mb-8" style="background-color: #f8f4e8; border-color: #9F7B4F;">
                <p class="text-center text-lg font-bold" style="color: #8B2324;">Please calculate materials first to see the complete project cost breakdown.</p>
                <p class="text-center">Labor breakdown is shown below:</p>
            </div>
            ${laborTableHtml}
        `;
    } else {
        // Combine all tables
        laborResultsContainer.innerHTML = laborTableHtml + totalProjectCostHtml;
    }
}

// Function to update sliding gate width fields based on the number of sliding gates
function updateSlidingGateFields() {
    const numSlidingGates = parseInt(document.getElementById('numSlidingGates').value) || 0;
    const container = document.getElementById('slidingGateWidthsContainer');
    
    if (!container) return;
    
    // Clear existing fields
    container.innerHTML = '';
    
    // Add fields for each sliding gate
    for (let i = 1; i <= numSlidingGates; i++) {
        const div = document.createElement('div');
        div.className = 'mt-2';
        div.innerHTML = `
            <label for="slidingGateWidth_${i}">Sliding Gate ${i} Width (feet):</label>
            <input type="number" id="slidingGateWidth_${i}" value="8" min="1" step="0.5" oninput="calculateLaborCosts()">
        `;
        container.appendChild(div);
    }
}

// Export functions for use in HTML
window.calculateLaborCosts = calculateLaborCosts;
window.displayLaborResults = displayLaborResults;
window.updateSlidingGateFields = updateSlidingGateFields;
