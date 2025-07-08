// ===== CAR MODEL CLASS =====
// Creates a simple 3D car model using basic shapes
// Simple and beginner-friendly code

class CarModel {
    constructor() {
        console.log('Creating Car Model...');
        
        // Basic settings
        this.carGroup = null;
        this.angle = 0;
        this.scale = 1;
        this.currentCarType = 'f1'; // F1 car as default!
        this.stlLoader = new STLLoader(); // Initialize STL loader
        this.customSTLGeometry = null; // Store custom STL geometry
        this.settingsStorage = new CarSettingsStorage(); // Initialize settings storage
        this.currentRotation = { x: 0, y: 0, z: 0 }; // Track current rotation
        this.cachedPosition = null; // Cache position for animation
        this.positionManuallySet = false; // Track if position was manually set
        
        // Define different car types with their characteristics
        this.carTypes = {
            f1: { 
                drag: 0.28, 
                lift: -0.8, 
                name: "F1 Race Car (STL)",
                color: 0xff0000,
                description: "Formula 1 racing car with maximum downforce",
                dragCoefficient: 0.7,
                liftCoefficient: -2.5,
                frontalArea: 1.8,
                weight: 740,
                isSTL: true,
                stlPath: 'assets/stl-files/f1.stl'
            },
            sedan: { 
                drag: 0.25, 
                lift: -0.1, 
                name: "Sedan",
                color: 0xff4444,
                description: "Standard passenger car with good aerodynamics",
                dragCoefficient: 0.3,
                liftCoefficient: 0.1,
                frontalArea: 2.2,
                weight: 1500
            },
            sports: { 
                drag: 0.35, 
                lift: -0.3, 
                name: "Sports Car",
                color: 0xff6600,
                description: "Low-profile car with aggressive aerodynamics",
                dragCoefficient: 0.35,
                liftCoefficient: -0.2,
                frontalArea: 2.0,
                weight: 1300
            },
            suv: { 
                drag: 0.45, 
                lift: 0.1, 
                name: "SUV",
                color: 0x0066ff,
                description: "Tall vehicle with higher drag coefficient",
                dragCoefficient: 0.45,
                liftCoefficient: 0.2,
                frontalArea: 2.8,
                weight: 2200
            },
            truck: { 
                drag: 0.55, 
                lift: 0.2, 
                name: "Truck",
                color: 0x00aa00,
                description: "Large vehicle with poor aerodynamics",
                dragCoefficient: 0.8,
                liftCoefficient: 0.1,
                frontalArea: 3.5,
                weight: 3500
            },
            custom: {
                drag: 0.35,
                lift: -0.2,
                name: "Custom STL Model",
                color: 0x00ffff,
                description: "Your custom uploaded STL car model",
                dragCoefficient: 0.35,
                liftCoefficient: -0.2,
                frontalArea: 2.0,
                weight: 1400,
                isSTL: true,
                stlPath: null
            }
        };
        
        // Create the car model
        this.createCar();
        
        console.log('Car Model created successfully!');
    }
    
    // Create the car using basic shapes or STL
    createCar() {
        console.log('Building car...');
        
        // Create a group to hold all car parts
        this.carGroup = new THREE.Group();
        
        const carType = this.carTypes[this.currentCarType];
        
        // Check if this car type uses STL
        if (carType.isSTL) {
            console.log('Loading STL car model...');
            this.loadSTLCar();
        } else {
            console.log('Building car from basic shapes...');
            // Create different parts of the car based on type
            this.createCarBody();
            this.createCarRoof();
            this.createWheels();
            this.createWindshield();
            this.createSpoiler();
        }
        
        // Position the car using saved settings or default
        const savedPosition = this.settingsStorage ? 
            this.settingsStorage.getPosition(this.currentCarType) : 
            { x: 0, y: -1.5, z: 0 };
        
        this.setPosition(savedPosition.x, savedPosition.y, savedPosition.z);
        
        console.log('Car assembly complete!');
    }
    
    // Create the main car body
    createCarBody() {
        console.log('Creating car body...');
        
        const carType = this.carTypes[this.currentCarType];
        
        // Create main body geometry based on car type
        let bodyGeometry, bodyHeight, bodyWidth;
        
        switch(this.currentCarType) {
            case 'f1':
                bodyGeometry = new THREE.BoxGeometry(4.5, 0.4, 1.8); // Very low and long
                bodyHeight = 0.4;
                bodyWidth = 1.8;
                break;
            case 'sedan':
                bodyGeometry = new THREE.BoxGeometry(4, 1, 1.8);
                bodyHeight = 1;
                bodyWidth = 1.8;
                break;
            case 'sports':
                bodyGeometry = new THREE.BoxGeometry(4.2, 0.8, 1.6); // Lower and narrower
                bodyHeight = 0.8;
                bodyWidth = 1.6;
                break;
            case 'suv':
                bodyGeometry = new THREE.BoxGeometry(4, 1.4, 2.0); // Taller and wider
                bodyHeight = 1.4;
                bodyWidth = 2.0;
                break;
            case 'truck':
                bodyGeometry = new THREE.BoxGeometry(3.5, 1.6, 2.2); // Shorter but taller
                bodyHeight = 1.6;
                bodyWidth = 2.2;
                break;
            default:
                bodyGeometry = new THREE.BoxGeometry(4, 1, 1.8);
                bodyHeight = 1;
                bodyWidth = 1.8;
        }
        
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: carType.color });
        
        const carBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
        carBody.position.set(0, 0, 0);
        
        // Add to car group
        this.carGroup.add(carBody);
        
        // Create front bumper
        const bumperGeometry = new THREE.BoxGeometry(0.3, bodyHeight * 0.5, bodyWidth * 0.9);
        const bumperMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 }); // Dark gray
        
        const frontBumper = new THREE.Mesh(bumperGeometry, bumperMaterial);
        frontBumper.position.set(2.2, -bodyHeight * 0.2, 0);
        
        this.carGroup.add(frontBumper);
        
        console.log('Car body created for:', carType.name);
    }
    
    // Create the car roof
    createCarRoof() {
        console.log('Creating car roof...');
        
        const carType = this.carTypes[this.currentCarType];
        
        if (this.currentCarType === 'f1') {
            // F1 car has a cockpit instead of a roof
            const cockpitGeometry = new THREE.BoxGeometry(1.5, 0.6, 1.2);
            const cockpitMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 }); // Dark cockpit
            
            const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
            cockpit.position.set(0.5, 0.5, 0);
            this.carGroup.add(cockpit);
            
            // Add driver's helmet (small sphere)
            const helmetGeometry = new THREE.SphereGeometry(0.15, 8, 8);
            const helmetMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
            
            const helmet = new THREE.Mesh(helmetGeometry, helmetMaterial);
            helmet.position.set(0.5, 0.9, 0);
            this.carGroup.add(helmet);
            
            console.log('F1 cockpit and helmet created');
        } else {
            // Regular car roof
            const roofGeometry = new THREE.BoxGeometry(2.5, 0.8, 1.6);
            const roofMaterial = new THREE.MeshLambertMaterial({ color: carType.color + 0x002200 }); // Slightly different color
            
            const carRoof = new THREE.Mesh(roofGeometry, roofMaterial);
            carRoof.position.set(-0.3, 0.9, 0);
            
            this.carGroup.add(carRoof);
            
            console.log('Car roof created');
        }
    }
    
    // Create car wheels
    createWheels() {
        console.log('Creating car wheels...');
        
        // Create wheel geometry (cylinders)
        const wheelGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16);
        const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 }); // Dark gray
        
        // Create 4 wheels
        const wheelPositions = [
            { x: 1.3, y: -0.7, z: 1.0 },  // Front right
            { x: 1.3, y: -0.7, z: -1.0 }, // Front left
            { x: -1.3, y: -0.7, z: 1.0 }, // Rear right
            { x: -1.3, y: -0.7, z: -1.0 } // Rear left
        ];
        
        wheelPositions.forEach((pos, index) => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.position.set(pos.x, pos.y, pos.z);
            wheel.rotation.z = Math.PI / 2; // Rotate to face forward
            
            this.carGroup.add(wheel);
        });
        
        console.log('Car wheels created');
    }
    
    // Create windshield
    createWindshield() {
        console.log('Creating windshield...');
        
        // Create windshield geometry (transparent flat panel)
        const windshieldGeometry = new THREE.BoxGeometry(0.1, 0.6, 1.4);
        const windshieldMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x88ccff, 
            transparent: true, 
            opacity: 0.3 
        });
        
        const windshield = new THREE.Mesh(windshieldGeometry, windshieldMaterial);
        windshield.position.set(1.2, 0.3, 0);
        
        this.carGroup.add(windshield);
        
        console.log('Windshield created');
    }
    
    // Create rear spoiler
    createSpoiler() {
        console.log('Creating spoiler...');
        
        if (this.currentCarType === 'f1') {
            // F1 car has front and rear wings
            
            // Rear wing (larger and higher)
            const rearWingGeometry = new THREE.BoxGeometry(1.5, 0.08, 2.0);
            const wingMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
            
            const rearWing = new THREE.Mesh(rearWingGeometry, wingMaterial);
            rearWing.position.set(-2.5, 1.2, 0);
            this.carGroup.add(rearWing);
            
            // Rear wing supports
            const supportGeometry = new THREE.BoxGeometry(0.05, 0.8, 0.05);
            const supportMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
            
            // Wing supports
            for (let i = 0; i < 4; i++) {
                const support = new THREE.Mesh(supportGeometry, supportMaterial);
                support.position.set(-2.5, 0.8, -0.75 + i * 0.5);
                this.carGroup.add(support);
            }
            
            // Front wing
            const frontWingGeometry = new THREE.BoxGeometry(1.2, 0.06, 2.2);
            const frontWing = new THREE.Mesh(frontWingGeometry, wingMaterial);
            frontWing.position.set(2.8, -0.4, 0);
            this.carGroup.add(frontWing);
            
            // Front wing supports
            const frontSupportGeometry = new THREE.BoxGeometry(0.05, 0.3, 0.05);
            for (let i = 0; i < 3; i++) {
                const support = new THREE.Mesh(frontSupportGeometry, supportMaterial);
                support.position.set(2.8, -0.25, -0.8 + i * 0.8);
                this.carGroup.add(support);
            }
            
            console.log('F1 wings created');
        } else {
            // Regular car spoiler
            const spoilerGeometry = new THREE.BoxGeometry(0.8, 0.1, 1.2);
            const spoilerMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
            
            const spoiler = new THREE.Mesh(spoilerGeometry, spoilerMaterial);
            spoiler.position.set(-2.2, 0.8, 0);
            this.carGroup.add(spoiler);
            
            // Create spoiler supports
            const supportGeometry = new THREE.BoxGeometry(0.1, 0.4, 0.1);
            const supportMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
            
            // Left support
            const leftSupport = new THREE.Mesh(supportGeometry, supportMaterial);
            leftSupport.position.set(-2.2, 0.5, 0.4);
            this.carGroup.add(leftSupport);
            
            // Right support
            const rightSupport = new THREE.Mesh(supportGeometry, supportMaterial);
            rightSupport.position.set(-2.2, 0.5, -0.4);
            this.carGroup.add(rightSupport);
            
            console.log('Spoiler created');
        }
    }
    
    // Get the complete car model
    getModel() {
        return this.carGroup;
    }
    
    // Set car angle (rotation)
    setAngle(angleInDegrees) {
        if (!this.carGroup) return;
        
        this.angle = angleInDegrees;
        
        // Convert degrees to radians
        const angleInRadians = (angleInDegrees * Math.PI) / 180;
        
        // Rotate the car around the Y axis
        this.carGroup.rotation.y = angleInRadians;
        
        console.log('Car angle set to:', angleInDegrees, 'degrees');
    }
    
    // Get current angle
    getAngle() {
        return this.angle;
    }
    
    // Switch to a different car type
    setCarType(carType) {
        if (!this.carTypes[carType]) {
            console.error('Invalid car type:', carType);
            return;
        }
        
        console.log('Switching to car type:', carType);
        
        // Store current settings
        const currentAngle = this.angle;
        const currentScale = this.scale;
        const currentPosition = this.getPosition();
        const parentScene = this.carGroup ? this.carGroup.parent : null;
        
        // Remove old car from scene
        if (this.carGroup && this.carGroup.parent) {
            this.carGroup.parent.remove(this.carGroup);
        }
        
        // Clean up old car
        if (this.carGroup) {
            this.carGroup.traverse((object) => {
                if (object.geometry) {
                    object.geometry.dispose();
                }
                if (object.material) {
                    object.material.dispose();
                }
            });
        }
        
        // Update car type
        this.currentCarType = carType;
        
        // Create new car
        this.createCar();
        
        // Add new car back to scene
        if (parentScene) {
            parentScene.add(this.carGroup);
        }
        
        // Restore settings
        this.setAngle(currentAngle);
        this.setScale(currentScale);
        
        // Apply saved position and rotation for this car type
        if (this.settingsStorage) {
            const savedPosition = this.settingsStorage.getPosition(carType);
            const defaultPosition = { x: 0, y: -1.5, z: 0 };
            
            // Check if position was manually saved (different from default)
            const isManuallySet = savedPosition.x !== defaultPosition.x || 
                                 savedPosition.y !== defaultPosition.y || 
                                 savedPosition.z !== defaultPosition.z;
            
            this.setPosition(savedPosition.x, savedPosition.y, savedPosition.z);
            
            // Only mark as manually set if it's not the default position
            this.positionManuallySet = isManuallySet;
            
            // Apply saved rotation if this is an STL car
            if (this.carTypes[carType].isSTL) {
                const savedRotation = this.settingsStorage.getRotation(carType);
                this.setSTLRotation(savedRotation);
            }
        } else {
            this.setPosition(currentPosition.x, currentPosition.y, currentPosition.z);
        }
        
        console.log('Car type switched to:', this.carTypes[carType].name);
        
        // Return the new car group so it can be re-added if needed
        return this.carGroup;
    }
    
    // Get current car type
    getCurrentCarType() {
        return this.currentCarType;
    }
    
    // Methods for the setup page to use
    applyRotation(rotationData) {
        this.setSTLRotation(rotationData);
    }
    
    applyPosition(positionData) {
        this.setPosition(positionData.x, positionData.y, positionData.z);
        
        // Also save the position to storage so animate() doesn't override it
        if (this.settingsStorage) {
            this.settingsStorage.setPosition(this.currentCarType, positionData);
        }
        
        // Update cached position
        this.updateCachedPosition();
        
        // Mark position as manually set
        this.positionManuallySet = true;
    }
    
    // Get all available car types
    getAvailableCarTypes() {
        return Object.keys(this.carTypes);
    }
    
    // Get characteristics of current car type
    getCarCharacteristics() {
        return this.carTypes[this.currentCarType];
    }
    
    // Set car scale
    setScale(scale) {
        if (!this.carGroup) return;
        
        this.scale = scale;
        this.carGroup.scale.set(scale, scale, scale);
        
        console.log('Car scale set to:', scale);
    }
    
    // Get car position
    getPosition() {
        if (!this.carGroup) return { x: 0, y: 0, z: 0 };
        
        return {
            x: this.carGroup.position.x,
            y: this.carGroup.position.y,
            z: this.carGroup.position.z
        };
    }
    
    // Set car position
    setPosition(x, y, z) {
        if (!this.carGroup) return;
        
        // Enforce minimum Y position to prevent car from going under the floor
        // Floor is at Y=0, so car should never go below Y=0
        const minY = 0;
        const constrainedY = Math.max(minY, y);
        
        this.carGroup.position.set(x, constrainedY, z);
        
        // Update cached position when position is set directly
        this.cachedPosition = { x, y: constrainedY, z };
        
        console.log('Car position set to:', x, constrainedY, z);
        if (constrainedY !== y) {
            console.log('Y position constrained from', y, 'to', constrainedY, 'to prevent going under floor');
        }
    }
    
    // Add racing stripes for visual appeal
    addRacingStripes() {
        console.log('Adding racing stripes...');
        
        // Create stripe geometry (thin boxes)
        const stripeGeometry = new THREE.BoxGeometry(4, 0.05, 0.2);
        const stripeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff }); // White
        
        // Create two stripes
        const stripe1 = new THREE.Mesh(stripeGeometry, stripeMaterial);
        stripe1.position.set(0, 0.55, 0.3);
        this.carGroup.add(stripe1);
        
        const stripe2 = new THREE.Mesh(stripeGeometry, stripeMaterial);
        stripe2.position.set(0, 0.55, -0.3);
        this.carGroup.add(stripe2);
        
        console.log('Racing stripes added');
    }
    
    // Add headlights
    addHeadlights() {
        console.log('Adding headlights...');
        
        // Create headlight geometry (small cylinders)
        const headlightGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 8);
        const headlightMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xffffaa,
            emissive: 0x444422 // Makes them glow slightly
        });
        
        // Left headlight
        const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        leftHeadlight.position.set(2.1, 0.1, 0.6);
        leftHeadlight.rotation.z = Math.PI / 2;
        this.carGroup.add(leftHeadlight);
        
        // Right headlight
        const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        rightHeadlight.position.set(2.1, 0.1, -0.6);
        rightHeadlight.rotation.z = Math.PI / 2;
        this.carGroup.add(rightHeadlight);
        
        console.log('Headlights added');
    }
    
    // Update cached position (call this when position changes)
    updateCachedPosition() {
        this.cachedPosition = this.settingsStorage ? 
            this.settingsStorage.getPosition(this.currentCarType) : 
            { x: 0, y: -1.5, z: 0 };
    }

    // Animate the car (subtle movement)
    animate(currentTime) {
        if (!this.carGroup) return;
        
        // Use cached position or get it if not cached
        if (!this.cachedPosition) {
            this.updateCachedPosition();
        }
        
        // If position was manually set, don't apply bounce animation
        if (this.positionManuallySet) {
            // Keep all positions at their cached values without animation
            // But enforce minimum Y position to prevent going under floor
            this.carGroup.position.x = this.cachedPosition.x;
            this.carGroup.position.y = Math.max(0, this.cachedPosition.y);
            this.carGroup.position.z = this.cachedPosition.z;
        } else {
            // Apply subtle bouncing motion relative to cached position (default behavior)
            const time = currentTime * 0.001;
            const bounce = Math.sin(time * 2) * 0.02;
            
            // Apply bounce to the cached Y position, but ensure it doesn't go below floor
            const animatedY = this.cachedPosition.y + bounce;
            this.carGroup.position.y = Math.max(0, animatedY);
            
            // Keep X and Z at their cached positions
            this.carGroup.position.x = this.cachedPosition.x;
            this.carGroup.position.z = this.cachedPosition.z;
        }
    }
    
    // Load STL car model
    loadSTLCar() {
        const carType = this.carTypes[this.currentCarType];
        
        if (carType.stlPath) {
            console.log('Loading STL file:', carType.stlPath);
            
            this.stlLoader.load(
                carType.stlPath,
                (geometry) => {
                    console.log('STL file loaded successfully');
                    this.createSTLMesh(geometry);
                },
                (progress) => {
                    console.log('Loading progress:', progress);
                },
                (error) => {
                    console.error('Error loading STL file:', error);
                    // Fallback to basic shapes if STL fails
                    this.createBasicCarFallback();
                }
            );
        } else if (this.customSTLGeometry) {
            console.log('Using custom STL geometry');
            this.createSTLMesh(this.customSTLGeometry);
        } else {
            console.log('No STL file specified, using basic shapes');
            this.createBasicCarFallback();
        }
    }
    
    // Create mesh from STL geometry
    createSTLMesh(geometry) {
        console.log('Creating STL mesh...');
        
        const carType = this.carTypes[this.currentCarType];
        
        // Create material for STL model
        const material = new THREE.MeshLambertMaterial({
            color: carType.color,
            side: THREE.DoubleSide
        });
        
        // Create mesh
        const stlMesh = new THREE.Mesh(geometry, material);
        
        // Scale and position the STL model appropriately
        this.scaleSTLModel(stlMesh);
        
        // Apply saved rotation settings
        this.applySavedRotation(stlMesh);
        
        // Add to car group
        this.carGroup.add(stlMesh);
        
        console.log('STL mesh created and added to car group');
    }
    
    // Scale STL model to appropriate size and position it on the ground
    scaleSTLModel(mesh) {
        // Calculate bounding box
        const box = new THREE.Box3().setFromObject(mesh);
        const size = box.getSize(new THREE.Vector3());
        
        // Scale to reasonable car size (approximately 4 units long)
        const targetLength = 4;
        const scaleFactor = targetLength / Math.max(size.x, size.y, size.z);
        
        mesh.scale.set(scaleFactor, scaleFactor, scaleFactor);
        
        // Get the bounding box after scaling
        mesh.updateMatrixWorld();
        const scaledBox = new THREE.Box3().setFromObject(mesh);
        const scaledSize = scaledBox.getSize(new THREE.Vector3());
        const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
        
        // Position the model so it sits flat on the ground
        // Center it horizontally (X and Z) but place bottom at Y=0
        mesh.position.set(
            -scaledCenter.x,           // Center horizontally (X)
            -scaledBox.min.y,          // Bottom of model at Y=0 (sits on ground)
            -scaledCenter.z            // Center horizontally (Z)
        );
        
        console.log('STL model scaled by factor:', scaleFactor);
        console.log('STL model positioned on ground at Y=0');
    }
    
    // Fallback to basic car shapes if STL fails
    createBasicCarFallback() {
        console.log('Creating basic car fallback...');
        
        // Create basic car parts
        this.createCarBody();
        this.createCarRoof();
        this.createWheels();
        this.createWindshield();
        this.createSpoiler();
        
        console.log('Basic car fallback created');
    }
    
    // Load custom STL file from user upload
    loadCustomSTL(file, onSuccess, onError) {
        console.log('Loading custom STL file:', file.name);
        
        this.stlLoader.loadFromFile(
            file,
            (geometry) => {
                console.log('Custom STL file loaded successfully');
                
                // Store the custom geometry
                this.customSTLGeometry = geometry;
                
                // Update custom car type
                this.carTypes.custom.stlPath = file.name;
                
                // Switch to custom car type
                this.setCarType('custom');
                
                if (onSuccess) onSuccess(geometry);
            },
            (error) => {
                console.error('Error loading custom STL file:', error);
                if (onError) onError(error);
            }
        );
    }
    
    // Check if current car type uses STL
    isSTLCar() {
        return this.carTypes[this.currentCarType].isSTL;
    }
    
    // Get the STL mesh for drag interaction
    getSTLMesh() {
        if (!this.isSTLCar() || !this.carGroup) {
            return null;
        }
        
        // Find the STL mesh in the car group
        let stlMesh = null;
        this.carGroup.traverse((child) => {
            if (child.isMesh && child.geometry && child.geometry.type === 'BufferGeometry') {
                stlMesh = child;
            }
        });
        
        return stlMesh;
    }
    
    // Apply saved rotation to STL mesh
    applySavedRotation(mesh) {
        const savedRotation = this.settingsStorage.getRotation(this.currentCarType);
        
        // Convert degrees to radians and apply rotation
        mesh.rotation.x = (savedRotation.x * Math.PI) / 180;
        mesh.rotation.y = (savedRotation.y * Math.PI) / 180;
        mesh.rotation.z = (savedRotation.z * Math.PI) / 180;
        
        // Update current rotation tracking
        this.currentRotation = { ...savedRotation };
        
        console.log(`Applied saved rotation for ${this.currentCarType}:`, savedRotation);
    }
    
    // Set STL rotation (in degrees)
    setSTLRotation(rotationDegrees) {
        if (!this.carGroup) return;
        
        // Find the STL mesh in the car group
        const stlMesh = this.findSTLMesh();
        if (!stlMesh) return;
        
        // Convert degrees to radians and apply
        stlMesh.rotation.x = (rotationDegrees.x * Math.PI) / 180;
        stlMesh.rotation.y = (rotationDegrees.y * Math.PI) / 180;
        stlMesh.rotation.z = (rotationDegrees.z * Math.PI) / 180;
        
        // Update current rotation tracking
        this.currentRotation = { ...rotationDegrees };
        
        console.log('STL rotation set to:', rotationDegrees);
    }
    
    // Get current STL rotation (in degrees)
    getSTLRotation() {
        return { ...this.currentRotation };
    }
    
    // Save current rotation to storage
    saveSTLRotation() {
        this.settingsStorage.setRotation(this.currentCarType, this.currentRotation);
        console.log('STL rotation saved for', this.currentCarType);
    }
    
    // Reset STL rotation to default
    resetSTLRotation() {
        this.settingsStorage.resetRotation(this.currentCarType);
        const defaultRotation = this.settingsStorage.getRotation(this.currentCarType);
        this.setSTLRotation(defaultRotation);
        console.log('STL rotation reset for', this.currentCarType);
    }
    
    // Find the STL mesh in the car group
    findSTLMesh() {
        if (!this.carGroup) return null;
        
        // Look for the mesh that was added from STL
        for (let child of this.carGroup.children) {
            if (child.isMesh && child.geometry && child.geometry.attributes) {
                // This is likely our STL mesh
                return child;
            }
        }
        
        return null;
    }
    
    // Clean up resources
    dispose() {
        if (this.carGroup) {
            this.carGroup.traverse((object) => {
                if (object.geometry) {
                    object.geometry.dispose();
                }
                if (object.material) {
                    object.material.dispose();
                }
            });
        }
        
        // Clean up custom STL geometry
        if (this.customSTLGeometry) {
            this.customSTLGeometry.dispose();
            this.customSTLGeometry = null;
        }
        
        console.log('Car model disposed');
    }
} 