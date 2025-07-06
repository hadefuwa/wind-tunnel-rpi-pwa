// ===== WIND TUNNEL PWA MAIN APPLICATION =====
// Simple and beginner-friendly code for Raspberry Pi PWA

// Global variables to store important objects
let windTunnelApp = null;
let canvas = null;
let loadingScreen = null;

// Application state
let appState = {
    isLoaded: false,
    windSpeed: 50,
    carAngle: 0,
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
    
    if (dragElement) {
        dragElement.textContent = dragForce.toFixed(2) + ' N';
        dragElement.classList.add('data-updating');
        setTimeout(() => dragElement.classList.remove('data-updating'), 500);
    }
    
    if (liftElement) {
        liftElement.textContent = liftForce.toFixed(2) + ' N';
        liftElement.classList.add('data-updating');
        setTimeout(() => liftElement.classList.remove('data-updating'), 500);
    }
    
    if (pressureElement) {
        pressureElement.textContent = pressure.toFixed(1) + ' kPa';
        pressureElement.classList.add('data-updating');
        setTimeout(() => pressureElement.classList.remove('data-updating'), 500);
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
    if (windTunnelApp) {
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

// Export functions for other scripts to use
window.WindTunnelMain = {
    updateDataDisplay: updateDataDisplay,
    appState: appState
}; 