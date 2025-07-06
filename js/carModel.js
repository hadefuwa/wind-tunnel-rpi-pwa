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
        
        // Create the car model
        this.createCar();
        
        console.log('Car Model created successfully!');
    }
    
    // Create the car using basic shapes
    createCar() {
        console.log('Building car from basic shapes...');
        
        // Create a group to hold all car parts
        this.carGroup = new THREE.Group();
        
        // Create different parts of the car
        this.createCarBody();
        this.createCarRoof();
        this.createWheels();
        this.createWindshield();
        this.createSpoiler();
        
        // Position the car in the center
        this.carGroup.position.set(0, -1.5, 0);
        
        console.log('Car assembly complete!');
    }
    
    // Create the main car body
    createCarBody() {
        console.log('Creating car body...');
        
        // Create main body geometry (like a stretched box)
        const bodyGeometry = new THREE.BoxGeometry(4, 1, 1.8);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xff4444 }); // Red color
        
        const carBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
        carBody.position.set(0, 0, 0);
        
        // Add to car group
        this.carGroup.add(carBody);
        
        // Create front bumper
        const bumperGeometry = new THREE.BoxGeometry(0.3, 0.5, 1.6);
        const bumperMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 }); // Dark gray
        
        const frontBumper = new THREE.Mesh(bumperGeometry, bumperMaterial);
        frontBumper.position.set(2.2, -0.2, 0);
        
        this.carGroup.add(frontBumper);
        
        console.log('Car body created');
    }
    
    // Create the car roof
    createCarRoof() {
        console.log('Creating car roof...');
        
        // Create roof geometry (smaller box on top)
        const roofGeometry = new THREE.BoxGeometry(2.5, 0.8, 1.6);
        const roofMaterial = new THREE.MeshLambertMaterial({ color: 0xff6666 }); // Lighter red
        
        const carRoof = new THREE.Mesh(roofGeometry, roofMaterial);
        carRoof.position.set(-0.3, 0.9, 0);
        
        this.carGroup.add(carRoof);
        
        console.log('Car roof created');
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
        
        // Create spoiler geometry (thin box at the back)
        const spoilerGeometry = new THREE.BoxGeometry(0.8, 0.1, 1.2);
        const spoilerMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 }); // Dark gray
        
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
        
        this.carGroup.position.set(x, y, z);
        
        console.log('Car position set to:', x, y, z);
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
    
    // Animate the car (subtle movement)
    animate(currentTime) {
        if (!this.carGroup) return;
        
        // Add subtle bouncing motion
        const time = currentTime * 0.001;
        const bounce = Math.sin(time * 2) * 0.02;
        
        this.carGroup.position.y = -1.5 + bounce;
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
        
        console.log('Car model disposed');
    }
} 