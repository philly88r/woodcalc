// Wood Fence Calculator - Items 11-20 Calculation Logic
// This file contains the calculation functions for items 11-20

// --- Item 11: 2x4x12 treated ---
function calculateItem11(itemData, inputs) {
    // Formula: (if vertical, if double gate width greater than 10' then quantity of gate * 3) + 
    // (if post spacing = 6 AND vertical, total linear length (with gates) / 7 * number of rails + 
    // if double gate width <= 8' then quantity of gate * 3)
    
    let qty = 0;
    const description = "2x4x12 treated";
    const unitCost = materialCosts.miscMaterials["2x4x12Treated"] || materialCosts.boards.treated?.["2x4x12"] || 0;
    
    if (inputs.fenceOrientation === 'Vertical') {
        // Part 1: For double gates wider than 10'
        let part1 = 0;
        for (let i = 0; i < inputs.doubleGateWidths.length; i++) {
            const width = inputs.doubleGateWidths[i];
            if (width > 10) {
                part1 += 3;
            }
        }
        
        // Part 2: For post spacing = 6 AND vertical
        let part2 = 0;
        if (inputs.postSpacing === 6) {
            // Calculate rails for fence
            part2 += (inputs.totalLengthWithGates / 7) * inputs.numRails;
            
            // Add rails for double gates <= 8'
            let doubleGatesLte8 = 0;
            for (let i = 0; i < inputs.doubleGateWidths.length; i++) {
                const width = inputs.doubleGateWidths[i];
                if (width <= 8 && width > 0) {
                    doubleGatesLte8++;
                }
            }
            part2 += doubleGatesLte8 * 3;
        }
        
        qty = Math.ceil(part1 + part2);
    }
    
    // Update item data
    itemData[11] = { 
        ...itemData[11],
        description: description, 
        qty: qty, 
        unitCost: unitCost, 
        totalCost: qty * unitCost 
    };
}

// --- Item 12: 2x4x16 treated ---
function calculateItem12(itemData, inputs) {
    // Formula: (if post spacing = 4, total linear length (with gates) / 3.5 * number of rails + 
    // if double gate width <= 8', quantity of gate * 3) + 
    // (if post spacing = 8, total linear length (with gates) / 7 * number of rails + 
    // if double gate width <= 8', quantity of gate * 3)
    
    let qty = 0;
    const description = "2x4x16 treated";
    const unitCost = materialCosts.miscMaterials["2x4x16Treated"] || materialCosts.boards.treated?.["2x4x16"] || 0;
    
    if (inputs.fenceOrientation === 'Vertical') {
        // Count double gates <= 8'
        let doubleGatesLte8 = 0;
        for (let i = 0; i < inputs.doubleGateWidths.length; i++) {
            const width = inputs.doubleGateWidths[i];
            if (width <= 8 && width > 0) {
                doubleGatesLte8++;
            }
        }
        const gateRails = doubleGatesLte8 * 3;
        
        // Calculate based on post spacing
        if (inputs.postSpacing === 4) {
            qty = (inputs.totalLengthWithGates / 3.5) * inputs.numRails + gateRails;
        } else if (inputs.postSpacing === 8) {
            qty = (inputs.totalLengthWithGates / 7) * inputs.numRails + gateRails;
        }
        
        qty = Math.ceil(qty);
    }
    
    // Update item data
    itemData[12] = { 
        ...itemData[12],
        description: description, 
        qty: qty, 
        unitCost: unitCost, 
        totalCost: qty * unitCost 
    };
}

// --- Item 13: 2x6x16 treated ---
function calculateItem13(itemData, inputs) {
    // Formula: if baseboard = 2x6, total linear length (without gates) / 16
    
    let qty = 0;
    const description = "2x6x16 treated";
    const unitCost = materialCosts.miscMaterials["2x6x16Treated"] || materialCosts.boards.treated?.["2x6x16"] || 0;
    
    if (inputs.addBaseboard === 'yes' && inputs.baseboardMaterialSize === '2x6') {
        qty = Math.ceil(inputs.totalLengthWithoutGates / 16);
    }
    
    // Update item data
    itemData[13] = { 
        ...itemData[13],
        description: description, 
        qty: qty, 
        unitCost: unitCost, 
        totalCost: qty * unitCost 
    };
}

// --- Item 14: 2x12x16 treated ---
function calculateItem14(itemData, inputs) {
    // Formula: if baseboard = 2x12, total linear length (without gates) / 16
    
    let qty = 0;
    const description = "2x12x16 treated";
    const unitCost = materialCosts.miscMaterials["2x12x16Treated"] || materialCosts.boards.treated?.["2x12x16"] || 0;
    
    if (inputs.addBaseboard === 'yes' && inputs.baseboardMaterialSize === '2x12') {
        qty = Math.ceil(inputs.totalLengthWithoutGates / 16);
    }
    
    // Update item data
    itemData[14] = { 
        ...itemData[14],
        description: description, 
        qty: qty, 
        unitCost: unitCost, 
        totalCost: qty * unitCost 
    };
}

// --- Item 15: Cap ---
function calculateItem15(itemData, inputs) {
    // Formula: if type of cap not "none", total linear length (with gates) / 7
    // Description – type of cap x 8 and type of wood for cap & trim
    
    let qty = 0;
    let description = "None";
    let unitCost = 0;
    
    if (inputs.capBoardType !== 'none') {
        qty = Math.ceil(inputs.totalLengthWithGates / 7);
        
        // Set description
        description = `${inputs.capBoardType} x 8 ${inputs.capBoardWoodType}`;
        
        // Set unit cost
        const capKey = `${inputs.capBoardType}x8`;
        unitCost = materialCosts.boards[inputs.capBoardWoodType.toLowerCase()]?.[capKey] || 0;
    }
    
    // Update item data
    itemData[15] = { 
        ...itemData[15],
        description: description, 
        qty: qty, 
        unitCost: unitCost, 
        totalCost: qty * unitCost 
    };
}

// --- Item 16: Trim ---
function calculateItem16(itemData, inputs) {
    // Formula: if type of trim not "none", total linear length (with gates) / 7
    // Description – type of trim x 8 and type of wood for cap & trim
    
    let qty = 0;
    let description = "None";
    let unitCost = 0;
    
    if (inputs.trimType !== 'none') {
        qty = Math.ceil(inputs.totalLengthWithGates / 7);
        
        // Set description
        description = `${inputs.trimType} x 8 ${inputs.trimWoodType}`;
        
        // Set unit cost
        const trimKey = `${inputs.trimType}x8`;
        unitCost = materialCosts.boards[inputs.trimWoodType.toLowerCase()]?.[trimKey] || 0;
    }
    
    // Update item data
    itemData[16] = { 
        ...itemData[16],
        description: description, 
        qty: qty, 
        unitCost: unitCost, 
        totalCost: qty * unitCost 
    };
}

// --- Item 17: Pipe tie/ wood to metal connector ---
function calculateItem17(itemData, inputs) {
    // Formula: if type of post is Sch 20 or Sch 40, then (number of rails + 1 if baseboard = 2x6 + 2 if baseboard = 2x12) * 
    // (Quantity of post + quantity of flanged post centered + quantity of flanged post off centered)
    
    let qty = 0;
    const description = "Pipe tie/ wood to metal connector";
    const unitCost = materialCosts.miscMaterials.pipeTie || 0;
    
    // Check if post type is schedule 20 or 40
    const postInfo = parsePostType(inputs.standardPostType);
    if (postInfo.material.startsWith('schedule')) {
        // Calculate connectors needed per post
        let connectorsPerPost = inputs.numRails;
        
        // Add for baseboard if present
        if (inputs.addBaseboard === 'yes') {
            if (inputs.baseboardMaterialSize === '2x6') {
                connectorsPerPost += 1;
            } else if (inputs.baseboardMaterialSize === '2x12') {
                connectorsPerPost += 2;
            }
        }
        
        // Calculate total posts (standard + flanged)
        const totalPosts = itemData[1].qty + inputs.numFlangedCentered + inputs.numFlangedOffCentered;
        
        // Calculate total quantity
        qty = connectorsPerPost * totalPosts;
    }
    
    // Update item data
    itemData[17] = { 
        ...itemData[17],
        description: description, 
        qty: qty, 
        unitCost: unitCost, 
        totalCost: qty * unitCost 
    };
}

// --- Item 18: Post cap ---
function calculateItem18(itemData, inputs) {
    // Formula: if type of post is Sch 20 or Sch 40, then quantity of post + quantity of flanged post centered + quantity of flanged post off centered
    // Description – 2 3/8"
    
    let qty = 0;
    const description = "2 3/8\"";
    const unitCost = materialCosts.miscMaterials.postCap || 0;
    
    // Check if post type is schedule 20 or 40
    const postInfo = parsePostType(inputs.standardPostType);
    if (postInfo.material.startsWith('schedule')) {
        // Calculate total posts (standard + flanged)
        qty = itemData[1].qty + inputs.numFlangedCentered + inputs.numFlangedOffCentered;
    }
    
    // Update item data
    itemData[18] = { 
        ...itemData[18],
        description: description, 
        qty: qty, 
        unitCost: unitCost, 
        totalCost: qty * unitCost 
    };
}

// --- Item 19: Lag screw (100pc) ---
function calculateItem19(itemData, inputs) {
    // Formula: Round up (Quantity of pipe grip tie * 4 / 100)
    // Description – 1/4" x 1 1/2"
    
    let qty = 0;
    const description = "1/4\" x 1 1/2\"";
    const unitCost = materialCosts.miscMaterials.lagScrew100pc || 0;
    
    // Calculate based on pipe ties (Item 17)
    if (itemData[17].qty > 0) {
        qty = Math.ceil((itemData[17].qty * 4) / 100);
    }
    
    // Update item data
    itemData[19] = { 
        ...itemData[19],
        description: description, 
        qty: qty, 
        unitCost: unitCost, 
        totalCost: qty * unitCost 
    };
}

// --- Item 20: Gate hardware ---
function calculateItem20(itemData, inputs) {
    // Formula: number of single gates + number of double gates
    // Description – Hinge post latch kit
    
    const qty = inputs.numSingleGates + inputs.numDoubleGates;
    const description = "Hinge post latch kit";
    const unitCost = materialCosts.miscMaterials.gateHingePostLatchKit || 0;
    
    // Update item data
    itemData[20] = { 
        ...itemData[20],
        description: description, 
        qty: qty, 
        unitCost: unitCost, 
        totalCost: qty * unitCost 
    };
}

// Export functions
window.calculateItem11 = calculateItem11;
window.calculateItem12 = calculateItem12;
window.calculateItem13 = calculateItem13;
window.calculateItem14 = calculateItem14;
window.calculateItem15 = calculateItem15;
window.calculateItem16 = calculateItem16;
window.calculateItem17 = calculateItem17;
window.calculateItem18 = calculateItem18;
window.calculateItem19 = calculateItem19;
window.calculateItem20 = calculateItem20;
