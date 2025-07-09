// ===== DASHBOARD MAIN SCRIPT =====
// Main script for the dashboard page - handles data simulation and display
// Simple and beginner-friendly code for real-time dashboard

// Dashboard application state
const dashboardState = {
    isLoaded: false,
    isSimulating: false,
    dataRate: 2, // Hz
    maxDataPoints: 100,
    autoExport: false,
    spiEnabled: false,
    spiPort: '/dev/spidev0.0',
    spiBaudRate: 1000000,
    currentData: {
        drag: 0.25,
        lift: -0.12,
        downforce: 0.12,
        dragCoeff: 0.30,
        liftCoeff: 0.10,
        pressure: 1.5,
        dynamicPressure: 0.8,
        stagnationPressure: 2.3,
        velocity: 22.4,
        reynolds: 6100000,
        frontalArea: 2.2,
        airDensity: 1.225,
        efficiency: 85
    }
};

// Data simulation variables
let dataSimulationInterval = null;
let dataExportSystem = null;

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing Wind Tunnel Dashboard...');
    
    // Hide loading screen
    setTimeout(() => {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        dashboardState.isLoaded = true;
    }, 1000);
    
    // Initialize systems
    initializeDashboard();
    
    console.log('Dashboard initialized successfully!');
});

// Initialize dashboard systems
function initializeDashboard() {
    console.log('Setting up dashboard systems...');
    
    // Set up data simulation
    setupDataSimulation();
    
    // Set up export system
    setupExportSystem();
    
    // Set up settings
    setupSettings();
    
    // Set up navigation
    setupNavigation();
    
    console.log('Dashboard systems initialized');
}

// Set up data simulation
function setupDataSimulation() {
    console.log('Setting up data simulation...');
    
    // Start data simulation
    startDataSimulation();
    
    // Update connection status
    updateConnectionStatus(true);
    
    console.log('Data simulation started');
}

// Start data simulation
function startDataSimulation() {
    if (dataSimulationInterval) {
        clearInterval(dataSimulationInterval);
    }
    
    dashboardState.isSimulating = true;
    
    // Update data at specified rate
    const updateInterval = 1000 / dashboardState.dataRate;
    dataSimulationInterval = setInterval(updateSimulatedData, updateInterval);
    
    // Update data rate display
    updateDataRateDisplay();
}

// Update simulated data
function updateSimulatedData() {
    // Simulate realistic wind tunnel data with some variation
    const time = Date.now() / 1000;
    const baseVariation = 0.1; // 10% variation
    
    // Add small random variations to simulate real data
    dashboardState.currentData.drag = 0.25 + (Math.sin(time * 0.1) * 0.05) + (Math.random() - 0.5) * baseVariation;
    dashboardState.currentData.lift = -0.12 + (Math.cos(time * 0.15) * 0.03) + (Math.random() - 0.5) * baseVariation * 0.5;
    dashboardState.currentData.downforce = Math.abs(dashboardState.currentData.lift);
    dashboardState.currentData.dragCoeff = 0.30 + (Math.sin(time * 0.2) * 0.02) + (Math.random() - 0.5) * baseVariation * 0.3;
    dashboardState.currentData.liftCoeff = 0.10 + (Math.cos(time * 0.18) * 0.01) + (Math.random() - 0.5) * baseVariation * 0.2;
    
    // Pressure variations
    dashboardState.currentData.pressure = 1.5 + (Math.sin(time * 0.12) * 0.2) + (Math.random() - 0.5) * baseVariation * 0.5;
    dashboardState.currentData.dynamicPressure = 0.8 + (Math.cos(time * 0.14) * 0.1) + (Math.random() - 0.5) * baseVariation * 0.3;
    dashboardState.currentData.stagnationPressure = dashboardState.currentData.pressure + dashboardState.currentData.dynamicPressure;
    
    // Flow properties
    dashboardState.currentData.velocity = 22.4 + (Math.sin(time * 0.08) * 2.0) + (Math.random() - 0.5) * baseVariation * 3.0;
    dashboardState.currentData.reynolds = 6100000 + (Math.cos(time * 0.09) * 500000) + (Math.random() - 0.5) * baseVariation * 1000000;
    
    // Test parameters (less variation)
    dashboardState.currentData.frontalArea = 2.2 + (Math.random() - 0.5) * baseVariation * 0.1;
    dashboardState.currentData.airDensity = 1.225 + (Math.random() - 0.5) * baseVariation * 0.05;
    
    // Calculate efficiency based on drag and lift
    dashboardState.currentData.efficiency = Math.max(0, Math.min(100, 
        100 - (dashboardState.currentData.drag * 100) + (dashboardState.currentData.downforce * 20)
    ));
    
    // Update dashboard display
    updateDashboardDisplay();
    
    // Add data to graphing system
    if (window.aerodynamicsGraphingSystem) {
        window.aerodynamicsGraphingSystem.addDataPoint(dashboardState.currentData);
    }
}

// Update dashboard display
function updateDashboardDisplay() {
    const data = dashboardState.currentData;
    
    // Update all values with animation
    updateDashboardValue('dragValue', 'dragBar', data.drag, 'N', 2, 3);
    updateDashboardValue('liftValue', 'liftBar', data.lift, 'N', 2, 2);
    updateDashboardValue('downforceValue', 'downforceBar', data.downforce, 'N', 2, 2);
    updateDashboardValue('cdValue', 'cdBar', data.dragCoeff, '', 3, 1);
    updateDashboardValue('clValue', 'clBar', data.liftCoeff, '', 3, 1);
    updateDashboardValue('pressureValue', 'pressureBar', data.pressure, 'kPa', 1, 8);
    updateDashboardValue('dynamicPressureValue', 'dynamicPressureBar', data.dynamicPressure, 'kPa', 2, 5);
    updateDashboardValue('stagnationPressureValue', 'stagnationPressureBar', data.stagnationPressure, 'kPa', 1, 10);
    updateDashboardValue('velocityValue', 'velocityBar', data.velocity, 'm/s', 1, 50);
    updateDashboardValue('frontalAreaValue', 'frontalAreaBar', data.frontalArea, 'm²', 1, 4);
    updateDashboardValue('airDensityValue', 'airDensityBar', data.airDensity, 'kg/m³', 3, 2);
    updateDashboardValue('efficiencyValue', 'efficiencyBar', data.efficiency, '%', 0, 100);
    
    // Special handling for Reynolds number
    const reynoldsElement = document.getElementById('reynoldsValue');
    const reynoldsBar = document.getElementById('reynoldsBar');
    if (reynoldsElement) {
        const reynoldsMillions = data.reynolds / 1000000;
        reynoldsElement.textContent = reynoldsMillions.toFixed(1) + 'M';
        reynoldsElement.classList.add('updating');
        setTimeout(() => reynoldsElement.classList.remove('updating'), 300);
    }
    if (reynoldsBar) {
        const reynoldsPercent = Math.min(Math.max(data.reynolds / 10000000 * 100, 5), 100);
        reynoldsBar.style.width = reynoldsPercent + '%';
    }
}

// Update individual dashboard value
function updateDashboardValue(elementId, barId, value, unit, precision = 2, maxValue = 100) {
    const element = document.getElementById(elementId);
    const bar = document.getElementById(barId);
    
    if (element) {
        element.textContent = value.toFixed(precision);
        element.classList.add('updating');
        setTimeout(() => element.classList.remove('updating'), 300);
    }
    
    if (bar) {
        const percent = Math.min(Math.max(Math.abs(value) / maxValue * 100, 5), 100);
        bar.style.width = percent + '%';
    }
}

// Update connection status
function updateConnectionStatus(connected) {
    const statusElement = document.getElementById('connectionStatus');
    if (statusElement) {
        statusElement.textContent = connected ? '🟢 Connected' : '🔴 Disconnected';
        statusElement.style.color = connected ? '#44ff44' : '#ff4444';
    }
}

// Update data rate display
function updateDataRateDisplay() {
    const dataRateElement = document.getElementById('dataRate');
    if (dataRateElement) {
        dataRateElement.textContent = `Data Rate: ${dashboardState.dataRate} Hz`;
    }
}

// Set up export system
function setupExportSystem() {
    console.log('Setting up export system...');
    
    // Initialize data export system
    dataExportSystem = new DataExportSystem();
    
    // Set up export button event listeners
    const recordTestBtn = document.getElementById('recordTest');
    const exportCSVBtn = document.getElementById('exportCSV');
    const exportJSONBtn = document.getElementById('exportJSON');
    const clearDataBtn = document.getElementById('clearData');
    
    if (recordTestBtn) {
        recordTestBtn.addEventListener('click', recordTest);
    }
    
    if (exportCSVBtn) {
        exportCSVBtn.addEventListener('click', exportCSV);
    }
    
    if (exportJSONBtn) {
        exportJSONBtn.addEventListener('click', exportJSON);
    }
    
    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', clearData);
    }
    
    console.log('Export system set up');
}

// Record test function
function recordTest() {
    if (dataExportSystem) {
        const testResult = dataExportSystem.recordTest(
            dashboardState.currentData.velocity,
            0, // No car angle in dashboard mode
            'dashboard',
            dashboardState.currentData
        );
        
        showNotification(`Test #${testResult.id} recorded!`, 'success');
        
        // Button animation
        const btn = document.getElementById('recordTest');
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => btn.style.transform = 'scale(1)', 200);
    }
}

// Export CSV function
function exportCSV() {
    if (dataExportSystem) {
        dataExportSystem.exportToCSV();
        showNotification('Data exported to CSV!', 'success');
        
        // Button animation
        const btn = document.getElementById('exportCSV');
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => btn.style.transform = 'scale(1)', 200);
    }
}

// Export JSON function
function exportJSON() {
    if (dataExportSystem) {
        dataExportSystem.exportToJSON();
        showNotification('Data exported to JSON!', 'success');
        
        // Button animation
        const btn = document.getElementById('exportJSON');
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => btn.style.transform = 'scale(1)', 200);
    }
}

// Clear data function
function clearData() {
    if (dataExportSystem) {
        dataExportSystem.clearTestHistory();
        showNotification('Test data cleared!', 'info');
        
        // Button animation
        const btn = document.getElementById('clearData');
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => btn.style.transform = 'scale(1)', 200);
    }
}

// Set up settings
function setupSettings() {
    console.log('Setting up settings...');
    
    // Set up settings controls
    const dataRateSlider = document.getElementById('dataRate');
    const maxDataPointsSlider = document.getElementById('maxDataPoints');
    const autoExportCheckbox = document.getElementById('autoExport');
    const spiEnabledCheckbox = document.getElementById('spiEnabled');
    
    if (dataRateSlider) {
        dataRateSlider.addEventListener('input', function() {
            dashboardState.dataRate = parseInt(this.value);
            document.getElementById('dataRateValue').textContent = dashboardState.dataRate + ' Hz';
            startDataSimulation(); // Restart with new rate
        });
    }
    
    if (maxDataPointsSlider) {
        maxDataPointsSlider.addEventListener('input', function() {
            dashboardState.maxDataPoints = parseInt(this.value);
            document.getElementById('maxDataPointsValue').textContent = dashboardState.maxDataPoints;
        });
    }
    
    if (autoExportCheckbox) {
        autoExportCheckbox.addEventListener('change', function() {
            dashboardState.autoExport = this.checked;
        });
    }
    
    if (spiEnabledCheckbox) {
        spiEnabledCheckbox.addEventListener('change', function() {
            dashboardState.spiEnabled = this.checked;
            updateConnectionStatus(this.checked);
        });
    }
    
    console.log('Settings set up');
}

// Set up navigation
function setupNavigation() {
    console.log('Setting up navigation...');
    
    const backButton = document.getElementById('backToMainFromSettings');
    if (backButton) {
        backButton.addEventListener('click', function() {
            hideSettings();
        });
    }
    
    console.log('Navigation set up');
}

// Show settings page
function showSettings() {
    const settingsPage = document.getElementById('settingsPage');
    const dashboardPage = document.getElementById('dashboardPage');
    
    if (settingsPage && dashboardPage) {
        dashboardPage.classList.remove('active');
        settingsPage.classList.add('active');
    }
}

// Hide settings page
function hideSettings() {
    const settingsPage = document.getElementById('settingsPage');
    const dashboardPage = document.getElementById('dashboardPage');
    
    if (settingsPage && dashboardPage) {
        settingsPage.classList.remove('active');
        dashboardPage.classList.add('active');
    }
}

// Show graph function (called from dashboard cards)
function showGraph(parameterKey) {
    if (window.aerodynamicsGraphingSystem) {
        window.aerodynamicsGraphingSystem.showGraph(parameterKey);
    } else {
        console.log('Graphing system not available');
    }
}

// Show notification function
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#F44336' : '#2196F3'};
        color: white;
        padding: 12px 20px;
        border-radius: 5px;
        font-size: 14px;
        font-weight: bold;
        z-index: 1000;
        opacity: 0;
        transform: translateX(100px);
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100px)';
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Export global functions
window.DashboardMain = {
    dashboardState: dashboardState,
    showSettings: showSettings,
    hideSettings: hideSettings,
    showGraph: showGraph,
    showNotification: showNotification
};

// Make functions available globally
window.showSettings = showSettings;
window.showGraph = showGraph; 