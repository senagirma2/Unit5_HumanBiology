document.addEventListener('DOMContentLoaded', () => {
    // --- Pain Reaction (Reflex Arc) Simulation ---
    const applyStimulusBtn = document.getElementById('applyStimulusBtn');
    const painSignalDot = document.getElementById('painSignalDot');
    const painReactionStatus = document.getElementById('painReactionStatus');
    const reflexArcVizContainer = document.getElementById('reflex-arc-viz-container');

    const reflexPathElements = {
        stimulus: document.getElementById('stimulusPointEl'),
        sensory: document.getElementById('sensoryNeuronEl'),
        spinal: document.getElementById('spinalCordEl'),
        motor: document.getElementById('motorNeuronEl'),
        effector: document.getElementById('effectorMuscleEl')
    };
    const reflexOrder = ['stimulus', 'sensory', 'spinal', 'motor', 'effector'];
    let painSignalMoving = false;
    let currentPainStep = 0;

    function positionSignalDot(targetElement) {
        if (!painSignalDot || !targetElement || !reflexArcVizContainer) return;
        const targetRect = targetElement.getBoundingClientRect();
        const containerRect = reflexArcVizContainer.getBoundingClientRect();

        painSignalDot.style.left = (targetRect.left - containerRect.left + targetRect.width / 2 - painSignalDot.offsetWidth / 2) + 'px';
        painSignalDot.style.top = (targetRect.top - containerRect.top + targetElement.offsetHeight / 2 - painSignalDot.offsetHeight / 2) + 'px';
    }
    
    if (applyStimulusBtn) {
        applyStimulusBtn.addEventListener('click', () => {
            if (painSignalMoving) return;
            painSignalMoving = true;
            applyStimulusBtn.disabled = true;
            if(painReactionStatus) painReactionStatus.textContent = 'Pain stimulus applied! Signal propagating...';
            
            Object.values(reflexPathElements).forEach(el => el.classList.remove('active'));
            currentPainStep = 0;
            
            if (painSignalDot) painSignalDot.style.opacity = 0; // Ensure it starts hidden before first move

            function movePainSignal() {
                if (currentPainStep < reflexOrder.length) {
                    const currentKey = reflexOrder[currentPainStep];
                    const currentElement = reflexPathElements[currentKey];

                    if (currentElement) {
                        currentElement.classList.add('active');
                        positionSignalDot(currentElement);
                        if (painSignalDot) painSignalDot.style.opacity = 1;
                    }
                    
                    if (currentPainStep > 0) {
                        const prevKey = reflexOrder[currentPainStep - 1];
                        if (reflexPathElements[prevKey]) {
                            reflexPathElements[prevKey].classList.remove('active');
                        }
                    }
                    
                    currentPainStep++;
                    setTimeout(movePainSignal, 700); // Speed of signal
                } else {
                    // End of path
                    if (reflexPathElements.effector) reflexPathElements.effector.classList.add('active'); // Keep last one active briefly
                    
                    setTimeout(() => {
                         Object.values(reflexPathElements).forEach(el => el.classList.remove('active'));
                         if (painSignalDot) painSignalDot.style.opacity = 0;
                         if(painReactionStatus) painReactionStatus.textContent = 'Reflex action complete (e.g., muscle contracts). Ready for new stimulus.';
                         painSignalMoving = false;
                         applyStimulusBtn.disabled = false;
                    }, 1000);
                }
            }
            movePainSignal();
        });
    } else {
        console.error("Apply Stimulus Button not found.");
    }


    // --- Neuroplasticity Simulation ---
    const practiceTaskABtn = document.getElementById('practiceTaskABtn');
    const practiceTaskBBtn = document.getElementById('practiceTaskBBtn');
    const simulateDisuseBtn = document.getElementById('simulateDisuseBtn');
    const neuroplasticityStatus = document.getElementById('neuroplasticityStatus');
    
    const neuron1 = document.getElementById('neuron1');
    const neuron2 = document.getElementById('neuron2');
    const neuron3 = document.getElementById('neuron3');
    
    const sContainer12 = document.getElementById('sContainer12');
    const synapse12 = document.getElementById('synapse12');
    const strength12Display = document.getElementById('strength12Display');
    
    const sContainer23 = document.getElementById('sContainer23');
    const synapse23 = document.getElementById('synapse23');
    const strength23Display = document.getElementById('strength23Display');

    const neuroVizContainer = document.getElementById('neuroplasticity-viz-container');

    let synapseStrengths = { '1-2': 5, '2-3': 5 }; // Base strength unit
    const MAX_STRENGTH_UNIT = 15;
    const MIN_STRENGTH_UNIT = 1;
    const BASE_SYNAPSE_HEIGHT_PX = 4; // Min visual thickness
    const STRENGTH_HEIGHT_MULTIPLIER_PX = 1; // Pixels to add per strength unit

    function positionSynapseContainers() {
        if (!neuron1 || !neuron2 || !neuron3 || !sContainer12 || !sContainer23 || !neuroVizContainer) return;

        function setupContainer(container, nStart, nEnd) {
            const nStartRect = nStart.getBoundingClientRect();
            const nEndRect = nEnd.getBoundingClientRect();
            const parentRect = neuroVizContainer.getBoundingClientRect();

            let top = (nStartRect.top + nStartRect.height / 2) - parentRect.top - container.offsetHeight / 2;
            let left = (nStartRect.left + nStart.offsetWidth) - parentRect.left;
            let width = nEndRect.left - (nStartRect.left + nStart.offsetWidth);
            
            container.style.top = top + 'px';
            container.style.left = left + 'px';
            container.style.width = width + 'px';
        }
        setupContainer(sContainer12, neuron1, neuron2);
        setupContainer(sContainer23, neuron2, neuron3);
    }

    function updateSynapseVisual(synapseKey, synapseElement, strengthDisplay, strengthUnit) {
        if (!synapseElement || !strengthDisplay) return;
        const newHeight = BASE_SYNAPSE_HEIGHT_PX + (strengthUnit * STRENGTH_HEIGHT_MULTIPLIER_PX);
        synapseElement.style.height = Math.max(2, newHeight) + 'px'; // Ensure min height of 2px
        strengthDisplay.textContent = `Strength: ${strengthUnit}`;
        
        if (strengthUnit > 10) synapseElement.style.backgroundColor = '#006400'; // DarkGreen
        else if (strengthUnit > 5) synapseElement.style.backgroundColor = '#228B22'; // ForestGreen
        else synapseElement.style.backgroundColor = '#8FBC8F'; // DarkSeaGreen (matches accent)
    }
    
    function activateNeuronsNeuro(neuronsToActivate, duration = 400) {
        neuronsToActivate.forEach(n => { if(n) n.classList.add('active'); });
        setTimeout(() => {
            neuronsToActivate.forEach(n => { if(n) n.classList.remove('active'); });
        }, duration);
    }

    function showSynapticActivityEffect(synapseContainer) {
        if (!synapseContainer) return;
        const effectDot = document.createElement('div');
        effectDot.classList.add('synaptic-activity-effect');
        synapseContainer.appendChild(effectDot);
        // Remove dot after animation
        effectDot.addEventListener('animationend', () => {
            effectDot.remove();
        });
    }

    if (practiceTaskABtn) {
        practiceTaskABtn.addEventListener('click', () => {
            activateNeuronsNeuro([neuron1, neuron2]);
            if (sContainer12) showSynapticActivityEffect(sContainer12);
            synapseStrengths['1-2'] = Math.min(MAX_STRENGTH_UNIT, synapseStrengths['1-2'] + 2);
            updateSynapseVisual('1-2', synapse12, strength12Display, synapseStrengths['1-2']);
            if(neuroplasticityStatus) neuroplasticityStatus.textContent = 'Practiced Skill A: N1-N2 connection strengthened (LTP).';
        });
    }

    if (practiceTaskBBtn) {
        practiceTaskBBtn.addEventListener('click', () => {
            activateNeuronsNeuro([neuron2, neuron3]);
            if (sContainer23) showSynapticActivityEffect(sContainer23);
            synapseStrengths['2-3'] = Math.min(MAX_STRENGTH_UNIT, synapseStrengths['2-3'] + 2);
            updateSynapseVisual('2-3', synapse23, strength23Display, synapseStrengths['2-3']);
            if(neuroplasticityStatus) neuroplasticityStatus.textContent = 'Practiced Skill B: N2-N3 connection strengthened (LTP).';
        });
    }

    if (simulateDisuseBtn) {
        simulateDisuseBtn.addEventListener('click', () => {
            synapseStrengths['1-2'] = Math.max(MIN_STRENGTH_UNIT, synapseStrengths['1-2'] - 1);
            synapseStrengths['2-3'] = Math.max(MIN_STRENGTH_UNIT, synapseStrengths['2-3'] - 1);
            updateSynapseVisual('1-2', synapse12, strength12Display, synapseStrengths['1-2']);
            updateSynapseVisual('2-3', synapse23, strength23Display, synapseStrengths['2-3']);
            if(neuroplasticityStatus) neuroplasticityStatus.textContent = 'Simulated Disuse: Connections may weaken (LTD).';
        });
    }

    // Initial setup for neuroplasticity
    if (neuron1 && neuroVizContainer) { // Check if critical elements exist
        positionSynapseContainers();
        updateSynapseVisual('1-2', synapse12, strength12Display, synapseStrengths['1-2']);
        updateSynapseVisual('2-3', synapse23, strength23Display, synapseStrengths['2-3']);
        if(neuroplasticityStatus) neuroplasticityStatus.textContent = 'Practice skills or simulate disuse to observe neuroplasticity.';
        window.addEventListener('resize', positionSynapseContainers);
    } else {
        console.error("One or more neuroplasticity elements are missing.");
    }
});