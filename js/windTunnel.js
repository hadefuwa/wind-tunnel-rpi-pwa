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
        
        // Initialize drag system
        this.initializeDragSystem();
        
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
    
    // Initialize drag system
    initializeDragSystem() {
        this.isDragMode = false;
        this.currentDragView = 'front';
        this.isDragging = false;
        this.dragStartPosition = null;
        this.dragStartMouse = null;
        
        // Create raycaster for mouse intersection
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Bind mouse events
        this.renderer.domElement.addEventListener('mousedown', (event) => this.onMouseDown(event));
        this.renderer.domElement.addEventListener('mousemove', (event) => this.onMouseMove(event));
        this.renderer.domElement.addEventListener('mouseup', (event) => this.onMouseUp(event));
        
        console.log('Drag system initialized');
    }
    
    // Enable drag mode
    enableDragMode(view = 'front') {
        this.isDragMode = true;
        this.currentDragView = view;
        this.renderer.domElement.style.cursor = 'grab';
        
        // Show direction indicators
        this.showDirectionIndicators(view);
        
        console.log('Drag mode enabled for view:', view);
    }
    
    // Disable drag mode
    disableDragMode() {
        this.isDragMode = false;
        this.isDragging = false;
        this.renderer.domElement.style.cursor = 'default';
        
        // Hide direction indicators
        this.hideDirectionIndicators();
        
        console.log('Drag mode disabled');
    }
    
    // Handle mouse down event
    onMouseDown(event) {
        if (!this.isDragMode || !this.carModel || !this.carModel.isSTLCar()) return;
        
        event.preventDefault();
        
        // Calculate mouse position in normalized device coordinates
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Cast ray from camera through mouse position
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Check if mouse is over the STL model
        const stlMesh = this.carModel.getSTLMesh();
        if (stlMesh) {
            const intersects = this.raycaster.intersectObject(stlMesh, true);
            
            if (intersects.length > 0) {
                // Start dragging
                this.isDragging = true;
                this.dragStartPosition = this.carModel.getPosition();
                this.dragStartMouse = { x: this.mouse.x, y: this.mouse.y };
                this.renderer.domElement.style.cursor = 'grabbing';
                
                console.log('Started dragging STL model');
            }
        }
    }
    
    // Handle mouse move event
    onMouseMove(event) {
        if (!this.isDragMode || !this.isDragging || !this.carModel) return;
        
        event.preventDefault();
        
        // Calculate mouse position in normalized device coordinates
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Calculate mouse delta
        const deltaX = this.mouse.x - this.dragStartMouse.x;
        const deltaY = this.mouse.y - this.dragStartMouse.y;
        
        // Convert mouse delta to world coordinates based on current view
        const newPosition = this.calculateNewPosition(deltaX, deltaY);
        
        // Update model position
        this.carModel.setPosition(newPosition.x, newPosition.y, newPosition.z);
        
        // Update direction indicators to follow the car
        if (this.directionIndicators) {
            this.showDirectionIndicators(this.currentDragView);
        }
    }
    
    // Handle mouse up event
    onMouseUp(event) {
        if (!this.isDragMode) return;
        
        if (this.isDragging) {
            this.isDragging = false;
            this.renderer.domElement.style.cursor = 'grab';
            console.log('Stopped dragging STL model');
        }
    }
    
    // Calculate new position based on mouse delta and current view
    calculateNewPosition(deltaX, deltaY) {
        const currentPosition = this.carModel.getPosition();
        const sensitivity = 8; // Reduced sensitivity for better control
        const gridSize = 0.5; // Grid snap size
        
        let newX = currentPosition.x;
        let newY = currentPosition.y;
        let newZ = currentPosition.z;
        
        // Apply movement constraints based on current view (simplified and more intuitive)
        switch (this.currentDragView) {
            case 'front':
                // Front view: ONLY left-right movement (X axis)
                newX = this.dragStartPosition.x + (deltaX * sensitivity);
                // Keep Y and Z unchanged
                newY = this.dragStartPosition.y;
                newZ = this.dragStartPosition.z;
                break;
                
            case 'side':
                // Side view: ONLY up-down movement (Y axis)
                newY = this.dragStartPosition.y + (deltaY * sensitivity);
                // Keep X and Z unchanged
                newX = this.dragStartPosition.x;
                newZ = this.dragStartPosition.z;
                break;
                
            case 'top':
                // Top view: ONLY left-right movement (X axis)
                newX = this.dragStartPosition.x + (deltaX * sensitivity);
                // Keep Y and Z unchanged
                newY = this.dragStartPosition.y;
                newZ = this.dragStartPosition.z;
                break;
                
            default:
                // Default to front view behavior
                newX = this.dragStartPosition.x + (deltaX * sensitivity);
                newY = this.dragStartPosition.y;
                newZ = this.dragStartPosition.z;
        }
        
        // Snap to grid
        newX = Math.round(newX / gridSize) * gridSize;
        newY = Math.round(newY / gridSize) * gridSize;
        newZ = Math.round(newZ / gridSize) * gridSize;
        
        // Constrain position to test section bounds (updated for smaller grid)
        const bounds = this.getTestSectionBounds();
        newX = Math.max(bounds.minX, Math.min(bounds.maxX, newX));
        newY = Math.max(bounds.minY, Math.min(bounds.maxY, newY));
        newZ = Math.max(bounds.minZ, Math.min(bounds.maxZ, newZ));
        
        return { x: newX, y: newY, z: newZ };
    }
    
    // Get test section bounds for position constraints (12 wide, 6 deep, 4 high)
    getTestSectionBounds() {
        return {
            minX: -6,  // 12 wide total (-6 to +6)
            maxX: 6,
            minY: -2,  // 4 high total (-2 to +2)
            maxY: 2,
            minZ: -3,  // 6 deep total (-3 to +3)
            maxZ: 3
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
        
        // Create different indicators based on view
        switch (view) {
            case 'front':
                // Show left-right arrows (X axis)
                this.createArrowIndicator(-2, 0, 0, 0, 0, Math.PI/2, arrowMaterial, carPosition);  // Left arrow
                this.createArrowIndicator(2, 0, 0, 0, 0, -Math.PI/2, arrowMaterial, carPosition);  // Right arrow
                break;
                
            case 'side':
                // Show up-down arrows (Y axis)
                this.createArrowIndicator(0, 2, 0, 0, 0, 0, arrowMaterial, carPosition);           // Up arrow
                this.createArrowIndicator(0, -2, 0, Math.PI, 0, 0, arrowMaterial, carPosition);    // Down arrow
                break;
                
            case 'top':
                // Show left-right arrows (X axis) - same as front view
                this.createArrowIndicator(-2, 0, 0, 0, 0, Math.PI/2, arrowMaterial, carPosition);  // Left arrow
                this.createArrowIndicator(2, 0, 0, 0, 0, -Math.PI/2, arrowMaterial, carPosition);  // Right arrow
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