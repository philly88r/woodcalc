// Wood Fence Calculator - Items 21-33 Calculation Logic
// This file contains the calculation functions for items 21-33

// --- Item 21: Hinge set for double gate ---
function calculateItem21(itemData, inputs) {
    // Formula: number of double gates
    
    const qty = inputs.numDoubleGates;
    const description = "Hinge set for double gate";
    const unitCost = materialCosts.miscMaterials.hingeSetDoubleGate || 0;
    
    // Update item data
    itemData[21] = { 
        ...itemData[21],
        description: description, 
        qty: qty, 
        unitCost: unitCost, 
        totalCost: qty * unitCost 
    };
}

// --- Item 22: Cane bolt set (Wooden privacy) ---
function calculateItem22(itemData, inputs) {
    // Formula: number of double gates * 2
    // Description – 18"
    
    const qty = inputs.numDoubleGates * 2;
    const description = "18\"";
    const unitCost = materialCosts.miscMaterials.caneBoltSet || 0;
    
    // Update item data
    itemData[22] = { 
        ...itemData[22],
        description: description, 
        qty: qty, 
        unitCost: unitCost, 
        totalCost: qty * unitCost 
    };
}

// --- Item 23: Industrial drop latch ---
function calculateItem23(itemData, inputs) {
    // Formula: if Industrial gate latch = "yes", then number of double gates
    
    let qty = 0;
    const description = "Industrial drop latch";
    const unitCost = materialCosts.miscMaterials.industrialDropLatch || 0;
    
    if (inputs.industrialLatch === 'yes') {
        qty = inputs.numDoubleGates;
    }
    
    // Update item data
    itemData[23] = { 
        ...itemData[23],
        description: description, 
        qty: qty, 
        unitCost: unitCost, 
        totalCost: qty * unitCost 
    };
}

// --- Item 24: Industrial drop latch guides ---
function calculateItem24(itemData, inputs) {
    // Formula: if Industrial gate latch = "yes", then number of double gates
    
    let qty = 0;
    const description = "Industrial drop latch guides";
    const unitCost = materialCosts.miscMaterials.industrialDropLatchGuides || 0;
    
    if (inputs.industrialLatch === 'yes') {
        qty = inputs.numDoubleGates;
    }
    
    // Update item data
    itemData[24] = { 
        ...itemData[24],
        description: description, 
        qty: qty, 
        unitCost: unitCost, 
        totalCost: qty * unitCost 
    };
}

// --- Item 25: EMT ---
function calculateItem25(itemData, inputs) {
    // Formula: Quantity of cane bolt set (Wooden privacy)
    
    const qty = itemData[22].qty; // Same as cane bolt set quantity
    const description = "EMT";
    const unitCost = materialCosts.miscMaterials.emt || 0;
    
    // Update item data
    itemData[25] = { 
        ...itemData[25],
        description: description, 
        qty: qty, 
        unitCost: unitCost, 
        totalCost: qty * unitCost 
    };
}

// --- Item 26: Metal frames ---
function calculateItem26(itemData, inputs) {
    // Formula: if metal frame gate = "yes", then number of double gates * 2
    // Description – if baseboard = "none", then "no baseboard" otherwise "with baseboard"
    
    let qty = 0;
    let description = "Not selected";
    let unitCost = 0;
    
    if (inputs.useMetalGateFrames === 'yes') {
        qty = inputs.numDoubleGates * 2;
        
        if (inputs.addBaseboard === 'none') {
            description = "No baseboard";
            unitCost = materialCosts.miscMaterials.metalGateFrame || 0;
        } else {
            description = "With baseboard";
            unitCost = materialCosts.miscMaterials.metalGateFrameWithBaseboard || 0;
        }
    }
    
    // Update item data
    itemData[26] = { 
        ...itemData[26],
        description: description, 
        qty: qty, 
        unitCost: unitCost, 
        totalCost: qty * unitCost 
    };
}

// --- Item 27: Framing screws ---
function calculateItem27(itemData, inputs) {
    // Formula: roundup (if type of post = 4x4, 4x6 or 6x6, then (quantity of 2x4x10 treated + quantity of 2x4x12 treated + 
    // quantity of 2x6x16 + quantity of 2x12x16)*12 + quantity of 2x4x16 * 10) / 100)
    // Description – Star head wood deck screws - 3"
    
    let qty = 0;
    const description = "Star head wood deck screws - 3\"";
    const unitCost = materialCosts.miscMaterials.starHeadScrews3inch_price_per_100 || 0;
    
    // Check if post type is wooden
    const postInfo = parsePostType(inputs.standardPostType);
    if (postInfo.material.startsWith('wood_')) {
        // Calculate total screws needed
        const screwCount = (itemData[10].qty + itemData[11].qty + itemData[13].qty + itemData[14].qty) * 12 +
                          itemData[12].qty * 10;
        
        // Convert to boxes (100 screws per box)
        qty = Math.ceil(screwCount / 100);
    }
    
    // Update item data
    itemData[27] = { 
        ...itemData[27],
        description: description, 
        qty: qty, 
        unitCost: unitCost, 
        totalCost: qty * unitCost 
    };
}

// --- Item 28: Picket nails ---
function calculateItem28(itemData, inputs) {
    // Formula: roundup (if screws = "no", total linear length (with gates) / 22)
    
    let qty = 0;
    const description = "Picket nails";
    const unitCost = materialCosts.miscMaterials.picketNailsRoll || 0;
    
    if (inputs.useScrews === 'No') {
        qty = Math.ceil(inputs.totalLengthWithGates / 22);
    }
    
    // Update item data
    itemData[28] = { 
        ...itemData[28],
        description: description, 
        qty: qty, 
        unitCost: unitCost, 
        totalCost: qty * unitCost 
    };
}

// --- Item 29: Star head wood deck screws - 1 5/8" ---
function calculateItem29(itemData, inputs) {
    // Formula: roundup (if screws = "yes", quantity of pickets * number of rails * 2)
    
    let qty = 0;
    const description = "Star head wood deck screws - 1 5/8\"";
    const unitCost = materialCosts.miscMaterials.starHeadScrews1_5inch_price_per_100 / 100 || 0;
    
    if (inputs.useScrews === 'Yes') {
        // Calculate total pickets (Item 6 + Item 7)
        const totalPickets = itemData[6].qty + itemData[7].qty;
        
        // Calculate total screws
        qty = Math.ceil(totalPickets * inputs.numRails * 2);
    }
    
    // Update item data
    itemData[29] = { 
        ...itemData[29],
        description: description, 
        qty: qty, 
        unitCost: unitCost, 
        totalCost: qty * unitCost 
    };
}

// --- Item 30: Wedge anchors ---
function calculateItem30(itemData, inputs) {
    // Formula: (Quantity of flange post centered + quantity of flanged post off centered) * 4
    // Description – 1/2" x 3 3/4"
    
    const qty = (inputs.numFlangedCentered + inputs.numFlangedOffCentered) * 4;
    const description = "1/2\" x 3 3/4\"";
    const unitCost = materialCosts.miscMaterials.wedgeAnchor || 0;
    
    // Update item data
    itemData[30] = { 
        ...itemData[30],
        description: description, 
        qty: qty, 
        unitCost: unitCost, 
        totalCost: qty * unitCost 
    };
}

// --- Item 31: Cantilever / sliding gate post ---
function calculateItem31(itemData, inputs) {
    // Formula: number of sliding gate * 3
    // Description – 4" x (if height of fence is 6, then 9) or (if height of fence is 8, then 12) Sch 40
    
    const qty = inputs.numSlidingGates * 3;
    let description = "";
    // Get the correct post length based on fence height
    const postLength = inputs.fenceHeight === 6 ? "9" : "12";
    const unitCost = materialCosts.posts.schedule40_4inch?.[postLength] || 0;
    
    // Debug logging to help identify issues
    console.log(`Cantilever post - Fence height: ${inputs.fenceHeight}, Post length: ${postLength}`);
    console.log(`Looking up cost with key: schedule40_4inch, Length: ${postLength}, Found cost: ${unitCost}`);
    
    // Set description based on fence height
    if (inputs.fenceHeight === 6) {
        description = "4\" x 9 Sch 40";
    } else if (inputs.fenceHeight === 8) {
        description = "4\" x 12 Sch 40";
    } else {
        description = "4\" x 12 Sch 40"; // Default
    }
    
    // Update item data
    itemData[31] = { 
        ...itemData[31],
        description: description, 
        qty: qty, 
        unitCost: unitCost, 
        totalCost: qty * unitCost 
    };
}

// --- Item 32: Cantilever / sliding gate rollers ---
function calculateItem32(itemData, inputs) {
    // Formula: number of sliding gate * 4
    
    const qty = inputs.numSlidingGates * 4;
    const description = "Cantilever / sliding gate rollers";
    const unitCost = materialCosts.miscMaterials.cantileverRoller || 0;
    
    // Update item data
    itemData[32] = { 
        ...itemData[32],
        description: description, 
        qty: qty, 
        unitCost: unitCost, 
        totalCost: qty * unitCost 
    };
}

// --- Item 33: Cantilever / sliding gate latch ---
function calculateItem33(itemData, inputs) {
    // Formula: number of sliding gate
    
    const qty = inputs.numSlidingGates;
    const description = "Cantilever / sliding gate latch";
    const unitCost = materialCosts.miscMaterials.cantileverLatch || 0;
    
    // Update item data
    itemData[33] = { 
        ...itemData[33],
        description: description, 
        qty: qty, 
        unitCost: unitCost, 
        totalCost: qty * unitCost 
    };
}

// Export functions
window.calculateItem21 = calculateItem21;
window.calculateItem22 = calculateItem22;
window.calculateItem23 = calculateItem23;
window.calculateItem24 = calculateItem24;
window.calculateItem25 = calculateItem25;
window.calculateItem26 = calculateItem26;
window.calculateItem27 = calculateItem27;
window.calculateItem28 = calculateItem28;
window.calculateItem29 = calculateItem29;
window.calculateItem30 = calculateItem30;
window.calculateItem31 = calculateItem31;
window.calculateItem32 = calculateItem32;
window.calculateItem33 = calculateItem33;
