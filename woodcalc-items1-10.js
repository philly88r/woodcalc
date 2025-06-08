// Wood Fence Calculator - Items 1-10 Calculation Logic
// This file contains the calculation functions for items 1-10

// --- Item 1: Post ---
function calculateItem1(itemData, inputs) {
    /* 
    Formula: 
    Step 1: For each fence section: (length-1) ÷ post spacing, round down, then add 2 end posts
    Step 2: Add all fence runs together
    Step 3: Subtract corner overlaps and gate openings
    Total Posts = [Sum of all fence runs] - [Corner overlaps] - [Gate openings]
    */
    let qty = 0;
    let description = "";
    let unitCost = 0;
    
    // Step 1 & 2: Calculate for each pull length and sum them
    inputs.pullLengths.forEach(pullLength => {
        if (pullLength > 0 && inputs.postSpacing > 0) {
            // For each section: (length-1) ÷ spacing, round down, add 2 end posts
            qty += Math.floor((pullLength - 1) / inputs.postSpacing) + 2;
        }
    });
    
    // Step 3: Subtract corner overlaps (where fence runs connect)
    // Each corner connects two fence runs, so we subtract one post per corner
    if (inputs.numCorners > 0) {
        qty -= inputs.numCorners;
    }
    
    // Step 3 continued: Subtract gate openings
    // For each gate, we subtract one post since gates replace fence sections
    const totalGates = inputs.numSingleGates + inputs.numDoubleGates + inputs.numSlidingGates;
    if (totalGates > 0) {
        qty -= totalGates;
    }
    
    // Get post type and determine description based on height
    const postInfo = parsePostType(inputs.standardPostType);
    const totalHeight = inputs.fenceHeight + (inputs.holeDepthInches / 12); // fence height + hole depth
    
    // Set description and unit cost based on post type and required length
    if (postInfo.material.startsWith('wood_') || postInfo.material === 'postMaster') {
        // For wooden posts or post master
        let postLength;
        if (totalHeight <= 8.5) postLength = "8";
        else if (totalHeight <= 10.5) postLength = "10";
        else if (totalHeight <= 12.5) postLength = "12";
        else postLength = "12"; // Default to max
        
        description = `${postInfo.size} x ${postLength}ft ${postInfo.material.split('_')[1] || 'Post Master'}`;
        unitCost = materialCosts.posts[postInfo.material]?.[postLength] || 0;
    } else if (postInfo.material.startsWith('schedule')) {
        // For schedule 20 or schedule 40
        let postLength;
        if (totalHeight <= 5.5) postLength = "5";
        else if (totalHeight <= 6.5) postLength = "6";
        else if (totalHeight <= 7.5) postLength = "7";
        else if (totalHeight <= 8.5) postLength = "8";
        else if (totalHeight <= 9.5) postLength = "9";
        else if (totalHeight <= 11) postLength = "10.5";
        else if (totalHeight <= 12.5) postLength = "12";
        else postLength = postInfo.material.startsWith('schedule40_') ? "12" : "8";
        
        // Format the description properly
        description = `${postInfo.size.replace('.', '-')} x ${postLength}ft ${postInfo.material}`;
        
        // For schedule posts, we need to construct the key differently
        // The key in materialCosts.posts is like 'schedule20_2_3_8' or 'schedule40_2_3_8'
        const scheduleKey = `${postInfo.material}_${postInfo.size.replace('.', '_')}`;
        unitCost = materialCosts.posts[scheduleKey]?.[postLength] || 0;
        
        // Debug logging to help identify issues
        console.log(`Post type: ${inputs.standardPostType}, Material: ${postInfo.material}, Size: ${postInfo.size}`);
        console.log(`Looking up cost with key: ${scheduleKey}, Length: ${postLength}, Found cost: ${unitCost}`);
    }
    
    // Update item data
    itemData[1] = { 
        ...itemData[1],
        description: description, 
        qty: qty, 
        unitCost: unitCost, 
        totalCost: qty * unitCost 
    };
}

// --- Item 2: 4x4x8 incense cedar gate posts ---
function calculateItem2(itemData, inputs) {
    // Formula: If wooden post 4x4 4x6 6x6 AND fence height <= 6, then number of single gates x 2
    let qty = 0;
    const description = "4x4x8 incense cedar";
    const unitCost = materialCosts.posts['wood_cedar_4x4']?.[8] || 0;
    
    // Check if standard post is wooden and fence height <= 6
    const postInfo = parsePostType(inputs.standardPostType);
    if (postInfo.material.startsWith('wood_') && inputs.fenceHeight <= 6) {
        qty = inputs.numSingleGates * 2;
    }
    
    // Update item data
    itemData[2] = { 
        ...itemData[2],
        description: description, 
        qty: qty, 
        unitCost: unitCost, 
        totalCost: qty * unitCost 
    };
}

// --- Item 3 & 4: Flanged posts ---
function calculateItems3And4(itemData, inputs) {
    // Formula: Quantity = number of flanged posts entered in question
    // Description – 2 3/8" x height of post Sch 20
    
    const item3Desc = `2 3/8" x ${inputs.flangedPostHeight}ft Sch 20`;
    const item3UnitCost = materialCosts.posts['schedule20_2_3_8']?.[inputs.flangedPostHeight] || 0;
    
    const item4Desc = `2 3/8" x ${inputs.flangedPostHeight}ft Sch 20`;
    const item4UnitCost = materialCosts.posts['schedule20_2_3_8']?.[inputs.flangedPostHeight] || 0;
    
    // Update item data
    itemData[3] = { 
        ...itemData[3],
        description: item3Desc, 
        qty: inputs.numFlangedCentered, 
        unitCost: item3UnitCost, 
        totalCost: inputs.numFlangedCentered * item3UnitCost 
    };
    
    itemData[4] = { 
        ...itemData[4],
        description: item4Desc, 
        qty: inputs.numFlangedOffCentered, 
        unitCost: item4UnitCost, 
        totalCost: inputs.numFlangedOffCentered * item4UnitCost 
    };
}

// --- Item 5: Concrete ---
function calculateItem5(itemData, inputs) {
    // Formula: Concrete of 1 hole = (volume of 1 hole – volume of post in the ground) *133 / 60
    // Quantity of yellow/red concrete = Concrete of 1 hole * number of post * 1.1
    // Quantity of truck concrete = Concrete of 1 hole * number of post * 1.1 / 59
    
    let qty = 0;
    let description = inputs.concreteType;
    let unitCost = 0;
    
    // Calculate total number of posts
    const totalPosts = itemData[1].qty + itemData[2].qty + itemData[3].qty + itemData[4].qty;
    
    if (totalPosts > 0) {
        // Calculate concrete volume per hole
        const holeRadiusFt = (inputs.holeWidthInches / 2) / 12;
        const holeDepthFt = inputs.holeDepthInches / 12;
        const holeVolume = Math.PI * Math.pow(holeRadiusFt, 2) * holeDepthFt;
        
        // Estimate post volume in ground (simplified)
        let postVolume = 0;
        const postInfo = parsePostType(inputs.standardPostType);
        if (postInfo.size === '4x4') {
            postVolume = (3.5 * 3.5 / 144) * holeDepthFt; // 4x4 actual size is 3.5"x3.5"
        } else if (postInfo.size === '4x6') {
            postVolume = (3.5 * 5.5 / 144) * holeDepthFt; // 4x6 actual size is 3.5"x5.5"
        } else if (postInfo.size === '6x6') {
            postVolume = (5.5 * 5.5 / 144) * holeDepthFt; // 6x6 actual size is 5.5"x5.5"
        } else if (postInfo.size === '2-3/8' || postInfo.size === '2.3/8') {
            // For round pipe posts, calculate volume using πr²h
            const postRadiusFt = (2.375 / 2) / 12;
            postVolume = Math.PI * Math.pow(postRadiusFt, 2) * holeDepthFt;
        }
        
        // Calculate concrete needed per hole
        const concretePerHole = (holeVolume - postVolume) * 133 / 60;
        
        // Calculate quantity based on concrete type
        if (inputs.concreteType === 'truck') {
            // Convert to cubic yards (1 cubic yard = 27 cubic feet)
            qty = (concretePerHole * totalPosts * 1.1) / 59;
            unitCost = materialCosts.concrete.truck;
            description = "Truck concrete";
        } else if (inputs.concreteType === 'red') {
            qty = concretePerHole * totalPosts * 1.1;
            unitCost = materialCosts.concrete.red;
            description = "Red concrete bags";
        } else if (inputs.concreteType === 'yellow') {
            qty = concretePerHole * totalPosts * 1.1;
            unitCost = materialCosts.concrete.yellow;
            description = "Yellow concrete bags";
        }
        
        // Round up to nearest whole number for bags
        if (inputs.concreteType !== 'truck') {
            qty = Math.ceil(qty);
        }
    }
    
    // Update item data
    itemData[5] = { 
        ...itemData[5],
        description: description, 
        qty: qty, 
        unitCost: unitCost, 
        totalCost: qty * unitCost 
    };
}

// --- Item 6: Picket ---
function calculateItem6(itemData, inputs) {
    // Formula depends on fence style:
    // If type of wooden fence is picket style: total linear length (with gates) *12 / (7 * width of picket / 6)
    // If type of wooden fence is privacy: total linear length (with gates) *12 / (5.5 * width of picket / 6)
    // If type of wooden fence is shadowboxed or board on board: total linear length (with gates) *12 / (3.5 * width of picket / 6)
    
    let qty = 0;
    let description = "";
    let unitCost = 0;
    
    // Only calculate if not using beveled deck board
    if (inputs.picketType !== 'beveled_deck_board') {
        let divisor;
        if (inputs.fenceStyle === 'Picket Style') {
            divisor = 7 * inputs.picketWidth / 6;
        } else if (inputs.fenceStyle === 'Privacy') {
            divisor = 5.5 * inputs.picketWidth / 6;
        } else if (inputs.fenceStyle === 'Shadowbox' || inputs.fenceStyle === 'Board on Board') {
            divisor = 3.5 * inputs.picketWidth / 6;
        } else {
            divisor = 5.5 * inputs.picketWidth / 6; // Default to privacy
        }
        
        // Calculate quantity
        qty = Math.ceil((inputs.totalLengthWithGates * 12) / divisor);
        
        // Set description
        const picketHeight = inputs.fenceHeight === 8 ? '8' : '6';
        description = `${picketHeight}' ${inputs.picketType}`;
        
        // Set unit cost
        const picketTypeWood = ['pine', 'cedar'].includes(inputs.picketType) ? inputs.picketType : 'pine';
        unitCost = materialCosts.pickets[picketTypeWood]?.[picketHeight] || 0;
    }
    
    // Update item data
    itemData[6] = { 
        ...itemData[6],
        description: description, 
        qty: qty, 
        unitCost: unitCost, 
        totalCost: qty * unitCost 
    };
}

// --- Item 7: Picket for gate with baseboard ---
function calculateItem7(itemData, inputs) {
    // Formula: if baseboard not 'none' AND height of fence = 6, then total of all gate widths (in feet) * 2.5
    // Description – (if metal frame = 6' , otherwise 8') and type of picket
    
    let qty = 0;
    let description = "";
    let unitCost = 0;
    
    if (inputs.addBaseboard === 'yes' && inputs.fenceHeight === 6) {
        // Calculate total gate width
        let totalGateWidth = 0;
        inputs.singleGateWidths.forEach(w => totalGateWidth += w);
        inputs.doubleGateWidths.forEach(w => totalGateWidth += w);
        inputs.slidingGateWidths.forEach(w => totalGateWidth += w);
        
        // Calculate quantity
        qty = totalGateWidth * 2.5;
        
        // Set description
        const picketHeight = inputs.useMetalGateFrames === 'yes' ? '6' : '8';
        const picketTypeWood = ['pine', 'cedar'].includes(inputs.picketType) ? inputs.picketType : 'pine';
        description = `${picketHeight}' ${picketTypeWood}`;
        
        // Set unit cost
        unitCost = materialCosts.pickets[picketTypeWood]?.[picketHeight] || 0;
    }
    
    // Update item data
    itemData[7] = { 
        ...itemData[7],
        description: description, 
        qty: qty, 
        unitCost: unitCost, 
        totalCost: qty * unitCost 
    };
}

// --- Item 8: 5/4 x 12 beveled deck board ---
function calculateItem8(itemData, inputs) {
    // Formula: if horizontal AND Beveled deck board, then height of fence * 12 / 5 * (total linear length) /12
    
    let qty = 0;
    let description = "5/4 x 12 beveled deck board";
    let unitCost = materialCosts.miscMaterials.beveledDeckBoard54x12x8 || 0;
    
    if (inputs.fenceOrientation === 'Horizontal' && inputs.picketType === 'beveled_deck_board') {
        // Calculate quantity
        const rowsNeeded = inputs.fenceHeight * 12 / 5;
        const totalBoardLengthNeeded = rowsNeeded * inputs.totalLengthWithGates;
        qty = Math.ceil(totalBoardLengthNeeded / 8); // Assuming 8ft boards
    }
    
    // Update item data
    itemData[8] = { 
        ...itemData[8],
        description: description, 
        qty: qty, 
        unitCost: unitCost, 
        totalCost: qty * unitCost 
    };
}

// --- Item 9: 2x4x8 incense cedar gate rail ---
function calculateItem9(itemData, inputs) {
    // Formula: if vertical, if single gate width greater than 48" then quantity of gate * 3, otherwise quantity of gate * 2
    
    let qty = 0;
    const description = "2x4x8 incense cedar gate rail";
    const unitCost = materialCosts.miscMaterials.cedarGateRail2x4x8 || materialCosts.boards.cedar?.["2x4x8"] || 0;
    
    if (inputs.fenceOrientation === 'Vertical') {
        // Count rails needed for single gates
        for (let i = 0; i < inputs.singleGateWidths.length; i++) {
            const width = inputs.singleGateWidths[i];
            if (width > 4) { // 48 inches = 4 feet
                qty += 3;
            } else {
                qty += 2;
            }
        }
    }
    
    // Update item data
    itemData[9] = { 
        ...itemData[9],
        description: description, 
        qty: qty, 
        unitCost: unitCost, 
        totalCost: qty * unitCost 
    };
}

// --- Item 10: 2x4x10 treated ---
function calculateItem10(itemData, inputs) {
    // Formula: if vertical, if double gate width greater than 8' then quantity of gate * 3, otherwise 0
    
    let qty = 0;
    const description = "2x4x10 treated";
    const unitCost = materialCosts.miscMaterials["2x4x10Treated"] || materialCosts.boards.treated?.["2x4x10"] || 0;
    
    if (inputs.fenceOrientation === 'Vertical') {
        // Count rails needed for double gates wider than 8'
        for (let i = 0; i < inputs.doubleGateWidths.length; i++) {
            const width = inputs.doubleGateWidths[i];
            if (width > 8) {
                qty += 3;
            }
        }
    }
    
    // Update item data
    itemData[10] = { 
        ...itemData[10],
        description: description, 
        qty: qty, 
        unitCost: unitCost, 
        totalCost: qty * unitCost 
    };
}

// Export functions
window.calculateItem1 = calculateItem1;
window.calculateItem2 = calculateItem2;
window.calculateItems3And4 = calculateItems3And4;
window.calculateItem5 = calculateItem5;
window.calculateItem6 = calculateItem6;
window.calculateItem7 = calculateItem7;
window.calculateItem8 = calculateItem8;
window.calculateItem9 = calculateItem9;
window.calculateItem10 = calculateItem10;
