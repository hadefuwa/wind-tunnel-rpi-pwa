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
        
        // Create tunnel walls (transparent box)
        const tunnelGeometry = new THREE.BoxGeometry(20, 8, 8);
        const tunnelMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x333333,
            transparent: true,
            opacity: 0.1,
            wireframe: true
        });
        
        const tunnel = new THREE.Mesh(tunnelGeometry, tunnelMaterial);
        this.scene.add(tunnel);
        
        // Create grid floor
        const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x444444);
        gridHelper.position.y = -3;
        this.scene.add(gridHelper);
        
        // Create wind direction indicators
        this.createWindIndicators();
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
        
        // Update the display
        if (window.WindTunnelMain) {
            window.WindTunnelMain.updateDataDisplay(forces.drag, forces.lift, forces.pressure);
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
    
    // Get camera position for different views
    getCameraPosition(viewName) {
        switch (viewName) {
            case 'front':
                return { x: 0, y: 0, z: 10 };
            case 'side':
                return { x: 12, y: 0, z: 0 };
            case 'top':
                return { x: 0, y: 12, z: 0 };
            default:
                return { x: 0, y: 0, z: 10 };
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
} 