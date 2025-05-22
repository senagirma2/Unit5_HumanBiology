document.addEventListener('DOMContentLoaded', () => {
    // --- Atherosclerosis Simulation ---
    const plaqueLevelSlider = document.getElementById('plaqueLevelSlider');
    const plaqueLevelDisplay = document.getElementById('plaqueLevelDisplay');
    const arteryLumenAthero = document.querySelector('.artery-lumen-athero');
    const topPlaque = document.getElementById('topPlaque');
    const bottomPlaque = document.getElementById('bottomPlaque');
    const atheroBloodFlowText = document.getElementById('atheroBloodFlowText');
    const atherosclerosisStatus = document.getElementById('atherosclerosisStatus');

    if (plaqueLevelSlider) {
        plaqueLevelSlider.addEventListener('input', () => {
            const level = parseInt(plaqueLevelSlider.value);
            plaqueLevelDisplay.textContent = level + '%';
            
            // Max height of the lumen area itself
            const maxLumenDivHeight = arteryLumenAthero.clientHeight; // Use actual height
            const plaqueHeightPercentage = level / 100;
            
            // Each plaque grows from its side, taking up to half the lumen's potential space
            const individualPlaqueVisualHeight = (maxLumenDivHeight / 2) * plaqueHeightPercentage; 
            
            topPlaque.style.height = individualPlaqueVisualHeight + 'px';
            bottomPlaque.style.height = individualPlaqueVisualHeight + 'px';
            
            // The actual remaining flowable lumen height is reduced by both plaques
            // This is a visual representation; actual lumen height is handled by parent.
            // We are not changing arteryLumenAthero's height, but the plaque's height inside it.

            let statusMsg = `Plaque buildup at ${level}%. `;
            let flowText = "Normal Flow";
            let flowOpacity = 1;

            if (level < 10) {
                statusMsg += "Artery is relatively healthy.";
            } else if (level < 30) {
                statusMsg += "Minor plaque detected. Blood flow slightly affected.";
                flowText = "Slightly Reduced";
                flowOpacity = 0.9;
            } else if (level < 60) {
                statusMsg += "Moderate plaque buildup. Blood flow is noticeably restricted.";
                flowText = "Restricted Flow";
                flowOpacity = 0.6;
            } else if (level < 85) {
                statusMsg += "Severe plaque buildup! Blood flow is critically low.";
                flowText = "Very Restricted";
                flowOpacity = 0.3;
            } else {
                statusMsg += "Critical blockage! Artery is almost completely occluded. High risk of event!";
                flowText = "Blocked!";
                flowOpacity = 0.1;
            }
            atherosclerosisStatus.textContent = statusMsg;
            atheroBloodFlowText.textContent = flowText;
            atheroBloodFlowText.style.opacity = flowOpacity;
        });
        // Initialize
        if(plaqueLevelSlider) plaqueLevelSlider.dispatchEvent(new Event('input'));
    } else {
        console.error("Atherosclerosis slider not found.");
    }

    // --- Hypertension Simulation ---
    const constrictVesselsBtn = document.getElementById('constrictVesselsBtn');
    const increaseVolumeBtn = document.getElementById('increaseVolumeBtn');
    const resetPressureFactorsBtn = document.getElementById('resetPressureFactorsBtn');
    const bloodPressureValueDisplay = document.getElementById('blood-pressure-value');
    const vesselLumenHypertension = document.querySelector('.vessel-lumen-hypertension');
    const hypertensionBloodFlowText = document.getElementById('hypertensionBloodFlowText');
    const hypertensionStatus = document.getElementById('hypertensionStatus');
    
    let pressureFactors = { constriction: 0, volume: 0 }; // 0=normal, 1=moderate, 2=high per factor
    const MAX_FACTOR_LEVEL = 2; // Max level for each individual factor

    function updateBloodPressureVisuals() {
        if (!vesselLumenHypertension || !bloodPressureValueDisplay || !hypertensionStatus || !hypertensionBloodFlowText) {
            console.error("One or more hypertension UI elements are missing.");
            return;
        }

        let totalPressureEffect = pressureFactors.constriction + pressureFactors.volume;
        let pressureText = "Normal";
        let pressureCategory = "Normal";
        let lumenWidthPercent = 90; // % of parent .blood-vessel-hypertension
        let lumenColor = '#ffadad'; // Normal blood area color
        let flowDescription = "Smooth";

        if (totalPressureEffect === 0) {
            // Normal (default values)
        } else if (totalPressureEffect === 1) {
            pressureCategory = "Elevated";
            pressureText = "120-129 / <80 mmHg (Elevated)";
            lumenWidthPercent = 78;
            lumenColor = '#ff9090';
            flowDescription = "Slightly Turbulent";
        } else if (totalPressureEffect === 2) {
            pressureCategory = "Hypertension Stage 1";
            pressureText = "130-139 / 80-89 mmHg (Stage 1)";
            lumenWidthPercent = 66;
            lumenColor = '#ff7272';
            flowDescription = "Turbulent";
        } else if (totalPressureEffect === 3) {
            pressureCategory = "Hypertension Stage 2";
            pressureText = "140+ / 90+ mmHg (Stage 2)";
            lumenWidthPercent = 54;
            lumenColor = '#ff5454';
            flowDescription = "Very Turbulent";
        } else { // totalPressureEffect >= 4
            pressureCategory = "Hypertensive Crisis";
            pressureText = "180+ / 120+ mmHg (CRISIS!)";
            lumenWidthPercent = 42;
            lumenColor = '#e03030';
            flowDescription = "Critical!";
        }
        
        bloodPressureValueDisplay.textContent = `Current Blood Pressure: ${pressureCategory}`;
        vesselLumenHypertension.style.width = lumenWidthPercent + '%';
        vesselLumenHypertension.style.backgroundColor = lumenColor;
        hypertensionBloodFlowText.textContent = flowDescription;
        
        let statusDetail = `Factors: Vessel Constriction Lvl ${pressureFactors.constriction}/2, Blood Volume Lvl ${pressureFactors.volume}/2. `;
        statusDetail += `Overall pressure is ${pressureCategory}. ${pressureText ? '(' + pressureText + ' range)' : ''}`;
        hypertensionStatus.textContent = statusDetail;
    }

    if (constrictVesselsBtn) {
        constrictVesselsBtn.addEventListener('click', () => {
            pressureFactors.constriction = Math.min(MAX_FACTOR_LEVEL, pressureFactors.constriction + 1);
            updateBloodPressureVisuals();
        });
    }
    if (increaseVolumeBtn) {
        increaseVolumeBtn.addEventListener('click', () => {
            pressureFactors.volume = Math.min(MAX_FACTOR_LEVEL, pressureFactors.volume + 1);
            updateBloodPressureVisuals();
        });
    }
    if (resetPressureFactorsBtn) {
        resetPressureFactorsBtn.addEventListener('click', () => {
            pressureFactors.constriction = 0;
            pressureFactors.volume = 0;
            updateBloodPressureVisuals();
        });
    }
    
    // Initialize Hypertension Sim
    if (vesselLumenHypertension) updateBloodPressureVisuals(); // Call once on load

});