// ===== VELOCITY FIELD CALCULATOR =====
// Calculates air velocity at any point in the wind tunnel
// Simple and beginner-friendly code

class VelocityFieldCalculator {
    constructor() {
        console.log('Creating Velocity Field Calculator...');
        
        // Basic wind tunnel settings
        this.baseWindSpeed = 50; // MPH
        this.tunnelWidth = 6;
        this.tunnelHeight = 4;
        this.tunnelLength = 12;
        
        // Car information (will be updated from main app)
        this.carPosition = { x: 0, y: 0, z: 0 };
        this.carSize = { width: 1.8, height: 1.4, length: 4.0 };
        this.carAngle = 0;
        
        console.log('Velocity Field Calculator created');
    }
    
    // Update car information
    updateCarInfo(position, size, angle) {
        this.carPosition = position;
        this.carSize = size;
        this.carAngle = angle;
    }
    
    // Update wind speed
    updateWindSpeed(windSpeedMPH) {
        this.baseWindSpeed = windSpeedMPH;
    }
    
    // Calculate velocity at any point in the tunnel
    calculateVelocityAtPoint(x, y, z) {
        // Start with base wind speed (convert MPH to m/s for calculations)
        const baseVelocity = this.baseWindSpeed * 0.44704;
        
        // Calculate distance from car
        const distanceFromCar = this.getDistanceFromCar(x, y, z);
        
        // Calculate velocity based on position and car effects
        let velocity = baseVelocity;
        
        // Add car effects
        velocity = this.addCarEffects(velocity, x, y, z, distanceFromCar);
        
        // Add tunnel wall effects
        velocity = this.addWallEffects(velocity, x, y, z);
        
        // Add turbulence effects
        velocity = this.addTurbulenceEffects(velocity, x, y, z, distanceFromCar);
        
        return Math.max(0, velocity); // Ensure velocity is never negative
    }
    
    // Get distance from car center
    getDistanceFromCar(x, y, z) {
        const dx = x - this.carPosition.x;
        const dy = y - this.carPosition.y;
        const dz = z - this.carPosition.z;
        
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    
    // Add car effects on airflow (accounting for car rotation)
    addCarEffects(velocity, x, y, z, distanceFromCar) {
        // Account for car rotation in velocity calculations
        const carAngleRadians = this.carAngle * Math.PI / 180;
        const cosAngle = Math.cos(carAngleRadians);
        const sinAngle = Math.sin(carAngleRadians);
        
        // Transform point to car's local coordinate system
        const relativeX = x - this.carPosition.x;
        const relativeY = y - this.carPosition.y;
        const relativeZ = z - this.carPosition.z;
        
        // Rotate point relative to car
        const rotatedX = relativeX * cosAngle - relativeZ * sinAngle;
        const rotatedZ = relativeX * sinAngle + relativeZ * cosAngle;
        
        // Calculate effects based on rotated coordinates
        const rotatedDistance = Math.sqrt(rotatedX * rotatedX + relativeY * relativeY + rotatedZ * rotatedZ);
        
        // If point is very close to car, velocity is very low (blocked by car)
        if (rotatedDistance < 1.0) {
            velocity *= 0.1; // Very slow air near car
        }
        // If point is in front of car (accounting for rotation), air slows down (stagnation)
        else if (rotatedX < 0 && rotatedDistance < 2.0) {
            const slowdownFactor = 1.0 - (0.6 * (2.0 - rotatedDistance) / 2.0);
            velocity *= slowdownFactor;
        }
        // If point is behind car (accounting for rotation), air speeds up (wake effect)
        else if (rotatedX > 0 && rotatedDistance < 3.0) {
            const speedupFactor = 1.0 + (0.5 * (3.0 - rotatedDistance) / 3.0);
            velocity *= speedupFactor;
        }
        // If point is above car, air speeds up (over-the-top effect)
        else if (relativeY > 0 && Math.abs(rotatedX) < 2.0) {
            const heightEffect = relativeY / 2.0;
            velocity *= (1.0 + heightEffect * 0.3);
        }
        // If point is beside car (accounting for rotation), air speeds up
        else if (Math.abs(rotatedZ) > 1.0 && Math.abs(rotatedX) < 2.0) {
            const sideEffect = (Math.abs(rotatedZ) - 1.0) / 2.0;
            velocity *= (1.0 + sideEffect * 0.25);
        }
        
        return velocity;
    }
    
    // Add tunnel wall effects
    addWallEffects(velocity, x, y, z) {
        // Air slows down near walls due to friction
        const wallDistance = this.getDistanceFromWalls(y, z);
        
        if (wallDistance < 0.5) {
            const wallEffect = wallDistance / 0.5; // 0 at wall, 1 at distance 0.5
            velocity *= (0.7 + 0.3 * wallEffect); // Minimum 70% speed at walls
        }
        
        return velocity;
    }
    
    // Get distance from tunnel walls
    getDistanceFromWalls(y, z) {
        const distanceFromFloor = Math.abs(y + this.tunnelHeight / 2);
        const distanceFromCeiling = Math.abs(y - this.tunnelHeight / 2);
        const distanceFromLeftWall = Math.abs(z + this.tunnelWidth / 2);
        const distanceFromRightWall = Math.abs(z - this.tunnelWidth / 2);
        
        return Math.min(distanceFromFloor, distanceFromCeiling, distanceFromLeftWall, distanceFromRightWall);
    }
    
    // Add turbulence effects
    addTurbulenceEffects(velocity, x, y, z, distanceFromCar) {
        // Add random turbulence behind the car
        if (x > this.carPosition.x && distanceFromCar < 4.0) {
            const turbulenceStrength = (4.0 - distanceFromCar) / 4.0;
            const randomTurbulence = (Math.random() - 0.5) * 0.2 * turbulenceStrength;
            velocity += velocity * randomTurbulence;
        }
        
        return velocity;
    }
    
    // Get velocity magnitude as a 0-1 value for color mapping
    getVelocityRatio(velocity) {
        // Convert velocity back to MPH for easier understanding
        const velocityMPH = velocity / 0.44704;
        
        // Create ratio: 0 = very slow, 1 = very fast
        // Assume max interesting velocity is 1.5x base wind speed
        const maxVelocity = this.baseWindSpeed * 1.5;
        const ratio = Math.min(velocityMPH / maxVelocity, 1.0);
        
        return ratio;
    }
}

// ===== COLOR MAPPING SYSTEM =====
// Maps velocity values to green → yellow → red colors
class VelocityColorMapper {
    constructor() {
        console.log('Creating Velocity Color Mapper...');
        
        // Color definitions for velocity mapping
        this.slowColor = { r: 0.0, g: 1.0, b: 0.0 };    // Green for slow
        this.mediumColor = { r: 1.0, g: 1.0, b: 0.0 };  // Yellow for medium
        this.fastColor = { r: 1.0, g: 0.0, b: 0.0 };    // Red for fast
        
        console.log('Velocity Color Mapper created');
    }
    
    // Get color from velocity ratio (0-1)
    getColorFromVelocityRatio(velocityRatio) {
        let color = { r: 0, g: 0, b: 0 };
        
        if (velocityRatio < 0.5) {
            // Interpolate between green and yellow
            const t = velocityRatio * 2.0; // 0 to 1
            color.r = this.slowColor.r + (this.mediumColor.r - this.slowColor.r) * t;
            color.g = this.slowColor.g + (this.mediumColor.g - this.slowColor.g) * t;
            color.b = this.slowColor.b + (this.mediumColor.b - this.slowColor.b) * t;
        } else {
            // Interpolate between yellow and red
            const t = (velocityRatio - 0.5) * 2.0; // 0 to 1
            color.r = this.mediumColor.r + (this.fastColor.r - this.mediumColor.r) * t;
            color.g = this.mediumColor.g + (this.fastColor.g - this.mediumColor.g) * t;
            color.b = this.mediumColor.b + (this.fastColor.b - this.mediumColor.b) * t;
        }
        
        return color;
    }
    
    // Get color from actual velocity value
    getColorFromVelocity(velocity, maxVelocity) {
        const ratio = Math.min(velocity / maxVelocity, 1.0);
        return this.getColorFromVelocityRatio(ratio);
    }
    
    // Get color as Three.js Color object
    getThreeJSColor(velocityRatio) {
        const color = this.getColorFromVelocityRatio(velocityRatio);
        return new THREE.Color(color.r, color.g, color.b);
    }
    
    // Get color as array for buffer geometry
    getColorArray(velocityRatio) {
        const color = this.getColorFromVelocityRatio(velocityRatio);
        return [color.r, color.g, color.b];
    }
} 