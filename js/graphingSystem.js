// ===== AERODYNAMICS DASHBOARD GRAPHING SYSTEM =====
// Tracks parameter values over time and creates graphs when dashboard items are clicked
// Simple and beginner-friendly code using Chart.js

class AerodynamicsGraphingSystem {
    constructor() {
        console.log('Creating Aerodynamics Graphing System...');
        
        // Settings
        this.maxDataPoints = 100; // Keep last 100 data points
        this.updateInterval = 500; // Update every 500ms
        
        // Data storage for all parameters
        this.sessionData = {
            timestamps: [],
            dragForce: [],
            liftForce: [],
            downforce: [],
            dragCoeff: [],
            liftCoeff: [],
            pressure: [],
            dynamicPressure: [],
            stagnationPressure: [],
            velocity: [],
            reynolds: [],
            frontalArea: [],
            airDensity: [],
            efficiency: []
        };
        
        // Parameter information for display
        this.parameterInfo = {
            dragForce: { label: 'Drag Force', unit: 'N', color: '#ff4444' },
            liftForce: { label: 'Lift Force', unit: 'N', color: '#44ff44' },
            downforce: { label: 'Downforce', unit: 'N', color: '#4444ff' },
            dragCoeff: { label: 'Drag Coefficient (Cd)', unit: '-', color: '#ff8844' },
            liftCoeff: { label: 'Lift Coefficient (Cl)', unit: '-', color: '#44ff88' },
            pressure: { label: 'Pressure', unit: 'kPa', color: '#8844ff' },
            dynamicPressure: { label: 'Dynamic Pressure', unit: 'kPa', color: '#ff44ff' },
            stagnationPressure: { label: 'Stagnation Pressure', unit: 'kPa', color: '#44ffff' },
            velocity: { label: 'Velocity', unit: 'm/s', color: '#ffff44' },
            reynolds: { label: 'Reynolds Number', unit: '-', color: '#ff8888' },
            frontalArea: { label: 'Frontal Area', unit: 'm²', color: '#88ff88' },
            airDensity: { label: 'Air Density', unit: 'kg/m³', color: '#8888ff' },
            efficiency: { label: 'Efficiency Rating', unit: '%', color: '#88ffff' }
        };
        
        // Current chart instance
        this.currentChart = null;
        
        // Start time for session
        this.sessionStartTime = Date.now();
        
        // Set up click handlers for dashboard items
        this.setupDashboardClickHandlers();
        
        console.log('Aerodynamics Graphing System created successfully!');
    }
    
    // Add new data point to session data
    addDataPoint(forces) {
        if (!forces) return;
        
        // Calculate time elapsed since session start (in seconds)
        const timeElapsed = (Date.now() - this.sessionStartTime) / 1000;
        
        // Add timestamp
        this.sessionData.timestamps.push(timeElapsed);
        
        // Add all parameter values
        this.sessionData.dragForce.push(forces.drag || 0);
        this.sessionData.liftForce.push(forces.lift || 0);
        this.sessionData.downforce.push(Math.abs(forces.lift) || 0); // Absolute value of lift
        this.sessionData.dragCoeff.push(forces.dragCoeff || 0);
        this.sessionData.liftCoeff.push(forces.liftCoeff || 0);
        this.sessionData.pressure.push(forces.pressure || 0);
        this.sessionData.dynamicPressure.push(forces.dynamicPressure || 0);
        this.sessionData.stagnationPressure.push(forces.stagnationPressure || 0);
        this.sessionData.velocity.push(forces.velocity || 0);
        this.sessionData.reynolds.push(forces.reynolds || 0);
        this.sessionData.frontalArea.push(forces.frontalArea || 0);
        this.sessionData.airDensity.push(forces.airDensity || 1.225);
        this.sessionData.efficiency.push(forces.efficiency || 0);
        
        // Keep only the last maxDataPoints
        if (this.sessionData.timestamps.length > this.maxDataPoints) {
            // Remove oldest data points from all arrays
            Object.keys(this.sessionData).forEach(key => {
                this.sessionData[key].shift();
            });
        }
        
        console.log('Added data point at time:', timeElapsed.toFixed(1), 's');
    }
    
    // Set up click handlers for dashboard items
    setupDashboardClickHandlers() {
        console.log('Setting up dashboard click handlers...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.attachClickHandlers();
            });
        } else {
            this.attachClickHandlers();
        }
    }
    
    // Attach click handlers to all dashboard items
    attachClickHandlers() {
        // List of dashboard items and their corresponding data keys
        const dashboardItems = {
            'drag-display': 'dragForce',
            'lift-display': 'liftForce',
            'downforce-display': 'downforce',
            'cd-display': 'dragCoeff',
            'cl-display': 'liftCoeff',
            'pressure-display': 'pressure',
            'dynamic-pressure-display': 'dynamicPressure',
            'stagnation-pressure-display': 'stagnationPressure',
            'velocity-display': 'velocity',
            'reynolds-display': 'reynolds',
            'frontal-area-display': 'frontalArea',
            'air-density-display': 'airDensity',
            'efficiency-display': 'efficiency'
        };
        
        // Add click handlers to each dashboard item
        Object.entries(dashboardItems).forEach(([className, dataKey]) => {
            const element = document.querySelector(`.${className}`);
            if (element) {
                // Add visual feedback styling
                element.style.cursor = 'pointer';
                element.style.transition = 'transform 0.2s ease';
                
                // Add hover effect
                element.addEventListener('mouseenter', () => {
                    element.style.transform = 'scale(1.05)';
                });
                
                element.addEventListener('mouseleave', () => {
                    element.style.transform = 'scale(1)';
                });
                
                // Add click handler
                element.addEventListener('click', () => {
                    console.log('Dashboard item clicked:', dataKey);
                    this.showGraph(dataKey);
                });
                
                console.log('Added click handler for:', className);
            }
        });
    }
    
    // Show graph popup for a parameter
    showGraph(parameterKey) {
        console.log('Showing graph for parameter:', parameterKey);
        
        // Check if we have data
        if (this.sessionData.timestamps.length === 0) {
            alert('No data available yet. Let the simulation run for a few seconds to collect data.');
            return;
        }
        
        // Get parameter info
        const paramInfo = this.parameterInfo[parameterKey];
        if (!paramInfo) {
            console.error('Parameter not found:', parameterKey);
            return;
        }
        
        // Get data for this parameter
        const parameterData = this.sessionData[parameterKey];
        if (!parameterData || parameterData.length === 0) {
            alert('No data available for this parameter.');
            return;
        }
        
        // Show the graph modal
        this.showGraphModal(parameterKey, paramInfo, parameterData);
    }
    
    // Show graph modal with Chart.js
    showGraphModal(parameterKey, paramInfo, parameterData) {
        // Create or get modal element
        let modal = document.getElementById('graphModal');
        if (!modal) {
            modal = this.createGraphModal();
        }
        
        // Update modal content
        const modalTitle = document.getElementById('graphModalTitle');
        modalTitle.textContent = `${paramInfo.label} Over Time`;
        
        // Get canvas element
        const canvas = document.getElementById('graphCanvas');
        
        // Destroy existing chart if it exists
        if (this.currentChart) {
            this.currentChart.destroy();
        }
        
        // Create new chart
        this.currentChart = new Chart(canvas, {
            type: 'line',
            data: {
                labels: this.sessionData.timestamps.map(t => t.toFixed(1) + 's'),
                datasets: [{
                    label: `${paramInfo.label} (${paramInfo.unit})`,
                    data: parameterData,
                    borderColor: paramInfo.color,
                    backgroundColor: paramInfo.color + '20', // Add transparency
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4 // Smooth curves
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Time (seconds)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: `${paramInfo.label} (${paramInfo.unit})`
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: `${paramInfo.label} vs Time`
                    }
                }
            }
        });
        
        // Show modal
        modal.style.display = 'flex';
    }
    
    // Create graph modal HTML
    createGraphModal() {
        const modal = document.createElement('div');
        modal.id = 'graphModal';
        modal.innerHTML = `
            <div class="graph-modal-content">
                <div class="graph-modal-header">
                    <h3 id="graphModalTitle">Parameter Graph</h3>
                    <span class="graph-modal-close">&times;</span>
                </div>
                <div class="graph-modal-body">
                    <canvas id="graphCanvas"></canvas>
                </div>
            </div>
        `;
        
        // Add CSS styling
        const style = document.createElement('style');
        style.textContent = `
            #graphModal {
                display: none;
                position: fixed;
                z-index: 1000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.8);
                justify-content: center;
                align-items: center;
            }
            
            .graph-modal-content {
                background-color: #1a1a1a;
                border-radius: 10px;
                padding: 20px;
                width: 80%;
                max-width: 800px;
                height: 600px;
                display: flex;
                flex-direction: column;
                border: 2px solid #333;
            }
            
            .graph-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                border-bottom: 1px solid #333;
                padding-bottom: 10px;
            }
            
            .graph-modal-header h3 {
                margin: 0;
                color: #fff;
                font-size: 18px;
            }
            
            .graph-modal-close {
                color: #aaa;
                font-size: 28px;
                font-weight: bold;
                cursor: pointer;
                transition: color 0.3s;
            }
            
            .graph-modal-close:hover {
                color: #fff;
            }
            
            .graph-modal-body {
                flex: 1;
                position: relative;
            }
            
            #graphCanvas {
                width: 100% !important;
                height: 100% !important;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(modal);
        
        // Add close functionality
        const closeBtn = modal.querySelector('.graph-modal-close');
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            if (this.currentChart) {
                this.currentChart.destroy();
                this.currentChart = null;
            }
        });
        
        // Close when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                if (this.currentChart) {
                    this.currentChart.destroy();
                    this.currentChart = null;
                }
            }
        });
        
        return modal;
    }
    
    // Clear all session data
    clearSessionData() {
        console.log('Clearing session data...');
        
        // Reset all data arrays
        Object.keys(this.sessionData).forEach(key => {
            this.sessionData[key] = [];
        });
        
        // Reset session start time
        this.sessionStartTime = Date.now();
        
        console.log('Session data cleared');
    }
    
    // Get session data for export
    getSessionData() {
        return this.sessionData;
    }
}

// Create global instance
let aerodynamicsGraphingSystem = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    aerodynamicsGraphingSystem = new AerodynamicsGraphingSystem();
}); 