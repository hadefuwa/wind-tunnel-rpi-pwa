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
    
    // Expose carManager globally for setup page
    window.carManager = windTunnelApp.carModel;
    
    // Expose carSettings globally for setup page
    window.carSettings = windTunnelApp.carModel.settingsStorage;
    
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
        
        // Show/hide STL upload section based on selection
        const stlUploadSection = document.getElementById('stlUploadSection');
        const stlSetupNavSection = document.getElementById('stlSetupNavSection');
        
        if (this.value === 'custom') {
            stlUploadSection.style.display = 'block';
            stlSetupNavSection.style.display = 'none'; // Hide until STL is loaded
        } else {
            stlUploadSection.style.display = 'none';
            
            // Show STL setup navigation for STL car types
            const carTypes = windTunnelApp?.carModel?.carTypes || {};
            if (carTypes[this.value]?.isSTL) {
                stlSetupNavSection.style.display = 'block';
            } else {
                stlSetupNavSection.style.display = 'none';
            }
        }
        
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
    
    // STL file upload
    setupSTLUpload();
    
    // STL setup is now handled by the setup page
    
    // Refresh settings button
    setupRefreshButton();
    
    // Edit position system
    setupEditPositionSystem();
    
    // Camera view buttons
    setupCameraButtons();
}

// Set up STL file upload functionality
function setupSTLUpload() {
    console.log('Setting up STL upload...');
    
    const stlFileInput = document.getElementById('stlFileInput');
    const uploadStatus = document.getElementById('uploadStatus');
    
    if (stlFileInput && uploadStatus) {
        stlFileInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            
            if (file) {
                console.log('STL file selected:', file.name);
                
                // Check if file is STL
                if (!file.name.toLowerCase().endsWith('.stl')) {
                    uploadStatus.textContent = 'Please select an STL file';
                    uploadStatus.className = 'upload-status error';
                    return;
                }
                
                // Update status
                uploadStatus.textContent = 'Loading ' + file.name + '...';
                uploadStatus.className = 'upload-status';
                
                // Load the STL file
                if (windTunnelApp && windTunnelApp.carModel) {
                    windTunnelApp.carModel.loadCustomSTL(
                        file,
                        (geometry) => {
                            // Success callback
                            uploadStatus.textContent = 'Loaded: ' + file.name;
                            uploadStatus.className = 'upload-status success';
                            
                            // Update car description
                            updateCarDescription('custom');
                            
                            // Show STL setup navigation for custom STL
                            const stlSetupNavSection = document.getElementById('stlSetupNavSection');
                            stlSetupNavSection.style.display = 'block';
                            
                            console.log('Custom STL loaded successfully');
                        },
                        (error) => {
                            // Error callback
                            uploadStatus.textContent = 'Error loading ' + file.name;
                            uploadStatus.className = 'upload-status error';
                            
                            console.error('Error loading custom STL:', error);
                            showNotification('Error loading STL file', 'error');
                        }
                    );
                } else {
                    uploadStatus.textContent = 'Wind tunnel not ready';
                    uploadStatus.className = 'upload-status error';
                }
            } else {
                uploadStatus.textContent = 'No file selected';
                uploadStatus.className = 'upload-status';
            }
        });
    }
}

// STL rotation controls are now handled by the setup page

// STL position controls are now handled by the setup page

// Set up refresh settings button
function setupRefreshButton() {
    console.log('Setting up refresh button...');
    
    const refreshBtn = document.getElementById('refreshSettings');
    
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            console.log('Refreshing settings...');
            
            // Visual feedback
            this.classList.add('button-pressed');
            this.textContent = '🔄 Refreshing...';
            
            // Reload the current car model with saved settings
            if (windTunnelApp && windTunnelApp.carModel) {
                const currentCarType = windTunnelApp.carModel.getCurrentCarType();
                
                // Force update cached position
                windTunnelApp.carModel.updateCachedPosition();
                
                // Recreate the car with fresh settings
                windTunnelApp.carModel.setCarType(currentCarType);
                
                // Show notification
                showNotification('Settings refreshed successfully!', 'success');
                
                console.log('Settings refreshed for car type:', currentCarType);
            } else {
                showNotification('Unable to refresh - wind tunnel not ready', 'error');
            }
            
            // Reset button after delay
            setTimeout(() => {
                this.classList.remove('button-pressed');
                this.textContent = '🔄 Refresh Settings';
            }, 1000);
        });
    }
}

// Set up edit position system
function setupEditPositionSystem() {
    console.log('Setting up edit position system...');
    
    const editPositionBtn = document.getElementById('editPositionBtn');
    const savePositionBtn = document.getElementById('savePositionBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const editModeInfo = document.getElementById('editModeInfo');
    const currentViewMode = document.getElementById('currentViewMode');
    
    let isEditMode = false;
    let originalPosition = null;
    
    // Edit Position button
    if (editPositionBtn) {
        editPositionBtn.addEventListener('click', function() {
            if (!windTunnelApp || !windTunnelApp.carModel) {
                showNotification('Wind tunnel not ready', 'error');
                return;
            }
            
            // Check if current car is STL
            if (!windTunnelApp.carModel.isSTLCar()) {
                showNotification('Edit position only works with STL models', 'error');
                return;
            }
            
            // Enter edit mode
            isEditMode = true;
            originalPosition = windTunnelApp.carModel.getPosition();
            
            // Update UI
            this.classList.add('active');
            this.textContent = '✏️ Editing...';
            savePositionBtn.style.display = 'inline-block';
            cancelEditBtn.style.display = 'inline-block';
            editModeInfo.style.display = 'block';
            
            // Update view mode indicator
            updateViewModeIndicator();
            
            // Enable arrow key controls
            enableArrowKeyControls();
            
            // Show arrow controls
            showArrowControls();
            
            // Add visual feedback overlay
            addEditModeOverlay();
            
            showNotification('Edit mode enabled - tap arrow buttons to position your STL model!', 'success');
            console.log('Edit position mode enabled');
        });
    }
    
    // Save Position button
    if (savePositionBtn) {
        savePositionBtn.addEventListener('click', function() {
            if (!isEditMode) return;
            
            // Get current position
            const currentPosition = windTunnelApp.carModel.getPosition();
            const currentCarType = windTunnelApp.carModel.getCurrentCarType();
            
            // Save to settings
            if (window.carSettings) {
                window.carSettings.setPosition(currentCarType, currentPosition);
                windTunnelApp.carModel.updateCachedPosition();
            }
            
            // Exit edit mode
            exitEditMode();
            
            showNotification('Position saved successfully!', 'success');
            console.log('Position saved:', currentPosition);
        });
    }
    
    // Cancel Edit button
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', function() {
            if (!isEditMode) return;
            
            // Restore original position
            if (originalPosition) {
                windTunnelApp.carModel.setPosition(originalPosition.x, originalPosition.y, originalPosition.z);
            }
            
            // Exit edit mode
            exitEditMode();
            
            showNotification('Edit cancelled - position restored', 'info');
            console.log('Edit position cancelled');
        });
    }
    
    // Function to exit edit mode
    function exitEditMode() {
        isEditMode = false;
        originalPosition = null;
        
        // Update UI
        editPositionBtn.classList.remove('active');
        editPositionBtn.textContent = '✏️ Edit Position';
        savePositionBtn.style.display = 'none';
        cancelEditBtn.style.display = 'none';
        editModeInfo.style.display = 'none';
        
        // Disable arrow key controls
        disableArrowKeyControls();
        
        // Hide arrow controls
        hideArrowControls();
        
        // Remove visual feedback overlay
        removeEditModeOverlay();
    }
    
    // Function to update view mode indicator
    function updateViewModeIndicator() {
        if (!currentViewMode) return;
        
        const currentView = appState.currentView;
        let modeText = '';
        
        switch (currentView) {
            case 'front':
                modeText = 'Front View: ←→ Left/Right, ↑↓ Up/Down';
                break;
            case 'side':
                modeText = 'Side View: ←→ Forward/Back, ↑↓ Up/Down';
                break;
            case 'top':
                modeText = 'Top View: ←→ Left/Right, ↑↓ Toward/Away Wind';
                break;
            default:
                modeText = 'Front View: ←→ Left/Right, ↑↓ Up/Down';
        }
        
        currentViewMode.textContent = modeText;
    }
    
    // Function to enable arrow key controls
    function enableArrowKeyControls() {
        if (!windTunnelApp) return;
        
        // Enable arrow key mode in wind tunnel
        windTunnelApp.enableArrowKeyMode(appState.currentView);
        
        console.log('Arrow key controls enabled for view:', appState.currentView);
    }
    
    // Function to disable arrow key controls
    function disableArrowKeyControls() {
        if (!windTunnelApp) return;
        
        // Disable arrow key mode in wind tunnel
        windTunnelApp.disableArrowKeyMode();
        
        console.log('Arrow key controls disabled');
    }
    
    // Update view mode when camera view changes
    window.addEventListener('cameraViewChanged', function(event) {
        if (isEditMode) {
            updateViewModeIndicator();
            // Update arrow key controls for new view
            enableArrowKeyControls();
            // Update arrow button states for new view
            updateArrowButtonStates();
        }
    });
    
    // Function to add edit mode overlay
    function addEditModeOverlay() {
        // Remove existing overlay if any
        removeEditModeOverlay();
        
        // Create overlay element
        const overlay = document.createElement('div');
        overlay.id = 'editModeOverlay';
        overlay.className = 'edit-mode-active';
        overlay.innerHTML = '✏️ EDIT MODE ACTIVE - Use arrow keys to position your STL model';
        
        // Add to page
        document.body.appendChild(overlay);
        
        console.log('Edit mode overlay added');
    }
    
    // Function to remove edit mode overlay
    function removeEditModeOverlay() {
        const overlay = document.getElementById('editModeOverlay');
        if (overlay) {
            overlay.remove();
            console.log('Edit mode overlay removed');
        }
    }
    
    // Function to show arrow controls
    function showArrowControls() {
        const arrowControls = document.getElementById('arrowControls');
        if (arrowControls) {
            arrowControls.style.display = 'block';
            
            // Set up button event listeners
            setupArrowButtons();
            
            // Update button states based on current view
            updateArrowButtonStates();
            
            console.log('Arrow controls shown');
        }
    }
    
    // Function to hide arrow controls
    function hideArrowControls() {
        const arrowControls = document.getElementById('arrowControls');
        if (arrowControls) {
            arrowControls.style.display = 'none';
            console.log('Arrow controls hidden');
        }
    }
    
    // Function to set up arrow button event listeners
    function setupArrowButtons() {
        const arrowUp = document.getElementById('arrowUp');
        const arrowDown = document.getElementById('arrowDown');
        const arrowLeft = document.getElementById('arrowLeft');
        const arrowRight = document.getElementById('arrowRight');
        
        // Remove existing listeners to prevent duplicates
        arrowUp.replaceWith(arrowUp.cloneNode(true));
        arrowDown.replaceWith(arrowDown.cloneNode(true));
        arrowLeft.replaceWith(arrowLeft.cloneNode(true));
        arrowRight.replaceWith(arrowRight.cloneNode(true));
        
        // Get fresh references after cloning
        const newArrowUp = document.getElementById('arrowUp');
        const newArrowDown = document.getElementById('arrowDown');
        const newArrowLeft = document.getElementById('arrowLeft');
        const newArrowRight = document.getElementById('arrowRight');
        
        // Add event listeners
        newArrowUp.addEventListener('click', () => {
            if (windTunnelApp && windTunnelApp.moveCarWithButton) {
                windTunnelApp.moveCarWithButton('up');
            }
        });
        
        newArrowDown.addEventListener('click', () => {
            if (windTunnelApp && windTunnelApp.moveCarWithButton) {
                windTunnelApp.moveCarWithButton('down');
            }
        });
        
        newArrowLeft.addEventListener('click', () => {
            if (windTunnelApp && windTunnelApp.moveCarWithButton) {
                windTunnelApp.moveCarWithButton('left');
            }
        });
        
        newArrowRight.addEventListener('click', () => {
            if (windTunnelApp && windTunnelApp.moveCarWithButton) {
                windTunnelApp.moveCarWithButton('right');
            }
        });
        
        console.log('Arrow button event listeners set up');
    }
    
    // Function to update arrow button states based on current view
    function updateArrowButtonStates() {
        const arrowUp = document.getElementById('arrowUp');
        const arrowDown = document.getElementById('arrowDown');
        const arrowLeft = document.getElementById('arrowLeft');
        const arrowRight = document.getElementById('arrowRight');
        const arrowInstructions = document.getElementById('arrowInstructions');
        
        if (!arrowUp || !arrowDown || !arrowLeft || !arrowRight || !arrowInstructions) return;
        
        // Enable all buttons in all views
        arrowUp.disabled = false;
        arrowDown.disabled = false;
        arrowLeft.disabled = false;
        arrowRight.disabled = false;
        
        // Update instructions text based on current view
        const currentView = appState.currentView;
        let instructionText = '';
        
        switch (currentView) {
            case 'front':
                instructionText = '←→ Left/Right, ↑↓ Up/Down';
                break;
            case 'side':
                instructionText = '←→ Forward/Back, ↑↓ Up/Down';
                break;
            case 'top':
                instructionText = '←→ Left/Right, ↑↓ Toward/Away Wind';
                break;
            default:
                instructionText = '←→ Left/Right, ↑↓ Up/Down';
        }
        
        arrowInstructions.textContent = instructionText;
        
        console.log('Arrow button states updated - all directions enabled for view:', appState.currentView);
    }
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
        // Dispatch camera view changed event
        window.dispatchEvent(new CustomEvent('cameraViewChanged', {
            detail: { view: 'front' }
        }));
    });
    
    // Side view button
    sideViewBtn.addEventListener('click', function() {
        setActiveView('side', this);
        if (windTunnelApp) {
            windTunnelApp.setCameraView('side');
        }
        // Dispatch camera view changed event
        window.dispatchEvent(new CustomEvent('cameraViewChanged', {
            detail: { view: 'side' }
        }));
    });
    
    // Top view button
    topViewBtn.addEventListener('click', function() {
        setActiveView('top', this);
        if (windTunnelApp) {
            windTunnelApp.setCameraView('top');
        }
        // Dispatch camera view changed event
        window.dispatchEvent(new CustomEvent('cameraViewChanged', {
            detail: { view: 'top' }
        }));
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
        f1: "Formula 1 racing car with maximum downforce (STL model)",
        sedan: "Standard passenger car with good aerodynamics",
        sports: "Low-profile car with aggressive aerodynamics",
        suv: "Tall vehicle with higher drag coefficient",
        truck: "Large vehicle with poor aerodynamics",
        custom: "Your custom uploaded STL car model"
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

// Update the real-time data display with all parameters
function updateDataDisplay(dragForce, liftForce, pressure, allForces) {
    // Helper function to update a parameter
    function updateParameter(elementId, barId, value, precision = 2, maxValue = 100) {
        const element = document.getElementById(elementId);
        const bar = document.getElementById(barId);
        
        if (element) {
            element.textContent = value.toFixed(precision);
            element.classList.add('updating');
            setTimeout(() => element.classList.remove('updating'), 500);
        }
        
        if (bar) {
            const percent = Math.min(Math.max(Math.abs(value) / maxValue * 100, 5), 100);
            bar.style.width = percent + '%';
        }
    }
    
    // Update primary forces
    updateParameter('dragValue', 'dragBar', dragForce, 2, 3);
    updateParameter('liftValue', 'liftBar', liftForce, 2, 2);
    updateParameter('pressureValue', 'pressureBar', pressure, 1, 8);
    
    // Update new parameters if available
    if (allForces) {
        // Forces
        updateParameter('downforceValue', 'downforceBar', allForces.downforce || 0, 2, 2);
        
        // Coefficients
        updateParameter('cdValue', 'cdBar', allForces.dragCoefficient || 0, 3, 1);
        updateParameter('clValue', 'clBar', allForces.liftCoefficient || 0, 3, 1);
        
        // Pressures
        updateParameter('dynamicPressureValue', 'dynamicPressureBar', allForces.dynamicPressure || 0, 2, 5);
        updateParameter('stagnationPressureValue', 'stagnationPressureBar', allForces.stagnationPressure || 0, 1, 110);
        
        // Flow properties
        updateParameter('velocityValue', 'velocityBar', allForces.velocity || 0, 1, 50);
        
        // Reynolds number (format as millions)
        const reynoldsElement = document.getElementById('reynoldsValue');
        const reynoldsBar = document.getElementById('reynoldsBar');
        if (reynoldsElement && allForces.reynoldsNumber) {
            const reynoldsMillions = allForces.reynoldsNumber / 1000000;
            reynoldsElement.textContent = reynoldsMillions.toFixed(1) + 'M';
            reynoldsElement.classList.add('updating');
            setTimeout(() => reynoldsElement.classList.remove('updating'), 500);
        }
        if (reynoldsBar && allForces.reynoldsNumber) {
            const reynoldsPercent = Math.min(Math.max(allForces.reynoldsNumber / 10000000 * 100, 5), 100);
            reynoldsBar.style.width = reynoldsPercent + '%';
        }
        
        // Car properties
        updateParameter('frontalAreaValue', 'frontalAreaBar', allForces.frontalArea || 0, 1, 4);
        updateParameter('airDensityValue', 'airDensityBar', allForces.airDensity || 0, 3, 2);
        
        // Performance
        updateParameter('efficiencyValue', 'efficiencyBar', allForces.efficiency || 0, 0, 100);
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