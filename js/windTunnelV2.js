// ===== WIND TUNNEL V2 GRAPHICS ENGINE =====
// Enhanced streamline visualization with long flowing lines
// Focuses on realistic fluid flow around and under cars
// Simple and beginner-friendly code

class WindTunnelV2Engine {
    constructor() {
        console.log('Creating Wind Tunnel V2 Graphics Engine...');
        
        // V2 Engine settings
        this.enabled = false;
        this.streamlineCount = 40; // More streamlines for better coverage
        this.streamlines = [];
        this.longStreamlines = []; // Extra long streamlines
        this.underCarStreamlines = []; // Streamlines that go under the car
        
        // NEW: Additional settings for controls
        this.flowIntensity = 1.0; // Flow effects intensity
        this.showUnderCar = true; // Show under-car streamlines
        this.showLongStreamlines = true; // Show long streamlines
        this.colorIntensity = 1.0; // Color brightness multiplier
        
        // Flow settings
        this.baseWindSpeed = 50;
        this.carPosition = { x: 0, y: 0, z: 0 };
        this.carAngle = 0;
        this.carSize = { width: 1.8, height: 1.4, length: 4.0 };
        
        // Color system
        this.velocityCalculator = new VelocityFieldCalculator();
        this.colorMapper = new VelocityColorMapper();
        
        console.log('Wind Tunnel V2 Graphics Engine created');
    }
    
    // Enable V2 graphics engine
    enable(scene) {
        if (this.enabled) return;
        
        console.log('Enabling Wind Tunnel V2 Graphics Engine...');
        this.enabled = true;
        this.scene = scene;
        
        // Create enhanced streamlines
        this.createEnhancedStreamlines();
        
        // Add all streamlines to scene
        this.addStreamlinesToScene();
        
        console.log('V2 Graphics Engine enabled with', this.streamlines.length, 'enhanced streamlines');
    }
    
    // Disable V2 graphics engine
    disable() {
        if (!this.enabled) return;
        
        console.log('Disabling Wind Tunnel V2 Graphics Engine...');
        this.enabled = false;
        
        // Remove all streamlines from scene
        this.removeStreamlinesFromScene();
        
        console.log('V2 Graphics Engine disabled');
    }
    
    // Create enhanced streamlines with long flowing lines
    createEnhancedStreamlines() {
        console.log('Creating enhanced V2 streamlines...');
        
        // Remove old streamlines from scene first
        if (this.scene) {
            this.removeStreamlinesFromScene();
        }
        
        // Clear existing streamlines
        this.streamlines = [];
        this.longStreamlines = [];
        this.underCarStreamlines = [];
        
        // Create main streamlines (above and around car)
        this.createMainStreamlines();
        
        // Create long flowing streamlines (if enabled)
        if (this.showLongStreamlines) {
            this.createLongFlowingStreamlines();
        }
        
        // Create under-car streamlines (if enabled)
        if (this.showUnderCar) {
            this.createUnderCarStreamlines();
        }
        
        console.log('Enhanced streamlines created:', {
            main: this.streamlines.length,
            long: this.longStreamlines.length,
            underCar: this.underCarStreamlines.length
        });
        
        // Add new streamlines to scene if V2 engine is enabled
        if (this.enabled && this.scene) {
            this.addStreamlinesToScene();
        }
    }
    
    // Create main streamlines around the car
    createMainStreamlines() {
        const mainCount = 25;
        
        for (let i = 0; i < mainCount; i++) {
            // Create 5x5 grid of streamlines
            const row = Math.floor(i / 5);
            const col = i % 5;
            
            // Position streamlines in 3D space
            const yPos = -2.0 + row * 1.0; // -2.0 to +2.0 (vertical)
            const zPos = -2.0 + col * 1.0; // -2.0 to +2.0 (depth)
            
            const streamline = this.createSingleStreamline(yPos, zPos, 'main');
            this.streamlines.push(streamline);
        }
    }
    
    // Create long flowing streamlines for dramatic effect
    createLongFlowingStreamlines() {
        const longCount = 8;
        
        for (let i = 0; i < longCount; i++) {
            // Create streamlines at key positions for dramatic flow
            const positions = [
                { y: 0, z: 0 },     // Center line
                { y: 1.5, z: 0 },   // Above center
                { y: -1.5, z: 0 },  // Below center  
                { y: 0, z: 1.5 },   // Right side
                { y: 0, z: -1.5 },  // Left side
                { y: 1, z: 1 },     // Top right
                { y: 1, z: -1 },    // Top left
                { y: -1, z: 1 }     // Bottom right
            ];
            
            const pos = positions[i % positions.length];
            const streamline = this.createSingleStreamline(pos.y, pos.z, 'long');
            this.longStreamlines.push(streamline);
        }
    }
    
    // Create streamlines that flow under the car
    createUnderCarStreamlines() {
        const underCount = 7;
        
        for (let i = 0; i < underCount; i++) {
            // Create streamlines specifically under the car
            const zPos = -1.0 + i * (2.0 / (underCount - 1)); // -1.0 to +1.0
            const yPos = -1.8; // Under the car level
            
            const streamline = this.createSingleStreamline(yPos, zPos, 'under');
            this.underCarStreamlines.push(streamline);
        }
    }
    
    // Create a single streamline with enhanced properties
    createSingleStreamline(startY, startZ, type) {
        // Different properties based on streamline type
        const properties = {
            main: { pointCount: 200, length: 24, opacity: 0.8 },
            long: { pointCount: 300, length: 30, opacity: 0.9 },
            under: { pointCount: 150, length: 20, opacity: 0.7 }
        };
        
        const props = properties[type];
        
        // Create path points for the streamline
        const pathPoints = [];
        
        for (let j = 0; j < props.pointCount; j++) {
            const x = -15 + (j / props.pointCount) * props.length; // Extended length
            let y = startY;
            let z = startZ;
            
            // Apply realistic fluid dynamics
            this.applyFluidDynamics(x, y, z, type, j / props.pointCount, pathPoints);
        }
        
        // Create the streamline geometry
        return this.createStreamlineGeometry(pathPoints, props.opacity, type);
    }
    
    // Apply realistic fluid dynamics to streamline points
    applyFluidDynamics(x, y, z, type, progress, pathPoints) {
        // Get distance from car
        const carPos = this.carPosition;
        const distanceFromCar = Math.sqrt(
            (x - carPos.x) ** 2 + 
            (y - carPos.y) ** 2 + 
            (z - carPos.z) ** 2
        );
        
        // Apply car rotation effects
        const carAngleRad = this.carAngle * Math.PI / 180;
        const cosAngle = Math.cos(carAngleRad);
        const sinAngle = Math.sin(carAngleRad);
        
        // Transform to car's coordinate system
        const relativeX = x - carPos.x;
        const relativeY = y - carPos.y;
        const relativeZ = z - carPos.z;
        
        const rotatedX = relativeX * cosAngle - relativeZ * sinAngle;
        const rotatedZ = relativeX * sinAngle + relativeZ * cosAngle;
        
        // Apply different effects based on streamline type and car proximity
        if (distanceFromCar < 4) {
            const deflectionStrength = Math.max(0, 1 - distanceFromCar / 4) * this.flowIntensity;
            
            if (type === 'under') {
                // Under-car streamlines: accelerated flow, ground effect
                if (Math.abs(rotatedX) < 2.5 && Math.abs(rotatedZ) < 1.0) {
                    // Accelerate under the car
                    y += deflectionStrength * 0.3 * Math.sign(relativeY || -1);
                    z += deflectionStrength * 0.5 * Math.sign(rotatedZ || 1);
                }
                
                // Ground effect - streamlines hug the ground
                y = Math.max(y, -2.0);
                
            } else if (type === 'main') {
                // Main streamlines: deflect around car
                if (Math.abs(rotatedX) < 2.0 && Math.abs(rotatedZ) < 1.0) {
                    y += deflectionStrength * 2.0 * Math.sign(relativeY || 1);
                    z += deflectionStrength * 1.5 * Math.sign(rotatedZ || 1);
                }
                
                // Wake effect behind car
                if (rotatedX > 0 && Math.abs(rotatedZ) < 1.5) {
                    y += deflectionStrength * 0.8 * Math.sin(rotatedX * 1.5);
                    z += deflectionStrength * 0.6 * Math.cos(rotatedX * 1.2);
                }
                
            } else if (type === 'long') {
                // Long streamlines: dramatic sweeping motions
                if (Math.abs(rotatedX) < 3.0 && Math.abs(rotatedZ) < 1.5) {
                    y += deflectionStrength * 2.5 * Math.sign(relativeY || 1);
                    z += deflectionStrength * 2.0 * Math.sign(rotatedZ || 1);
                }
                
                // Extended wake effects
                if (rotatedX > 0 && Math.abs(rotatedZ) < 2.0) {
                    y += deflectionStrength * 1.2 * Math.sin(rotatedX * 1.0);
                    z += deflectionStrength * 0.8 * Math.sin(rotatedX * 1.3);
                }
            }
        }
        
        // Add natural flow variation
        const flowVariation = 0.08 * Math.exp(-Math.abs(x) * 0.05);
        y += flowVariation * Math.sin(x * 0.3 + z * 0.5);
        z += flowVariation * Math.cos(x * 0.4 + y * 0.3);
        
        pathPoints.push(new THREE.Vector3(x, y, z));
    }
    
    // Create streamline geometry with enhanced colors
    createStreamlineGeometry(pathPoints, opacity, type) {
        // Create smooth curve from points
        const curve = new THREE.CatmullRomCurve3(pathPoints);
        const points = curve.getPoints(pathPoints.length * 2); // Double resolution for smoothness
        
        // Create geometry
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(points.length * 3);
        const colors = new Float32Array(points.length * 3);
        
        // Fill position and color arrays
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            
            // Set position
            positions[i * 3] = point.x;
            positions[i * 3 + 1] = point.y;
            positions[i * 3 + 2] = point.z;
            
            // Calculate velocity-based color
            const velocity = this.velocityCalculator.calculateVelocityAtPoint(point.x, point.y, point.z);
            const velocityRatio = this.velocityCalculator.getVelocityRatio(velocity);
            
            // Enhanced color mapping based on streamline type
            const color = this.getEnhancedColor(velocityRatio, type, i / points.length);
            
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }
        
        // Set geometry attributes
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        // Create enhanced material
        const material = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: opacity,
            linewidth: type === 'long' ? 3 : 2 // Thicker lines for long streamlines
        });
        
        // Create line mesh
        const streamline = new THREE.Line(geometry, material);
        streamline.userData = { type: type }; // Store type for later reference
        
        return streamline;
    }
    
    // Get enhanced color based on velocity and streamline type
    getEnhancedColor(velocityRatio, type, progress) {
        // Base color from velocity
        const baseColor = this.colorMapper.getColorFromVelocityRatio(velocityRatio);
        
        // Enhance colors based on streamline type
        if (type === 'under') {
            // Under-car streamlines: cooler colors (more blue/green)
            baseColor.r *= 0.7;
            baseColor.g *= 1.1;
            baseColor.b *= 1.2;
        } else if (type === 'long') {
            // Long streamlines: more vibrant colors
            baseColor.r *= 1.2;
            baseColor.g *= 1.1;
            baseColor.b *= 0.9;
        }
        
        // Add gradient along the streamline
        const gradientFactor = 0.8 + 0.4 * Math.sin(progress * Math.PI);
        
        return {
            r: Math.min(1.0, baseColor.r * gradientFactor * this.colorIntensity),
            g: Math.min(1.0, baseColor.g * gradientFactor * this.colorIntensity),
            b: Math.min(1.0, baseColor.b * gradientFactor * this.colorIntensity)
        };
    }
    
    // Add all streamlines to the scene
    addStreamlinesToScene() {
        if (!this.scene) return;
        
        // Add main streamlines
        this.streamlines.forEach(streamline => {
            this.scene.add(streamline);
        });
        
        // Add long streamlines
        this.longStreamlines.forEach(streamline => {
            this.scene.add(streamline);
        });
        
        // Add under-car streamlines
        this.underCarStreamlines.forEach(streamline => {
            this.scene.add(streamline);
        });
    }
    
    // Remove all streamlines from the scene
    removeStreamlinesFromScene() {
        if (!this.scene) return;
        
        // Remove main streamlines
        this.streamlines.forEach(streamline => {
            this.scene.remove(streamline);
        });
        
        // Remove long streamlines
        this.longStreamlines.forEach(streamline => {
            this.scene.remove(streamline);
        });
        
        // Remove under-car streamlines
        this.underCarStreamlines.forEach(streamline => {
            this.scene.remove(streamline);
        });
    }
    
    // Update V2 graphics engine
    update(windSpeed, carPosition, carAngle) {
        if (!this.enabled) return;
        
        // Update parameters
        this.baseWindSpeed = windSpeed;
        this.carPosition = carPosition;
        this.carAngle = carAngle;
        
        // Update velocity calculator
        this.velocityCalculator.updateWindSpeed(windSpeed);
        this.velocityCalculator.updateCarInfo(carPosition, this.carSize, carAngle);
        
        // Update streamline colors in real-time
        this.updateStreamlineColors();
    }
    
    // Update colors of all streamlines
    updateStreamlineColors() {
        // Update main streamlines
        this.updateStreamlineGroupColors(this.streamlines);
        
        // Update long streamlines  
        this.updateStreamlineGroupColors(this.longStreamlines);
        
        // Update under-car streamlines
        this.updateStreamlineGroupColors(this.underCarStreamlines);
    }
    
    // Update colors for a group of streamlines
    updateStreamlineGroupColors(streamlineGroup) {
        streamlineGroup.forEach(streamline => {
            const positions = streamline.geometry.attributes.position.array;
            const colors = streamline.geometry.attributes.color.array;
            const type = streamline.userData.type;
            
            // Update colors for each point along the streamline
            for (let i = 0; i < positions.length; i += 3) {
                const x = positions[i];
                const y = positions[i + 1];
                const z = positions[i + 2];
                
                // Calculate new velocity and color
                const velocity = this.velocityCalculator.calculateVelocityAtPoint(x, y, z);
                const velocityRatio = this.velocityCalculator.getVelocityRatio(velocity);
                const progress = (i / 3) / (positions.length / 3);
                const color = this.getEnhancedColor(velocityRatio, type, progress);
                
                // Update color array
                colors[i] = color.r;
                colors[i + 1] = color.g;
                colors[i + 2] = color.b;
            }
            
            // Mark colors as needing update
            streamline.geometry.attributes.color.needsUpdate = true;
        });
    }
    
    // Check if V2 engine is enabled
    isEnabled() {
        return this.enabled;
    }
    
    // Clean up V2 engine
    dispose() {
        this.disable();
        
        // Dispose of geometries and materials
        [...this.streamlines, ...this.longStreamlines, ...this.underCarStreamlines].forEach(streamline => {
            if (streamline.geometry) streamline.geometry.dispose();
            if (streamline.material) streamline.material.dispose();
        });
        
        this.streamlines = [];
        this.longStreamlines = [];
        this.underCarStreamlines = [];
        
        console.log('V2 Graphics Engine disposed');
    }
} 