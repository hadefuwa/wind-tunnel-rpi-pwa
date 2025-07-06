// ===== WIND TUNNEL PWA MAIN APPLICATION =====
// Simple and beginner-friendly code for Raspberry Pi PWA

// Global variables to store important objects
let windTunnelApp = null;
let canvas = null;
let loadingScreen = null;
let dataExportSystem = null;

// Application state
let appState = {
    isLoaded: false,
    windSpeed: 50,
    carAngle: 0,
    carType: 'f1',
    currentView: 'front',
    fpsCounter: 0,
    lastFpsTime: 0
};

// Wait for the page to load completely
document.addEventListener('DOMContentLoaded', function() {
    console.log('Wind Tunnel PWA Starting...');
    
    // Get important HTML elements
    canvas = document.getElementById('windTunnelCanvas');
    loadingScreen = document.getElementById('loadingScreen');
    
    // Start the application
    initializeApp();
});

// Initialize the main application
function initializeApp() {
    console.log('Initializing Wind Tunnel Application...');
    
    try {
        // Set up the 3D wind tunnel
        setupWindTunnel();
        
        // Set up all the control buttons and sliders
        setupControls();
        
        // Set up PWA features
        setupPWA();
        
        // Set up data export system
        setupDataExport();
        
        // Start the animation loop
        startAnimationLoop();
        
        console.log('Application initialized successfully!');
        
    } catch (error) {
        console.error('Error initializing application:', error);
        showError('Failed to start the application. Please refresh the page.');
    }
}

// Set up the 3D wind tunnel scene
function setupWindTunnel() {
    console.log('Setting up 3D Wind Tunnel...');
    
    // Create a new WindTunnelApp instance
    windTunnelApp = new WindTunnelApp(canvas);
    
    // Hide loading screen after setup
    setTimeout(function() {
        loadingScreen.style.display = 'none';
        appState.isLoaded = true;
        console.log('Wind tunnel setup complete!');
    }, 2000);
}

// Set up all the control buttons and sliders
function setupControls() {
    console.log('Setting up controls...');
    
    // Wind speed slider
    const windSpeedSlider = document.getElementById('windSpeed');
    const windSpeedValue = document.getElementById('windSpeedValue');
    
    windSpeedSlider.addEventListener('input', function() {
        appState.windSpeed = parseInt(this.value);
        windSpeedValue.textContent = appState.windSpeed + ' MPH';
        
        // Update large wind speed display
        const windSpeedLarge = document.getElementById('windSpeedLarge');
        if (windSpeedLarge) {
            windSpeedLarge.textContent = appState.windSpeed;
            windSpeedLarge.classList.add('updating');
            setTimeout(() => windSpeedLarge.classList.remove('updating'), 500);
        }
        
        // Update the wind tunnel
        if (windTunnelApp) {
            windTunnelApp.setWindSpeed(appState.windSpeed);
        }
        
        // Add visual feedback
        this.classList.add('slider-active');
        setTimeout(() => this.classList.remove('slider-active'), 300);
    });
    
    // Car angle slider
    const carAngleSlider = document.getElementById('carAngle');
    const carAngleValue = document.getElementById('carAngleValue');
    
    carAngleSlider.addEventListener('input', function() {
        appState.carAngle = parseInt(this.value);
        carAngleValue.textContent = appState.carAngle + '°';
        
        // Update the wind tunnel
        if (windTunnelApp) {
            windTunnelApp.setCarAngle(appState.carAngle);
        }
        
        // Add visual feedback
        this.classList.add('slider-active');
        setTimeout(() => this.classList.remove('slider-active'), 300);
    });
    
    // Car type selection
    const carTypeSelect = document.getElementById('carType');
    const carDescription = document.getElementById('carDescription');
    
    carTypeSelect.addEventListener('change', function() {
        appState.carType = this.value;
        
        // Update the wind tunnel
        if (windTunnelApp) {
            windTunnelApp.setCarType(appState.carType);
        }
        
        // Update car description
        updateCarDescription(appState.carType);
        
        // Add visual feedback
        this.classList.add('select-active');
        setTimeout(() => this.classList.remove('select-active'), 300);
        
        console.log('Car type changed to:', appState.carType);
    });
    
    // Camera view buttons
    setupCameraButtons();
}

// Set up camera view buttons
function setupCameraButtons() {
    const frontViewBtn = document.getElementById('frontView');
    const sideViewBtn = document.getElementById('sideView');
    const topViewBtn = document.getElementById('topView');
    
    // Front view button
    frontViewBtn.addEventListener('click', function() {
        setActiveView('front', this);
        if (windTunnelApp) {
            windTunnelApp.setCameraView('front');
        }
    });
    
    // Side view button
    sideViewBtn.addEventListener('click', function() {
        setActiveView('side', this);
        if (windTunnelApp) {
            windTunnelApp.setCameraView('side');
        }
    });
    
    // Top view button
    topViewBtn.addEventListener('click', function() {
        setActiveView('top', this);
        if (windTunnelApp) {
            windTunnelApp.setCameraView('top');
        }
    });
}

// Set which camera view button is active
function setActiveView(viewName, buttonElement) {
    // Remove active class from all buttons
    const allButtons = document.querySelectorAll('.view-btn');
    allButtons.forEach(btn => btn.classList.remove('active'));
    
    // Add active class to clicked button
    buttonElement.classList.add('active');
    buttonElement.classList.add('button-pressed');
    
    // Remove animation class after animation completes
    setTimeout(() => buttonElement.classList.remove('button-pressed'), 200);
    
    // Update app state
    appState.currentView = viewName;
    
    console.log('Camera view changed to:', viewName);
}

// Update car description based on selected car type
function updateCarDescription(carType) {
    const carDescription = document.getElementById('carDescription');
    
    const descriptions = {
        f1: "Formula 1 racing car with maximum downforce",
        sedan: "Standard passenger car with good aerodynamics",
        sports: "Low-profile car with aggressive aerodynamics",
        suv: "Tall vehicle with higher drag coefficient",
        truck: "Large vehicle with poor aerodynamics"
    };
    
    if (carDescription && descriptions[carType]) {
        carDescription.textContent = descriptions[carType];
        carDescription.classList.add('description-updating');
        setTimeout(() => carDescription.classList.remove('description-updating'), 500);
    }
}

// Set up data export system
function setupDataExport() {
    console.log('Setting up data export system...');
    
    // Initialize the data export system
    dataExportSystem = new DataExportSystem();
    
    // Set up export button event listeners
    setupExportControls();
    
    // Set up test history panel
    setupTestHistoryPanel();
}

// Set up export control buttons
function setupExportControls() {
    const recordTestBtn = document.getElementById('recordTest');
    const exportCSVBtn = document.getElementById('exportCSV');
    const exportJSONBtn = document.getElementById('exportJSON');
    const clearDataBtn = document.getElementById('clearData');
    
    // Record Test button
    recordTestBtn.addEventListener('click', function() {
        if (dataExportSystem && windTunnelApp) {
            // Get current aerodynamic data
            const currentForces = windTunnelApp.getCurrentForces();
            
            if (currentForces) {
                const testResult = dataExportSystem.recordTest(
                    appState.windSpeed,
                    appState.carAngle,
                    appState.carType,
                    currentForces
                );
                
                // Visual feedback
                this.classList.add('button-pressed');
                setTimeout(() => this.classList.remove('button-pressed'), 200);
                
                // Show notification
                showNotification(`Test #${testResult.id} recorded!`, 'success');
            } else {
                showNotification('Unable to record test - no data available', 'error');
            }
        }
    });
    
    // Export CSV button
    exportCSVBtn.addEventListener('click', function() {
        if (dataExportSystem) {
            dataExportSystem.exportToCSV();
            
            // Visual feedback
            this.classList.add('button-pressed');
            setTimeout(() => this.classList.remove('button-pressed'), 200);
        }
    });
    
    // Export JSON button
    exportJSONBtn.addEventListener('click', function() {
        if (dataExportSystem) {
            dataExportSystem.exportToJSON();
            
            // Visual feedback
            this.classList.add('button-pressed');
            setTimeout(() => this.classList.remove('button-pressed'), 200);
        }
    });
    
    // Clear Data button
    clearDataBtn.addEventListener('click', function() {
        if (dataExportSystem) {
            dataExportSystem.clearHistory();
            
            // Visual feedback
            this.classList.add('button-pressed');
            setTimeout(() => this.classList.remove('button-pressed'), 200);
        }
    });
}

// Set up test history panel
function setupTestHistoryPanel() {
    console.log('Setting up test history panel...');
    
    const toggleHistory = document.getElementById('toggleHistory');
    const testHistoryPanel = document.getElementById('testHistoryPanel');
    
    if (toggleHistory && testHistoryPanel) {
        toggleHistory.addEventListener('click', function() {
            testHistoryPanel.classList.toggle('collapsed');
            
            const isCollapsed = testHistoryPanel.classList.contains('collapsed');
            this.textContent = isCollapsed ? '▲' : '▼';
            
            console.log('Test history panel', isCollapsed ? 'collapsed' : 'expanded');
        });
    }
}

// Show notification to user
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 50px;
        right: 350px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#F44336' : '#2196F3'};
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: bold;
        z-index: 1000;
        opacity: 0;
        transform: translateX(100px);
        transition: all 0.3s ease;
    `;
    
    // Add to page
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

// Set up Progressive Web App features
function setupPWA() {
    console.log('Setting up PWA features...');
    
    // Register service worker for offline functionality
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(function(registration) {
                console.log('Service Worker registered successfully');
            })
            .catch(function(error) {
                console.log('Service Worker registration failed:', error);
            });
    }
    
    // Handle PWA install prompt
    window.addEventListener('beforeinstallprompt', function(event) {
        event.preventDefault();
        console.log('PWA install prompt available');
        
        // You can show a custom install button here if needed
        // For now, we'll just log that it's available
    });
}

// Start the main animation loop
function startAnimationLoop() {
    console.log('Starting animation loop...');
    
    // Keep track of FPS
    setInterval(updateFPS, 1000);
    
    // Start the main render loop
    requestAnimationFrame(mainLoop);
}

// Main animation loop - runs 60 times per second
function mainLoop(currentTime) {
    try {
        // Update the wind tunnel animation
        if (windTunnelApp && appState.isLoaded) {
            windTunnelApp.update(currentTime);
        }
        
        // Update FPS counter
        appState.fpsCounter++;
        
        // Continue the loop
        requestAnimationFrame(mainLoop);
        
    } catch (error) {
        console.error('Error in main loop:', error);
    }
}

// Update FPS counter display
function updateFPS() {
    const fpsElement = document.getElementById('fpsCounter');
    if (fpsElement) {
        fpsElement.textContent = 'FPS: ' + appState.fpsCounter;
        appState.fpsCounter = 0;
    }
}

// Update the real-time data display
function updateDataDisplay(dragForce, liftForce, pressure) {
    const dragElement = document.getElementById('dragValue');
    const liftElement = document.getElementById('liftValue');
    const pressureElement = document.getElementById('pressureValue');
    
    const dragBar = document.getElementById('dragBar');
    const liftBar = document.getElementById('liftBar');
    const pressureBar = document.getElementById('pressureBar');
    
    if (dragElement) {
        dragElement.textContent = dragForce.toFixed(2);
        dragElement.classList.add('updating');
        setTimeout(() => dragElement.classList.remove('updating'), 500);
    }
    
    if (liftElement) {
        liftElement.textContent = liftForce.toFixed(2);
        liftElement.classList.add('updating');
        setTimeout(() => liftElement.classList.remove('updating'), 500);
    }
    
    if (pressureElement) {
        pressureElement.textContent = pressure.toFixed(1);
        pressureElement.classList.add('updating');
        setTimeout(() => pressureElement.classList.remove('updating'), 500);
    }
    
    // Update progress bars with better scaling
    if (dragBar) {
        // Scale drag: 0-3N = 0-100%
        const dragPercent = Math.min(Math.max(Math.abs(dragForce) / 3.0 * 100, 5), 100);
        dragBar.style.width = dragPercent + '%';
    }
    
    if (liftBar) {
        // Scale lift: -2 to 2N = 0-100% (absolute value)
        const liftPercent = Math.min(Math.max(Math.abs(liftForce) / 2.0 * 100, 5), 100);
        liftBar.style.width = liftPercent + '%';
    }
    
    if (pressureBar) {
        // Scale pressure: 0-8kPa = 0-100%
        const pressurePercent = Math.min(Math.max(pressure / 8.0 * 100, 5), 100);
        pressureBar.style.width = pressurePercent + '%';
    }
}

// Show error message to user
function showError(message) {
    console.error('Application Error:', message);
    
    // You can add a user-friendly error display here
    // For now, we'll just log it to the console
    
    // Hide loading screen if there's an error
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }
}

// Handle window resize (important for responsive design)
window.addEventListener('resize', function() {
    if (windTunnelApp && appState.isLoaded) {
        windTunnelApp.handleResize();
    }
});

// Handle visibility changes (when user switches tabs)
document.addEventListener('visibilitychange', function() {
    if (windTunnelApp) {
        if (document.hidden) {
            windTunnelApp.pause();
        } else {
            windTunnelApp.resume();
        }
    }
});

// Export global functions for external access
window.WindTunnelMain = {
    appState: appState,
    updateDataDisplay: updateDataDisplay,
    showNotification: showNotification
}; 