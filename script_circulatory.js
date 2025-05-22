document.addEventListener('DOMContentLoaded', () => {
    const nextStepBtn = document.getElementById('nextStepBtnSvgHeart'); // Ensure this ID matches your HTML button
    const bloodCell = document.getElementById('bloodCellSvg');       // Ensure this ID matches your HTML blood cell div
    const statusDisplay = document.getElementById('circulatoryStatusSvgHeart'); // Ensure this ID matches
    const vizContainer = document.getElementById('circulatory-viz-container'); // The main div holding the SVG and conceptual organs
    const svgHeart = document.getElementById('svg-heart-diagram');       // The <svg> element itself

    // --- STEP 1: VERIFY THESE IDs MATCH YOUR HTML ---
    const conceptualLungs = document.getElementById('css-lungs');
    const conceptualBody = document.getElementById('css-body-tissues');

    // --- STEP 2: VERIFY THESE IDs MATCH ELEMENTS INSIDE YOUR SVG ---
    // These attempt to get groups or paths from your SVG. 
    // The IDs ('RightAtrium_group', etc.) MUST match what's in your SVG code.
    const svgRaTarget = svgHeart ? svgHeart.querySelector('#RightAtrium_group') || svgHeart.querySelector('#RA_path') : null;
    const svgRvTarget = svgHeart ? svgHeart.querySelector('#RightVentricle_group') || svgHeart.querySelector('#RV_path') : null;
    const svgLaTarget = svgHeart ? svgHeart.querySelector('#LeftAtrium_group') || svgHeart.querySelector('#LA_path') : null;
    const svgLvTarget = svgHeart ? svgHeart.querySelector('#LeftVentricle_group') || svgHeart.querySelector('#LV_path') : null;
    
    const allHighlightableElements = [svgRaTarget, svgRvTarget, svgLaTarget, svgLvTarget, conceptualLungs, conceptualBody].filter(el => el);

    // Labels (HTML elements to be positioned over SVG)
    const labelRa = document.getElementById('label-ra');
    const labelLa = document.getElementById('label-la');
    const labelRv = document.getElementById('label-rv');
    const labelLv = document.getElementById('label-lv');

    let currentStep = -1;

    // --- STEP 3: CRITICAL - ADJUST THESE COORDINATES! ---
    // The `targetElementForBloodCell` refers to one of the constants defined above (e.g., `svgRaTarget`).
    // The JavaScript will calculate the center of this `targetElementForBloodCell` and move the blood cell there.
    // If an SVG part is complex, its calculated "center" (from getBBox) might not be where you visually want the blood cell.
    // In such cases, you might need to create small, invisible <circle> or <rect> elements
    // inside your SVG at the precise points you want the blood cell to go, give them IDs,
    // and then target those invisible elements here.
    const simulationPathDefinition = [
        { 
            name: 'BodyReturn',
            targetElementForBloodCell: conceptualBody, 
            elementToHighlight: conceptualBody,
            bloodState: 'deoxygenated',
            description: "Deoxygenated blood returns from body tissues."
            // Visual XY for blood cell: Will be center of 'conceptualBody' div
        },
        { 
            name: 'RightAtriumEntry',
            targetElementForBloodCell: svgRaTarget, // IF THIS IS NULL, IT WILL FAIL. Check ID in SVG!
            elementToHighlight: svgRaTarget, 
            bloodState: 'deoxygenated',
            description: "Blood enters the Right Atrium."
            // Visual XY for blood cell: Will be center of 'svgRaTarget' (e.g., #RightAtrium_group in SVG)
        },
        { 
            name: 'RightVentricleEntry',
            targetElementForBloodCell: svgRvTarget, // IF THIS IS NULL, IT WILL FAIL.
            elementToHighlight: svgRvTarget,
            bloodState: 'deoxygenated',
            description: "Blood moves to the Right Ventricle."
            // Visual XY for blood cell: Will be center of 'svgRvTarget'
        },
        { 
            name: 'ToLungs',
            targetElementForBloodCell: conceptualLungs,
            elementToHighlight: conceptualLungs,
            bloodState: 'deoxygenated', 
            description: "Blood is pumped to the Lungs."
            // Visual XY for blood cell: Will be center of 'conceptualLungs' div
        },
        { 
            name: 'LeftAtriumEntry',
            targetElementForBloodCell: svgLaTarget, // IF THIS IS NULL, IT WILL FAIL.
            elementToHighlight: svgLaTarget,
            bloodState: 'oxygenated',
            description: "Oxygenated blood enters the Left Atrium."
            // Visual XY for blood cell: Will be center of 'svgLaTarget'
        },
        { 
            name: 'LeftVentricleEntry',
            targetElementForBloodCell: svgLvTarget, // IF THIS IS NULL, IT WILL FAIL.
            elementToHighlight: svgLvTarget,
            bloodState: 'oxygenated',
            description: "Blood moves to the Left Ventricle."
            // Visual XY for blood cell: Will be center of 'svgLvTarget'
        },
        { 
            name: 'ToBody',
            targetElementForBloodCell: conceptualBody,
            elementToHighlight: conceptualBody,
            bloodState: 'oxygenated',
            description: "Oxygenated blood is pumped to the body."
            // Visual XY for blood cell: Will be center of 'conceptualBody' div
        }
    ];

    /**
     * Calculates the desired top/left for the bloodCell to center it on the targetElement.
     * Coordinates are relative to the vizContainer.
     */
    function getBloodCellPosition(targetElement) {
        if (!targetElement || !vizContainer || !bloodCell || !svgHeart) {
            // console.warn("getBloodCellPosition: Missing crucial element(s). Cannot calculate position.");
            return { x: 0, y: 0, valid: false };
        }
        
        const containerRect = vizContainer.getBoundingClientRect();
        let targetCenterXinContainer, targetCenterYinContainer;

        const isSvgChild = targetElement.closest('svg') === svgHeart;

        if (isSvgChild && typeof targetElement.getBBox === 'function') { 
            const svgRect = svgHeart.getBoundingClientRect(); 
            const bbox = targetElement.getBBox(); 

            if (typeof bbox.x === 'undefined' || typeof bbox.y === 'undefined') {
                // console.warn("getBBox for SVG element did not return valid x/y:", targetElement);
                return { x:0, y:0, valid: false};
            }

            const targetCenterXInSvg = bbox.x + bbox.width / 2;
            const targetCenterYInSvg = bbox.y + bbox.height / 2;

            targetCenterXinContainer = (svgRect.left - containerRect.left) + targetCenterXInSvg;
            targetCenterYinContainer = (svgRect.top - containerRect.top) + targetCenterYInSvg;
        } else { 
            const targetRect = targetElement.getBoundingClientRect();
            targetCenterXinContainer = (targetRect.left - containerRect.left) + targetRect.width / 2;
            targetCenterYinContainer = (targetRect.top - containerRect.top) + targetRect.height / 2;
        }
        
        const finalX = targetCenterXinContainer - (bloodCell.offsetWidth / 2);
        const finalY = targetCenterYinContainer - (bloodCell.offsetHeight / 2);
        
        // FOR YOUR DEBUGGING:
        // console.log(`Target ID: ${targetElement.id}, Calculated Coords (relative to vizContainer): Left = ${finalX.toFixed(1)}px, Top = ${finalY.toFixed(1)}px`);
        // createDebugDot(targetCenterXinContainer, targetCenterYinContainer); // Call this to see where the script thinks the center is

        return { x: finalX, y: finalY, valid: true };
    }
    
    // --- DEBUGGING HELPER FUNCTION ---
    // Call this from getBloodCellPosition to see a temporary dot where the center is calculated.
    // function createDebugDot(containerX, containerY, color = 'lime') {
    //     const dot = document.createElement('div');
    //     dot.style.position = 'absolute';
    //     dot.style.left = (containerX - 2) + 'px'; // Place dot's center at the calculated point
    //     dot.style.top = (containerY - 2) + 'px';
    //     dot.style.width = '5px';
    //     dot.style.height = '5px';
    //     dot.style.backgroundColor = color;
    //     dot.style.borderRadius = '50%';
    //     dot.style.zIndex = '10000'; // Make sure it's on top
    //     dot.style.pointerEvents = 'none';
    //     vizContainer.appendChild(dot);
    //     // Remove it after a few seconds if you want, or leave it for persistent debugging
    //     // setTimeout(() => dot.remove(), 3000); 
    // }


    function positionLabels() {
        if (!vizContainer || !svgHeart) return;
        
        const elementsToLabel = [
            { labelEl: labelRa, svgTarget: svgRaTarget },
            { labelEl: labelLa, svgTarget: svgLaTarget },
            { labelEl: labelRv, svgTarget: svgRvTarget },
            { labelEl: labelLv, svgTarget: svgLvTarget }
        ];

        elementsToLabel.forEach(item => {
            if (!item.labelEl || !item.svgTarget) {
                if(item.labelEl) item.labelEl.style.display = 'none';
                return;
            }
            
            const coords = getBloodCellPosition(item.svgTarget); 
            if(coords.valid) {
                // Position label at the center of the SVG target
                item.labelEl.style.left = (coords.x + bloodCell.offsetWidth / 2) + 'px'; 
                item.labelEl.style.top = (coords.y + bloodCell.offsetHeight / 2) + 'px';
                item.labelEl.style.display = 'block';
            } else {
                 item.labelEl.style.display = 'none';
            }
        });
    }

    function updateBloodCellVisuals(stepData) {
        if (!bloodCell || !stepData || !stepData.targetElementForBloodCell) {
            // console.warn("updateBloodCellVisuals: Missing data for update.");
            return;
        }
        const coords = getBloodCellPosition(stepData.targetElementForBloodCell);
        
        if (coords.valid) {
            bloodCell.style.left = coords.x + 'px';
            bloodCell.style.top = coords.y + 'px';
        } else {
            // console.warn("Could not get valid coordinates for blood cell target in update:", stepData.targetElementForBloodCell);
        }

        if (stepData.bloodState === 'oxygenated') {
            bloodCell.classList.remove('deoxygenated-blood');
            bloodCell.classList.add('oxygenated-blood');
        } else {
            bloodCell.classList.add('deoxygenated-blood');
            bloodCell.classList.remove('oxygenated-blood');
        }
    }

    function updateHighlights(elementToHighlight) {
        allHighlightableElements.forEach(el => {
            if (el) {
                el.classList.remove('highlighted-svg-chamber');
                el.classList.remove('highlighted-organ');
            }
        });

        if (elementToHighlight) {
            if (elementToHighlight.closest('svg') === svgHeart) {
                elementToHighlight.classList.add('highlighted-svg-chamber');
            } else if (elementToHighlight.classList.contains('conceptual-organ')) {
                elementToHighlight.classList.add('highlighted-organ');
            }
        }
    }
    
    function advanceSimulation() {
        currentStep++;
        if (currentStep >= simulationPathDefinition.length) {
            currentStep = 0; 
            if(statusDisplay) statusDisplay.innerHTML = `<strong>Cycle Complete!</strong> Starting over. ${simulationPathDefinition[currentStep].description}`;
        } else {
            if(statusDisplay) statusDisplay.innerHTML = `<strong>Step ${currentStep + 1} (${simulationPathDefinition[currentStep].name}):</strong> ${simulationPathDefinition[currentStep].description}`;
        }

        const currentStepData = simulationPathDefinition[currentStep];
        if (currentStepData) {
            updateBloodCellVisuals(currentStepData);
            updateHighlights(currentStepData.elementToHighlight);
        }
    }
    
    const essentialElementsPresent = nextStepBtn && bloodCell && statusDisplay && vizContainer && svgHeart &&
                                  conceptualLungs && conceptualBody &&
                                  svgRaTarget && svgRvTarget && svgLaTarget && svgLvTarget;

    if (essentialElementsPresent) {
        requestAnimationFrame(() => { 
            positionLabels(); 
            advanceSimulation(); 
        });
        
        nextStepBtn.addEventListener('click', advanceSimulation);

        const resizeObserver = new ResizeObserver(entries => {
            requestAnimationFrame(() => { 
                positionLabels();
                if(currentStep >=0 && currentStep < simulationPathDefinition.length) {
                    updateBloodCellVisuals(simulationPathDefinition[currentStep]);
                }
            });
        });
        if (vizContainer) { 
            resizeObserver.observe(vizContainer);
        }

    } else {
        console.error("Initialization failed: Crucial elements for SVG heart circulatory simulation are missing from the DOM. Check that your SVG has elements with the IDs targeted in the script (e.g., #RightAtrium_group) and that all HTML elements have their correct IDs.");
        if (!svgHeart) console.error("SVG Heart diagram element (#svg-heart-diagram) not found!");
        if (!svgRaTarget) console.error("Right Atrium SVG target not found! Check ID: #RightAtrium_group or #RA_path");
        if (!svgRvTarget) console.error("Right Ventricle SVG target not found! Check ID: #RightVentricle_group or #RV_path");
        if (!svgLaTarget) console.error("Left Atrium SVG target not found! Check ID: #LeftAtrium_group or #LA_path");
        if (!svgLvTarget) console.error("Left Ventricle SVG target not found! Check ID: #LeftVentricle_group or #LV_path");
    }
});