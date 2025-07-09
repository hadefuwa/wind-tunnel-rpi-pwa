// ===== WIND PARTICLE SYSTEM =====
// Creates animated particles that show wind flow in the tunnel
// Simple and beginner-friendly code

class WindParticleSystem {
    constructor() {
        console.log('Creating Wind Particle System...');
        
        // Basic settings
        this.particleCount = 500; // Reduce for better performance on Pi
        this.windSpeed = 1.0;
        this.particles = [];
        this.particleSystem = null;
        
        // NEW: Create velocity field calculator and color mapper
        this.velocityCalculator = new VelocityFieldCalculator();
        this.colorMapper = new VelocityColorMapper();
        
        // Create the particle system
        this.createParticles();
        
        console.log('Wind Particle System created with', this.particleCount, 'particles');
    }
    
    // Create all the wind particles
    createParticles() {
        console.log('Creating wind particles...');
        
        // Create geometry to hold all particle positions
        const geometry = new THREE.BufferGeometry();
        
        // Arrays to store particle data
        const positions = new Float32Array(this.particleCount * 3); // x, y, z for each particle
        const velocities = new Float32Array(this.particleCount * 3); // velocity for each particle
        const colors = new Float32Array(this.particleCount * 3); // color for each particle
        
        // Create each particle
        for (let i = 0; i < this.particleCount; i++) {
            // Calculate array index (each particle has 3 values: x, y, z)
            const index = i * 3;
            
            // Set random starting position
            positions[index] = this.getRandomX(); // x position
            positions[index + 1] = this.getRandomY(); // y position
            positions[index + 2] = this.getRandomZ(); // z position
            
            // Set velocity (how fast particle moves)
            velocities[index] = this.windSpeed + Math.random() * 0.5; // x velocity (wind direction)
            velocities[index + 1] = (Math.random() - 0.5) * 0.1; // y velocity (small random drift)
            velocities[index + 2] = (Math.random() - 0.5) * 0.1; // z velocity (small random drift)
            
            // NEW: Calculate velocity-based color instead of fixed blue-green
            const particleVelocity = this.velocityCalculator.calculateVelocityAtPoint(
                positions[index], 
                positions[index + 1], 
                positions[index + 2]
            );
            const velocityRatio = this.velocityCalculator.getVelocityRatio(particleVelocity);
            const color = this.colorMapper.getColorFromVelocityRatio(velocityRatio);
            
            // Set color based on velocity (green → yellow → red)
            colors[index] = color.r;     // red component
            colors[index + 1] = color.g; // green component
            colors[index + 2] = color.b; // blue component
        }
        
        // Add data to geometry
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        // Store velocities for later use
        this.velocities = velocities;
        
        // Create material for particles
        const material = new THREE.PointsMaterial({
            size: 0.1,
            transparent: true,
            opacity: 0.8,
            vertexColors: true, // Use the colors we defined
            blending: THREE.AdditiveBlending // Makes particles glow
        });
        
        // Create the particle system
        this.particleSystem = new THREE.Points(geometry, material);
        
        console.log('Wind particles created successfully!');
    }
    
    // Get random X position (spread across tunnel length)
    getRandomX() {
        return (Math.random() - 0.5) * 20; // -10 to +10
    }
    
    // Get random Y position (spread across tunnel height)
    getRandomY() {
        return (Math.random() - 0.5) * 6; // -3 to +3
    }
    
    // Get random Z position (spread across tunnel width)
    getRandomZ() {
        return (Math.random() - 0.5) * 6; // -3 to +3
    }
    
    // Update all particles (called every frame)
    update(currentTime, windSpeed) {
        if (!this.particleSystem) return;
        
        // Update wind speed
        this.windSpeed = windSpeed * 0.1; // Convert MPH to reasonable speed
        
        // NEW: Update velocity calculator with current wind speed
        this.velocityCalculator.updateWindSpeed(windSpeed);
        
        // Get particle positions and colors
        const positions = this.particleSystem.geometry.attributes.position.array;
        const colors = this.particleSystem.geometry.attributes.color.array;
        
        // Update each particle
        for (let i = 0; i < this.particleCount; i++) {
            const index = i * 3;
            
            // Move particle based on velocity
            positions[index] += this.velocities[index] * 0.02; // x movement
            positions[index + 1] += this.velocities[index + 1] * 0.02; // y movement
            positions[index + 2] += this.velocities[index + 2] * 0.02; // z movement
            
            // Reset particle if it goes too far
            if (positions[index] > 10) {
                positions[index] = -10;
                positions[index + 1] = this.getRandomY();
                positions[index + 2] = this.getRandomZ();
            }
            
            // Update velocity based on wind speed
            this.velocities[index] = this.windSpeed + Math.random() * 0.5;
            
            // NEW: Update particle color based on new position
            const particleVelocity = this.velocityCalculator.calculateVelocityAtPoint(
                positions[index], 
                positions[index + 1], 
                positions[index + 2]
            );
            const velocityRatio = this.velocityCalculator.getVelocityRatio(particleVelocity);
            const color = this.colorMapper.getColorFromVelocityRatio(velocityRatio);
            
            // Update color array
            colors[index] = color.r;     // red component
            colors[index + 1] = color.g; // green component
            colors[index + 2] = color.b; // blue component
        }
        
        // Tell Three.js that positions and colors have changed
        this.particleSystem.geometry.attributes.position.needsUpdate = true;
        this.particleSystem.geometry.attributes.color.needsUpdate = true;
    }
    
    // Get the particle system for adding to scene
    getParticleSystem() {
        return this.particleSystem;
    }
    
    // Set wind speed
    setWindSpeed(speed) {
        this.windSpeed = speed * 0.1;
        // NEW: Update velocity calculator with new wind speed
        this.velocityCalculator.updateWindSpeed(speed);
    }
    
    // NEW: Update car information for velocity calculations
    updateCarInfo(carPosition, carAngle) {
        // Default car size (can be made configurable later)
        const carSize = { width: 1.8, height: 1.4, length: 4.0 };
        
        // Update velocity calculator with car info
        this.velocityCalculator.updateCarInfo(carPosition, carSize, carAngle);
    }
    
    // NEW: Update streamlines with current velocity field
    updateStreamlines(streamlines) {
        if (!streamlines) return;
        
        // Recreate streamline paths AND update colors
        this.updateStreamlinePaths(streamlines);
        this.updateStreamlineColors(streamlines);
    }
    
    // NEW: Update streamline paths to follow airflow around car
    updateStreamlinePaths(streamlines) {
        if (!streamlines) return;
        
        streamlines.forEach((streamline, streamlineIndex) => {
            // Create proper 3D grid of streamlines instead of diagonal pattern
            const streamlinesPerRow = 3;
            const streamlinesPerColumn = 7;
            
            const row = Math.floor(streamlineIndex / streamlinesPerRow);
            const col = streamlineIndex % streamlinesPerRow;
            
            // Create even spacing in Y (vertical) and Z (depth) dimensions
            const yPos = -2.0 + row * (4.0 / (streamlinesPerColumn - 1)); // -2.0 to +2.0
            const zPos = -1.0 + col * (2.0 / (streamlinesPerRow - 1)); // -1.0 to +1.0
            
            // Create new path points that follow airflow around current car position
            const pathPoints = [];
            const pointCount = 100; // Points along the streamline
            
            for (let j = 0; j < pointCount; j++) {
                const x = -10 + (j / pointCount) * 20; // From -10 to +10
                let y = yPos;
                let z = zPos;
                
                // Get car position and rotation
                const carPos = this.velocityCalculator.carPosition;
                const carAngle = this.velocityCalculator.carAngle;
                
                // Calculate distance from car with rotation
                const cosAngle = Math.cos(carAngle * Math.PI / 180);
                const sinAngle = Math.sin(carAngle * Math.PI / 180);
                
                // Rotate point relative to car to account for car rotation
                const relativeX = x - carPos.x;
                const relativeY = y - carPos.y;
                const relativeZ = z - carPos.z;
                
                const rotatedX = relativeX * cosAngle - relativeZ * sinAngle;
                const rotatedZ = relativeX * sinAngle + relativeZ * cosAngle;
                
                const distanceFromCar = Math.sqrt(rotatedX * rotatedX + relativeY * relativeY + rotatedZ * rotatedZ);
                
                // Apply deflection effects that work well in all viewing angles
                if (distanceFromCar < 3) {
                    const deflectionStrength = Math.max(0, 1 - distanceFromCar / 3);
                    
                    // Car blocking effect - deflect around the car
                    if (Math.abs(rotatedX) < 2.0 && Math.abs(rotatedZ) < 1.0) {
                        // Deflect upward (positive Y) and outward (Z direction)
                        y += deflectionStrength * 1.5 * Math.sign(relativeY || 1);
                        z += deflectionStrength * 1.5 * Math.sign(rotatedZ || 1);
                    }
                    
                    // Wake effect behind car - turbulent flow
                    if (rotatedX > 0 && Math.abs(rotatedZ) < 1.5) {
                        y += deflectionStrength * 0.8 * Math.sin(rotatedX * 2) * Math.sign(relativeY || 1);
                        z += deflectionStrength * 0.5 * Math.cos(rotatedX * 2) * Math.sign(rotatedZ || 1);
                    }
                    
                    // Stagnation effect in front of car - air pushes outward
                    if (rotatedX < 0 && Math.abs(rotatedZ) < 1.0) {
                        y += deflectionStrength * 1.0 * Math.sign(relativeY || 1);
                        z += deflectionStrength * 1.2 * Math.sign(rotatedZ || 1);
                    }
                }
                
                // Add natural flow variation
                y += 0.1 * Math.sin(x * 0.5) * Math.exp(-Math.abs(x) * 0.1);
                z += 0.05 * Math.cos(x * 0.3) * Math.exp(-Math.abs(x) * 0.1);
                
                pathPoints.push(new THREE.Vector3(x, y, z));
            }
            
            // Create new curve and update geometry
            const curve = new THREE.CatmullRomCurve3(pathPoints);
            const points = curve.getPoints(200);
            
            // Update position attributes
            const positions = streamline.geometry.attributes.position.array;
            for (let j = 0; j < points.length && j < positions.length / 3; j++) {
                positions[j * 3] = points[j].x;
                positions[j * 3 + 1] = points[j].y;
                positions[j * 3 + 2] = points[j].z;
            }
            
            // Tell Three.js that positions have changed
            streamline.geometry.attributes.position.needsUpdate = true;
        });
    }
    
    // Add turbulence effect around car
    addTurbulence(carPosition, carAngle) {
        if (!this.particleSystem) return;
        
        const positions = this.particleSystem.geometry.attributes.position.array;
        
        // Check each particle
        for (let i = 0; i < this.particleCount; i++) {
            const index = i * 3;
            
            // Calculate distance from car
            const dx = positions[index] - carPosition.x;
            const dy = positions[index + 1] - carPosition.y;
            const dz = positions[index + 2] - carPosition.z;
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            // Add turbulence if particle is near car
            if (distance < 3) {
                const turbulenceStrength = 1 - (distance / 3);
                
                // Add random turbulence
                this.velocities[index + 1] += (Math.random() - 0.5) * turbulenceStrength * 0.05;
                this.velocities[index + 2] += (Math.random() - 0.5) * turbulenceStrength * 0.05;
                
                // Simulate car deflecting air
                if (dx > 0) { // Particles behind car
                    this.velocities[index + 1] += turbulenceStrength * 0.02;
                }
            }
        }
    }
    
    // Create streamlines (curved lines showing airflow)
    createStreamlines() {
        console.log('Creating professional wind streamlines...');
        
        const streamlines = [];
        const streamlineCount = 21; // More streamlines for better 3D visualization (3x7 grid)
        
        for (let i = 0; i < streamlineCount; i++) {
            // Create proper 3D grid of streamlines for all viewing angles
            const streamlinesPerRow = 3;
            const streamlinesPerColumn = 7;
            
            const row = Math.floor(i / streamlinesPerRow);
            const col = i % streamlinesPerRow;
            
            // Create even spacing in Y (vertical) and Z (depth) dimensions
            const yPos = -2.0 + row * (4.0 / (streamlinesPerColumn - 1)); // -2.0 to +2.0
            const zPos = -1.0 + col * (2.0 / (streamlinesPerRow - 1)); // -1.0 to +1.0
            
            // Create path points that simulate realistic airflow around a car
            const pathPoints = [];
            const pointCount = 100; // More points for smoother curves
            
            for (let j = 0; j < pointCount; j++) {
                const x = -10 + (j / pointCount) * 20; // From -10 to +10
                let y = yPos;
                let z = zPos;
                
                // Simulate airflow effects around car position (assumed at origin)
                const distanceFromCar = Math.sqrt(x * x + y * y + z * z);
                
                // Apply realistic airflow deflection around the car
                if (distanceFromCar < 2.5) {
                    const deflectionStrength = Math.max(0, 1 - distanceFromCar / 2.5);
                    
                    // Car blocking effect - deflect around the car
                    if (Math.abs(x) < 2.0 && Math.abs(z) < 1.0) {
                        // Deflect upward and outward
                        y += deflectionStrength * 1.0 * Math.sign(y || 1);
                        z += deflectionStrength * 1.0 * Math.sign(z || 1);
                    }
                    
                    // Wake effect behind car
                    if (x > 0 && Math.abs(z) < 1.5) {
                        y += deflectionStrength * 0.5 * Math.sin(x * 2) * Math.sign(y || 1);
                        z += deflectionStrength * 0.3 * Math.cos(x * 2) * Math.sign(z || 1);
                    }
                    
                    // Stagnation effect in front of car
                    if (x < 0 && Math.abs(z) < 1.0) {
                        y += deflectionStrength * 0.8 * Math.sign(y || 1);
                        z += deflectionStrength * 0.8 * Math.sign(z || 1);
                    }
                }
                
                // Add natural flow variation (reduced for cleaner look)
                y += 0.05 * Math.sin(x * 0.5) * Math.exp(-Math.abs(x) * 0.2);
                z += 0.03 * Math.cos(x * 0.3) * Math.exp(-Math.abs(x) * 0.2);
                
                pathPoints.push(new THREE.Vector3(x, y, z));
            }
            
            // Create curve from path points
            const curve = new THREE.CatmullRomCurve3(pathPoints);
            
            // Create geometry with color-coded segments
            const geometry = new THREE.BufferGeometry();
            const points = curve.getPoints(200); // High resolution for smooth lines
            const positions = new Float32Array(points.length * 3);
            const colors = new Float32Array(points.length * 3);
            
            // Fill position and color arrays
            for (let j = 0; j < points.length; j++) {
                const point = points[j];
                
                // Set position
                positions[j * 3] = point.x;
                positions[j * 3 + 1] = point.y;
                positions[j * 3 + 2] = point.z;
                
                // Calculate velocity at this point for color
                const velocity = this.velocityCalculator.calculateVelocityAtPoint(point.x, point.y, point.z);
                const velocityRatio = this.velocityCalculator.getVelocityRatio(velocity);
                const color = this.colorMapper.getColorFromVelocityRatio(velocityRatio);
                
                // Set color
                colors[j * 3] = color.r;
                colors[j * 3 + 1] = color.g;
                colors[j * 3 + 2] = color.b;
            }
            
            // Set geometry attributes
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
            
            // Create material that uses vertex colors
            const material = new THREE.LineBasicMaterial({
                vertexColors: true,
                transparent: true,
                opacity: 0.7,
                linewidth: 2
            });
            
            // Create line mesh
            const streamline = new THREE.Line(geometry, material);
            streamlines.push(streamline);
        }
        
        console.log('Professional streamlines created with velocity-based coloring!');
        return streamlines;
    }
    
    // Animate streamlines
    animateStreamlines(streamlines, currentTime) {
        if (!streamlines) return;
        
        streamlines.forEach((streamline, index) => {
            const time = currentTime * 0.001;
            streamline.material.opacity = 0.2 + 0.2 * Math.sin(time + index * 0.2);
        });
    }
    
    // NEW: Update streamline colors in real-time
    updateStreamlineColors(streamlines) {
        if (!streamlines) return;
        
        streamlines.forEach(streamline => {
            const positions = streamline.geometry.attributes.position.array;
            const colors = streamline.geometry.attributes.color.array;
            
            // Update colors for each point along the streamline
            for (let i = 0; i < positions.length; i += 3) {
                const x = positions[i];
                const y = positions[i + 1];
                const z = positions[i + 2];
                
                // Calculate velocity at this point
                const velocity = this.velocityCalculator.calculateVelocityAtPoint(x, y, z);
                const velocityRatio = this.velocityCalculator.getVelocityRatio(velocity);
                const color = this.colorMapper.getColorFromVelocityRatio(velocityRatio);
                
                // Update color
                colors[i] = color.r;
                colors[i + 1] = color.g;
                colors[i + 2] = color.b;
            }
            
            // Tell Three.js that colors have changed
            streamline.geometry.attributes.color.needsUpdate = true;
        });
    }
    
    // Clean up resources
    dispose() {
        if (this.particleSystem) {
            this.particleSystem.geometry.dispose();
            this.particleSystem.material.dispose();
        }
        
        console.log('Wind particle system disposed');
    }
} 