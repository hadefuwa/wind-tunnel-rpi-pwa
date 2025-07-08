// ===== WIND TUNNEL APP CLASS =====
// Main 3D Wind Tunnel Application using Three.js
// Simple and beginner-friendly code

class WindTunnelApp {
    constructor(canvas) {
        console.log('Creating Wind Tunnel App...');
        
        // Store the canvas element
        this.canvas = canvas;
        
        // Initialize basic settings
        this.windSpeed = 50;
        this.carAngle = 0;
        this.isPaused = false;
        
        // Initialize Three.js components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.carModel = null;
        this.windParticles = null;
        this.aerodynamicsCalculator = null;
        
        // Set up the 3D scene
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupLighting();
        this.setupTunnel();
        
        // Create wind effects and car
        this.createWindEffects();
        this.createCarModel();
        
        // Initialize physics calculator
        this.aerodynamicsCalculator = new AerodynamicsCalculator();
        
        // Initialize arrow key system
        this.initializeArrowKeySystem();
        
        console.log('Wind Tunnel App created successfully!');
    }
    
    // Set up the basic 3D scene
    setupScene() {
        console.log('Setting up 3D scene...');
        
        // Create a new Three.js scene
        this.scene = new THREE.Scene();
        
        // Set background color (dark blue like a real wind tunnel)
        this.scene.background = new THREE.Color(0x001122);
        
        // Add some fog for depth
        this.scene.fog = new THREE.Fog(0x001122, 10, 50);
    }
    
    // Set up the camera
    setupCamera() {
        console.log('Setting up camera...');
        
        // Create perspective camera
        // (field of view, aspect ratio, near plane, far plane)
        this.camera = new THREE.PerspectiveCamera(
            75, 
            this.canvas.clientWidth / this.canvas.clientHeight, 
            0.1, 
            1000
        );
        
        // Set initial camera position (front view)
        this.camera.position.set(0, 0, 10);
        this.camera.lookAt(0, 0, 0);
    }
    
    // Set up the renderer
    setupRenderer() {
        console.log('Setting up renderer...');
        
        // Create WebGL renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: false, // Disable for better performance on Pi
            alpha: false
        });
        
        // Set size to match canvas
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        
        // Set pixel ratio (limit to 2 for performance)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // Optimize for Raspberry Pi
        this.renderer.shadowMap.enabled = false; // Disable shadows for performance
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    }
    
    // Set up lighting
    setupLighting() {
        console.log('Setting up lighting...');
        
        // Add ambient light (soft overall lighting)
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        // Add directional light (like sunlight)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 10, 5);
        this.scene.add(directionalLight);
        
        // Add another light from the side
        const sideLight = new THREE.DirectionalLight(0x4488ff, 0.5);
        sideLight.position.set(-5, 0, 5);
        this.scene.add(sideLight);
    }
    
    // Set up the wind tunnel structure
    setupTunnel() {
        console.log('Setting up wind tunnel...');
        
        // Create rectangular test section (more realistic wind tunnel)
        this.createTestSection();
        
        // Create wind direction indicators
        this.createWindIndicators();
    }
    
    // Create a rectangular test section with solid floor
    createTestSection() {
        console.log('Creating rectangular test section...');
        
        // Test section dimensions (12 wide, 6 deep as requested)
        const width = 6;   // Depth of test section (6 deep)
        const height = 4;  // Height of test section (smaller for better view)
        const length = 12; // Width of test section (12 wide)
        
        // Create solid floor
        this.createSolidFloor(length, width, height);
        
        // Create test section grid on floor for reference (12 wide, 6 deep)
        const gridHelper = new THREE.GridHelper(length, 24, 0x444444, 0x222222); // 24 divisions for 12 wide
        gridHelper.position.y = -height / 2 + 0.01; // Slightly above floor
        gridHelper.rotateY(Math.PI / 2); // Rotate to align with new dimensions
        this.scene.add(gridHelper);
        
        console.log('Rectangular test section created');
    }
    
    // Create solid floor for the test section
    createSolidFloor(length, width, height) {
        // Create solid floor material
        const floorMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x333333,  // Dark gray
            side: THREE.DoubleSide
        });
        
        // Create floor geometry
        const floorGeometry = new THREE.PlaneGeometry(length, width);
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        
        // Position the floor
        floor.rotation.x = -Math.PI / 2;  // Rotate to be horizontal
        floor.position.y = -height / 2;   // Position at bottom of test section
        
        // Add to scene
        this.scene.add(floor);
        
        console.log('Solid floor created');
    }
    

    
    // Create wind direction indicators
    createWindIndicators() {
        const arrowGeometry = new THREE.ConeGeometry(0.2, 1, 8);
        const arrowMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        
        // Create several arrows showing wind direction
        for (let i = 0; i < 5; i++) {
            const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
            arrow.position.set(-8 + i * 4, 2, 0);
            arrow.rotation.z = -Math.PI / 2; // Point right
            this.scene.add(arrow);
        }
    }
    
    // Create wind particle effects
    createWindEffects() {
        console.log('Creating wind effects...');
        
        // Create wind particles system
        this.windParticles = new WindParticleSystem();
        this.scene.add(this.windParticles.getParticleSystem());
    }
    
    // Create the car model
    createCarModel() {
        console.log('Creating car model...');
        
        // Create a simple car model using basic shapes
        this.carModel = new CarModel();
        
        // Make sure the car model is created properly
        const carModelGroup = this.carModel.getModel();
        if (carModelGroup) {
            this.scene.add(carModelGroup);
            console.log('Car model added to scene successfully');
        } else {
            console.error('Failed to create car model');
        }
        
        // Set the initial car type from app state
        if (window.WindTunnelMain && window.WindTunnelMain.appState) {
            const initialCarType = window.WindTunnelMain.appState.carType || 'f1';
            this.carModel.setCarType(initialCarType);
            console.log('Initial car type set to:', initialCarType);
        }
    }
    
    // Update the wind tunnel (called every frame)
    update(currentTime) {
        if (this.isPaused) return;
        
        // Update wind particles
        if (this.windParticles) {
            this.windParticles.update(currentTime, this.windSpeed);
        }
        
        // Update car rotation based on angle
        if (this.carModel) {
            this.carModel.setAngle(this.carAngle);
        }
        
        // Calculate aerodynamic forces
        this.updateAerodynamics();
        
        // Render the scene
        this.renderer.render(this.scene, this.camera);
    }
    
    // Update aerodynamic calculations
    updateAerodynamics() {
        if (!this.aerodynamicsCalculator) return;
        
        // Get current car type from the car model
        const currentCarType = this.carModel ? this.carModel.getCurrentCarType() : 'f1';
        
        // Calculate forces based on current wind speed, car angle, and car type
        const forces = this.aerodynamicsCalculator.calculateForces(this.windSpeed, this.carAngle, currentCarType);
        
        // Update the display with all parameters
        if (window.WindTunnelMain) {
            window.WindTunnelMain.updateDataDisplay(forces.drag, forces.lift, forces.pressure, forces);
        }
    }
    
    // Set wind speed
    setWindSpeed(speed) {
        this.windSpeed = speed;
        console.log('Wind speed set to:', speed, 'MPH');
    }
    
    // Set car angle
    setCarAngle(angle) {
        this.carAngle = angle;
        console.log('Car angle set to:', angle, '°');
    }
    
    // Set car type
    setCarType(carType) {
        if (this.carModel) {
            this.carModel.setCarType(carType);
            
            // Update aerodynamics calculator with new car characteristics
            if (this.aerodynamicsCalculator) {
                const carCharacteristics = this.carModel.getCarCharacteristics();
                this.aerodynamicsCalculator.updateCarCharacteristics(carCharacteristics);
            }
            
            console.log('Car type changed to:', carType);
        }
    }
    
    // Set camera view
    setCameraView(viewName) {
        console.log('Setting camera view to:', viewName);
        
        // Smoothly move camera to new position
        const targetPosition = this.getCameraPosition(viewName);
        this.animateCamera(targetPosition);
    }
    
    // Get camera position for different views (updated for rectangular test section)
    getCameraPosition(viewName) {
        switch (viewName) {
            case 'front':
                return { x: 0, y: 0, z: 8 };  // Closer for better view of rectangular section
            case 'side':
                return { x: 10, y: 0, z: 0 }; // Adjusted for new dimensions
            case 'top':
                return { x: 0, y: 10, z: 0 }; // Adjusted for new dimensions
            default:
                return { x: 0, y: 0, z: 8 };
        }
    }
    
    // Animate camera movement
    animateCamera(targetPosition) {
        const currentPosition = this.camera.position;
        const steps = 30; // Number of animation steps
        const stepX = (targetPosition.x - currentPosition.x) / steps;
        const stepY = (targetPosition.y - currentPosition.y) / steps;
        const stepZ = (targetPosition.z - currentPosition.z) / steps;
        
        let currentStep = 0;
        
        const animateStep = () => {
            if (currentStep < steps) {
                this.camera.position.x += stepX;
                this.camera.position.y += stepY;
                this.camera.position.z += stepZ;
                this.camera.lookAt(0, 0, 0);
                
                currentStep++;
                requestAnimationFrame(animateStep);
            }
        };
        
        animateStep();
    }
    
    // Handle window resize
    handleResize() {
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;
        
        // Update camera aspect ratio
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        // Update renderer size
        this.renderer.setSize(width, height);
        
        console.log('Window resized to:', width, 'x', height);
    }
    
    // Pause the animation
    pause() {
        this.isPaused = true;
        console.log('Wind tunnel paused');
    }
    
    // Resume the animation
    resume() {
        this.isPaused = false;
        console.log('Wind tunnel resumed');
    }
    
    // Clean up resources
    dispose() {
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        if (this.scene) {
            // Clean up all objects in the scene
            this.scene.traverse((object) => {
                if (object.geometry) {
                    object.geometry.dispose();
                }
                if (object.material) {
                    if (object.material.length) {
                        object.material.forEach(material => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
        }
        
        console.log('Wind tunnel disposed');
    }
    
    // Get current aerodynamic forces for data export
    getCurrentForces() {
        if (!this.aerodynamicsCalculator) {
            return null;
        }
        
        // Calculate forces based on current wind speed and car angle
        const forces = this.aerodynamicsCalculator.calculateForces(
            this.windSpeed,
            this.carAngle,
            this.carType
        );
        
        return forces;
    }
    
    // Initialize arrow key system
    initializeArrowKeySystem() {
        this.isEditMode = false;
        this.currentView = 'front';
        this.keyboardHandler = null;
        
        console.log('Arrow key positioning system initialized');
    }
    
    // Enable touch arrow button mode
    enableArrowKeyMode(view = 'front') {
        this.isEditMode = true;
        this.currentView = view;
        
        // Show direction indicators
        this.showDirectionIndicators(view);
        
        console.log('Touch arrow button mode enabled for view:', view);
    }
    
    // Disable touch arrow button mode
    disableArrowKeyMode() {
        this.isEditMode = false;
        
        // Hide direction indicators
        this.hideDirectionIndicators();
        
        console.log('Touch arrow button mode disabled');
    }
    
    // Handle touch button input for positioning
    moveCarWithButton(direction) {
        if (!this.isEditMode || !this.carModel || !this.carModel.isSTLCar()) return;
        
        // Get current position
        const currentPosition = this.carModel.getPosition();
        const moveStep = 0.5; // Grid step size
        
        let newX = currentPosition.x;
        let newY = currentPosition.y;
        let newZ = currentPosition.z;
        
        // Apply movement based on current view and button direction
        // This makes the arrows match the visual perspective of each view
        switch (this.currentView) {
            case 'front':
                // Front view: left/right = X axis, up/down = Y axis
                switch (direction) {
                    case 'left':
                        newX -= moveStep;
                        break;
                    case 'right':
                        newX += moveStep;
                        break;
                    case 'up':
                        newY += moveStep;
                        break;
                    case 'down':
                        newY -= moveStep;
                        break;
                }
                break;
                
            case 'side':
                // Side view: left/right = Z axis, up/down = Y axis
                switch (direction) {
                    case 'left':
                        newZ += moveStep; // Left from side view = forward (positive Z)
                        break;
                    case 'right':
                        newZ -= moveStep; // Right from side view = backward (negative Z)
                        break;
                    case 'up':
                        newY += moveStep;
                        break;
                    case 'down':
                        newY -= moveStep;
                        break;
                }
                break;
                
            case 'top':
                // Top view: left/right = X axis, up/down = Z axis
                switch (direction) {
                    case 'left':
                        newX -= moveStep;
                        break;
                    case 'right':
                        newX += moveStep;
                        break;
                    case 'up':
                        newZ -= moveStep; // Up from top view = toward wind source (negative Z)
                        break;
                    case 'down':
                        newZ += moveStep; // Down from top view = away from wind source (positive Z)
                        break;
                }
                break;
        }
        
        // Constrain position to test section bounds
        const bounds = this.getTestSectionBounds();
        newX = Math.max(bounds.minX, Math.min(bounds.maxX, newX));
        newY = Math.max(bounds.minY, Math.min(bounds.maxY, newY));
        newZ = Math.max(bounds.minZ, Math.min(bounds.maxZ, newZ));
        
        // Update model position
        this.carModel.setPosition(newX, newY, newZ);
        
        // Update direction indicators to follow the car
        if (this.directionIndicators) {
            this.showDirectionIndicators(this.currentView);
        }
        
        console.log(`Moved car to: ${newX}, ${newY}, ${newZ} using ${direction} button in ${this.currentView} view`);
    }
    

    
    // Get test section bounds for position constraints (expanded for more movement freedom)
    getTestSectionBounds() {
        return {
            minX: -12,  // 24 wide total (-12 to +12) - much more room to move left/right
            maxX: 12,
            minY: 0,    // Floor is at Y=0, so minimum Y should be 0 (on the floor)
            maxY: 8,    // 8 high total (0 to +8) - more room to move up
            minZ: -8,   // 16 deep total (-8 to +8) - more room to move forward/backward
            maxZ: 8
        };
    }
    
    // Show direction indicators for edit mode
    showDirectionIndicators(view) {
        // Remove existing indicators
        this.hideDirectionIndicators();
        
        // Create indicator group
        this.directionIndicators = new THREE.Group();
        
        // Get car position for indicator placement
        const carPosition = this.carModel ? this.carModel.getPosition() : { x: 0, y: 0, z: 0 };
        
        // Create arrow material
        const arrowMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x0088FF,  // Bright blue
            transparent: true,
            opacity: 0.8
        });
        
        // Create different indicators based on view to match movement directions
        switch (view) {
            case 'front':
                // Front view: left/right = X axis, up/down = Y axis
                this.createArrowIndicator(-2, 0, 0, 0, 0, Math.PI/2, arrowMaterial, carPosition);  // Left arrow (X-)
                this.createArrowIndicator(2, 0, 0, 0, 0, -Math.PI/2, arrowMaterial, carPosition);  // Right arrow (X+)
                this.createArrowIndicator(0, 2, 0, 0, 0, 0, arrowMaterial, carPosition);           // Up arrow (Y+)
                this.createArrowIndicator(0, -2, 0, Math.PI, 0, 0, arrowMaterial, carPosition);    // Down arrow (Y-)
                break;
                
            case 'side':
                // Side view: left/right = Z axis, up/down = Y axis
                this.createArrowIndicator(0, 0, 2, 0, Math.PI/2, 0, arrowMaterial, carPosition);   // Left arrow (Z+, forward)
                this.createArrowIndicator(0, 0, -2, 0, -Math.PI/2, 0, arrowMaterial, carPosition); // Right arrow (Z-, backward)
                this.createArrowIndicator(0, 2, 0, 0, 0, 0, arrowMaterial, carPosition);           // Up arrow (Y+)
                this.createArrowIndicator(0, -2, 0, Math.PI, 0, 0, arrowMaterial, carPosition);    // Down arrow (Y-)
                break;
                
            case 'top':
                // Top view: left/right = X axis, up/down = Z axis
                this.createArrowIndicator(-2, 0, 0, 0, 0, Math.PI/2, arrowMaterial, carPosition);  // Left arrow (X-)
                this.createArrowIndicator(2, 0, 0, 0, 0, -Math.PI/2, arrowMaterial, carPosition);  // Right arrow (X+)
                this.createArrowIndicator(0, 0, -2, 0, -Math.PI/2, 0, arrowMaterial, carPosition); // Up arrow (Z-, toward wind)
                this.createArrowIndicator(0, 0, 2, 0, Math.PI/2, 0, arrowMaterial, carPosition);   // Down arrow (Z+, away from wind)
                break;
        }
        
        // Add indicators to scene
        this.scene.add(this.directionIndicators);
        
        console.log('Direction indicators shown for view:', view);
    }
    
    // Create a single arrow indicator
    createArrowIndicator(x, y, z, rotX, rotY, rotZ, material, carPosition) {
        // Create arrow geometry (cone + cylinder)
        const arrowGroup = new THREE.Group();
        
        // Arrow head (cone)
        const coneGeometry = new THREE.ConeGeometry(0.2, 0.6, 8);
        const cone = new THREE.Mesh(coneGeometry, material);
        cone.position.set(0, 0.3, 0);
        arrowGroup.add(cone);
        
        // Arrow shaft (cylinder)
        const cylinderGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.6, 8);
        const cylinder = new THREE.Mesh(cylinderGeometry, material);
        cylinder.position.set(0, -0.3, 0);
        arrowGroup.add(cylinder);
        
        // Position and rotate the arrow
        arrowGroup.position.set(
            carPosition.x + x,
            carPosition.y + y,
            carPosition.z + z
        );
        arrowGroup.rotation.set(rotX, rotY, rotZ);
        
        // Add to indicators group
        this.directionIndicators.add(arrowGroup);
    }
    
    // Hide direction indicators
    hideDirectionIndicators() {
        if (this.directionIndicators) {
            this.scene.remove(this.directionIndicators);
            
            // Clean up geometry and materials
            this.directionIndicators.traverse((object) => {
                if (object.geometry) {
                    object.geometry.dispose();
                }
                if (object.material) {
                    object.material.dispose();
                }
            });
            
            this.directionIndicators = null;
            console.log('Direction indicators hidden');
        }
    }
} 