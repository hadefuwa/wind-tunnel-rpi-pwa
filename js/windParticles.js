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
            
            // Set color (blue-green like wind)
            colors[index] = 0.0; // red
            colors[index + 1] = 0.8 + Math.random() * 0.2; // green
            colors[index + 2] = 1.0; // blue
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
        
        // Get particle positions
        const positions = this.particleSystem.geometry.attributes.position.array;
        
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
        }
        
        // Tell Three.js that positions have changed
        this.particleSystem.geometry.attributes.position.needsUpdate = true;
    }
    
    // Get the particle system for adding to scene
    getParticleSystem() {
        return this.particleSystem;
    }
    
    // Set wind speed
    setWindSpeed(speed) {
        this.windSpeed = speed * 0.1;
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
        console.log('Creating wind streamlines...');
        
        const streamlines = [];
        const streamlineCount = 10;
        
        for (let i = 0; i < streamlineCount; i++) {
            // Create curved path for streamline
            const curve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(-10, -2 + i * 0.5, -2 + i * 0.4),
                new THREE.Vector3(-5, -2 + i * 0.5, -2 + i * 0.4),
                new THREE.Vector3(0, -1.5 + i * 0.6, -1.5 + i * 0.5),
                new THREE.Vector3(5, -2 + i * 0.5, -2 + i * 0.4),
                new THREE.Vector3(10, -2 + i * 0.5, -2 + i * 0.4)
            ]);
            
            // Create geometry from curve
            const geometry = new THREE.TubeGeometry(curve, 50, 0.02, 8, false);
            const material = new THREE.MeshBasicMaterial({ 
                color: 0x0088ff,
                transparent: true,
                opacity: 0.3
            });
            
            const streamline = new THREE.Mesh(geometry, material);
            streamlines.push(streamline);
        }
        
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
    
    // Clean up resources
    dispose() {
        if (this.particleSystem) {
            this.particleSystem.geometry.dispose();
            this.particleSystem.material.dispose();
        }
        
        console.log('Wind particle system disposed');
    }
} 