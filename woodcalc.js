// Wood Fence Calculator - Calculation Logic
// This file contains the calculation functions for the Wood Fence Calculator

// Material costs object - all pricing data
const materialCosts = {
    posts: {
        wood_treated_4x4: { "8": 11.40, "10": 13.84, "12": 16.72 },
        wood_treated_4x6: { "8": 17.55, "10": 27.67, "12": 24.78 },
        wood_treated_6x6: { "8": 28.59, "10": 55.29, "12": 63.97 },
        wood_cedar_4x4: { "8": 11.40, "10": 15.00, "12": 18.00 }, 
        wood_cedar_4x6: { "8": 20.00, "10": 30.00, "12": 35.00 }, 
        wood_cedar_6x6: { "8": 30.00, "10": 60.00, "12": 70.00 }, 
        postMaster: { "8": 29.72, "10": 72.68, "12": 89.78 }, 
        schedule20_2_3_8: { "5": 15.00, "6": 18.00, "7": 21.00, "8": 24.00, "9": 27.00, "10.5": 31.50, "12": 36.00 }, 
        schedule40_2_3_8: { "5": 19.55, "6": 23.46, "7": 27.37, "8": 31.28, "9": 35.19, "10.5": 41.446, "12": 46.92 },
        schedule40_4inch: { "9": 50.00, "12": 65.00 } 
    },
    pickets: { 
        pine: { "4": 1.50, "5": 1.80, "6": 2.10, "8": 3.53 }, 
        cedar: { "4": 2.00, "5": 2.30, "6": 2.61, "8": 4.17 }
    },
    boards: { 
        pine: { 
            "1x4x8": 3.16, "2x4x8": 3.74, "2x6x8": 7.83, "2x8x8": 11.51, "2x12x8": 20.00, 
            "1x4x10": 4.00, "2x4x10": 5.01, "2x6x10": 9.80, "2x8x10": 14.50, "2x12x10": 25.00, 
            "1x4x12": 4.75, "2x4x12": 7.67, "2x6x12": 11.75, "2x8x12": 17.25, "2x12x12": 30.00, 
            "1x4x16": 6.50, "2x4x16": 11.08, "2x6x16": 14.98, "2x8x16": 23.00, "2x12x16": 42.26 
        },
        cedar: { 
            "1x4x8": 4.61, "2x4x8": 9.88, "2x6x8": 16.66, "2x8x8": 16.66, "2x12x8": 35.00, 
            "1x4x10": 5.80, "2x4x10": 12.35, "2x6x10": 20.80, "2x8x10": 20.80, "2x12x10": 44.00, 
            "1x4x12": 6.90, "2x4x12": 14.80, "2x6x12": 25.00, "2x8x12": 25.00, "2x12x12": 52.00, 
            "1x4x16": 9.20, "2x4x16": 19.70, "2x6x16": 33.30, "2x8x16": 33.30, "2x12x16": 70.00 
        }
    },
    concrete: { red: 8.53, yellow: 5.89, truck: 170.00 },
    miscMaterials: { 
        "2x4x8Treated": 3.74, "2x4x10Treated": 5.01, "2x4x12Treated": 7.67, "2x4x16Treated": 11.08,
        "2x6x8Treated": 7.83, "2x6x10Treated": 9.80, "2x6x12Treated": 11.75, "2x6x16Treated": 14.98,
        "2x8x8Treated": 11.51, "2x8x10Treated": 14.50, "2x8x12Treated": 17.25, "2x8x16Treated": 23.00,
        "2x12x8Treated": 28.00, "2x12x10Treated": 35.00, "2x12x12Treated": 40.00, "2x12x16Treated": 42.26, 
        "gateHingePostLatchKit": 32.34,
        "hingeSetDoubleGate": 15.00,
        "caneBoltSet": 22.05, 
        "starHeadScrews3inch_price_per_100": 7.84, 
        "starHeadScrews1_5inch_price_per_100": 10.00,
        "picketNailsRoll": 11.27, 
        "cedarGateRail2x4x8": 9.88, 
        "postCap": 1.28, 
        "beveledDeckBoard54x12x8": 8.42,
        "metalGateFrame": 250.00,
        "metalGateFrameWithBaseboard": 275.00,
        "industrialDropLatch": 51.94, 
        "industrialDropLatchGuides": 5.00, 
        "emt": 3.00, 
        "flange": 18.57, 
        "pipeTie": 1.72, 
        "lagScrew100pc": 19.60, 
        "wedgeAnchor": 1.00,
        "cantileverRoller": 83.30, 
        "cantileverLatch": 22.68
    }
};

// Helper functions
function getInputValue(id, isNumeric = true) {
    const element = document.getElementById(id);
    if (!element) {
        console.error(\`Input element ${id} missing.\`);
        return isNumeric ? 0 : "";
    }
    const value = element.value;
    if (isNumeric) {
        const numValue = parseFloat(value);
        // Add validation: Check if it's a number and non-negative
        if (isNaN(numValue) || numValue < 0) {
            // Optionally, provide user feedback here
            console.warn(\`Invalid or negative input for ${id}: ${value}. Using 0.\`);
            return 0;
        }
        return numValue;
    }
    return value;
}


function addResultRow(results, itemNumber, item, description, qty, unitCost, totalCost) {
    const numericQty = parseFloat(qty) || 0;
    const numericUnitCost = parseFloat(unitCost) || 0;
    const numericTotalCost = parseFloat(totalCost) || 0;
    results.html += \`<tr><td>${itemNumber}</td><td>${item}</td><td>${description}</td><td>${numericQty.toFixed(numericQty % 1 === 0 ? 0 : 2)}</td><td>$${numericUnitCost.toFixed(2)}</td><td>$${numericTotalCost.toFixed(2)}</td></tr>\`;
    if (numericTotalCost > 0) { results.grandTotal += numericTotalCost; }
}

function parsePostType(postTypeValue) {
    const parts = postTypeValue.split('_');
    if (parts[0] === 'wood') { return { material: \`${parts[0]}_\${parts[1]}\`, size: parts[2] }; } 
    else if (parts[0] === 'postMaster') { return { material: 'postMaster', size: null }; } 
    else if (parts[0] === 'schedule20' || parts[0] === 'schedule40') { return { material: parts[0], size: parts[1].replace('-', '.') }; }
    return { material: 'unknown', size: null };
}

function getRequiredPostLength(postTypeKey, fenceHeightFt, holeDepthFt) {
    const totalHeight = fenceHeightFt + holeDepthFt;
    
    if (postTypeKey.startsWith('wood_') || postTypeKey === 'postMaster') {
        if (totalHeight <= 8.5) return "8";
        if (totalHeight <= 10.5) return "10";
        if (totalHeight <= 12.5) return "12";
        return "12"; // Default to max if over
    } else if (postTypeKey.startsWith('schedule')) {
        if (postTypeKey.endsWith('_4inch')) { // Cantilever posts
            if (totalHeight <= 9) return "9"; 
            if (totalHeight <= 12) return "12"; 
            return "12";
        } else { // Standard Sch20/40 2-3/8"
            if (totalHeight <= 5.5) return "5";
            if (totalHeight <= 6.5) return "6";
            if (totalHeight <= 7.5) return "7";
            if (totalHeight <= 8.5) return "8";
            if (totalHeight <= 9.5) return "9";
            if (totalHeight <= 11) return "10.5";
            if (totalHeight <= 12.5) return "12";
            return postTypeKey.startsWith('schedule40_') ? "12" : "8"; 
        }
    }
    console.warn("Unknown post type for length calculation:", postTypeKey);
    return "8"; // Default
}

// Main calculation function - Definition is in woodcalc-main.js
// window.calculateFence = calculateFence; // This is exported in woodcalc-main.js

// Export functions for use in HTML (already in woodcalc-main.js, but keeping here for clarity if needed)
window.getInputValue = getInputValue;
window.addResultRow = addResultRow;
window.parsePostType = parsePostType;
window.getRequiredPostLength = getRequiredPostLength;
window.materialCosts = materialCosts;