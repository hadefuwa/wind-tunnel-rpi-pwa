// ===== AERODYNAMICS CALCULATOR CLASS =====
// Calculates drag, lift, and pressure forces for the car
// Simple and beginner-friendly code with basic physics

class AerodynamicsCalculator {
    constructor() {
        console.log('Creating Aerodynamics Calculator...');
        
        // Basic car properties (simplified for beginners)
        this.carFrontalArea = 2.2; // Square meters (car's front area)
        this.carLength = 4.0; // Meters
        this.carWidth = 1.8; // Meters
        this.carHeight = 1.4; // Meters
        
        // Air properties (standard conditions)
        this.airDensity = 1.225; // kg/m³ (air density at sea level)
        this.airViscosity = 0.0000181; // kg/(m·s) (air viscosity)
        
        // Car aerodynamic coefficients (typical values for a sedan)
        this.baseDragCoefficient = 0.30; // Cd (drag coefficient)
        this.baseLiftCoefficient = 0.10; // Cl (lift coefficient)
        this.basePressureCoefficient = 0.50; // Cp (pressure coefficient)
        
        console.log('Aerodynamics Calculator initialized');
    }
    
    // Update car characteristics based on car type
    updateCarCharacteristics(carCharacteristics) {
        if (carCharacteristics) {
            this.baseDragCoefficient = carCharacteristics.drag;
            this.baseLiftCoefficient = carCharacteristics.lift;
            
            console.log('Updated car characteristics:', carCharacteristics.name);
            console.log('Drag coefficient:', this.baseDragCoefficient);
            console.log('Lift coefficient:', this.baseLiftCoefficient);
        }
    }
    
    // Main function to calculate all forces and parameters
    calculateForces(windSpeedMPH, carAngleDegrees) {
        // Convert wind speed from MPH to m/s
        const windSpeedMS = windSpeedMPH * 0.44704;
        
        // Convert angle from degrees to radians
        const carAngleRadians = carAngleDegrees * Math.PI / 180;
        
        // Calculate dynamic pressure (basic fluid dynamics)
        const dynamicPressure = this.calculateDynamicPressure(windSpeedMS);
        
        // Calculate coefficients based on angle
        const coefficients = this.calculateCoefficients(carAngleRadians);
        
        // Calculate forces
        const dragForce = this.calculateDragForce(dynamicPressure, coefficients.drag);
        const liftForce = this.calculateLiftForce(dynamicPressure, coefficients.lift);
        const pressure = this.calculatePressure(dynamicPressure, coefficients.pressure);
        
        // Calculate Reynolds number
        const reynoldsNumber = this.calculateReynoldsNumber(windSpeedMS);
        
        // Calculate stagnation pressure
        const stagnationPressure = this.calculateStagnationPressure(dynamicPressure);
        
        // Calculate downforce (negative lift)
        const downforce = Math.abs(Math.min(liftForce, 0));
        
        // Calculate efficiency rating
        const efficiencyRating = this.calculateEfficiencyRating(windSpeedMPH, carAngleDegrees);
        
        return {
            // Primary forces
            drag: dragForce,
            lift: liftForce,
            downforce: downforce,
            
            // Coefficients
            dragCoefficient: coefficients.drag,
            liftCoefficient: coefficients.lift,
            
            // Pressures
            pressure: pressure / 1000, // Convert to kPa for display
            dynamicPressure: dynamicPressure / 1000, // Convert to kPa
            stagnationPressure: stagnationPressure / 1000, // Convert to kPa
            
            // Flow properties
            velocity: windSpeedMS,
            reynoldsNumber: reynoldsNumber,
            
            // Car properties
            frontalArea: this.carFrontalArea,
            airDensity: this.airDensity,
            
            // Performance
            efficiency: efficiencyRating,
            
            // Original values for compatibility
            windSpeed: windSpeedMS,
            angle: carAngleDegrees
        };
    }
    
    // Calculate dynamic pressure (key concept in aerodynamics)
    calculateDynamicPressure(windSpeedMS) {
        // Formula: q = 0.5 * ρ * v²
        // where q = dynamic pressure, ρ = air density, v = velocity
        const dynamicPressure = 0.5 * this.airDensity * windSpeedMS * windSpeedMS;
        
        return dynamicPressure;
    }
    
    // Calculate aerodynamic coefficients based on car angle
    calculateCoefficients(carAngleRadians) {
        // Simplified model: coefficients change with angle
        
        // Drag increases with angle (more frontal area exposed)
        const dragCoefficient = this.baseDragCoefficient + 
                               Math.abs(Math.sin(carAngleRadians)) * 0.4;
        
        // Lift changes with angle (positive angle can create downforce)
        const liftCoefficient = this.baseLiftCoefficient - 
                               Math.sin(carAngleRadians) * 0.3;
        
        // Pressure changes with angle
        const pressureCoefficient = this.basePressureCoefficient + 
                                   Math.abs(Math.sin(carAngleRadians)) * 0.2;
        
        return {
            drag: dragCoefficient,
            lift: liftCoefficient,
            pressure: pressureCoefficient
        };
    }
    
    // Calculate drag force
    calculateDragForce(dynamicPressure, dragCoefficient) {
        // Formula: F_drag = q * Cd * A
        // where q = dynamic pressure, Cd = drag coefficient, A = frontal area
        const dragForce = dynamicPressure * dragCoefficient * this.carFrontalArea;
        
        return dragForce;
    }
    
    // Calculate lift force
    calculateLiftForce(dynamicPressure, liftCoefficient) {
        // Formula: F_lift = q * Cl * A
        // where q = dynamic pressure, Cl = lift coefficient, A = reference area
        const liftForce = dynamicPressure * liftCoefficient * this.carFrontalArea;
        
        return liftForce;
    }
    
    // Calculate pressure
    calculatePressure(dynamicPressure, pressureCoefficient) {
        // Formula: P = q * Cp
        // where q = dynamic pressure, Cp = pressure coefficient
        const pressure = dynamicPressure * pressureCoefficient;
        
        return pressure;
    }
    
    // Calculate Reynolds number (for advanced users)
    calculateReynoldsNumber(windSpeedMS) {
        // Formula: Re = ρ * v * L / μ
        // where ρ = air density, v = velocity, L = characteristic length, μ = viscosity
        const reynoldsNumber = (this.airDensity * windSpeedMS * this.carLength) / this.airViscosity;
        
        return reynoldsNumber;
    }
    
    // Calculate stagnation pressure (total pressure)
    calculateStagnationPressure(dynamicPressure) {
        // Formula: P_stagnation = P_static + P_dynamic
        // Using standard atmospheric pressure (101.325 kPa)
        const staticPressure = 101325; // Pa (standard atmospheric pressure)
        const stagnationPressure = staticPressure + dynamicPressure;
        
        return stagnationPressure;
    }
    
    // Calculate efficiency rating (performance score)
    calculateEfficiencyRating(windSpeedMPH, carAngleDegrees) {
        // Calculate basic values without calling calculateForces to avoid recursion
        const windSpeedMS = windSpeedMPH * 0.44704;
        const carAngleRadians = carAngleDegrees * Math.PI / 180;
        const dynamicPressure = this.calculateDynamicPressure(windSpeedMS);
        const coefficients = this.calculateCoefficients(carAngleRadians);
        const dragForce = this.calculateDragForce(dynamicPressure, coefficients.drag);
        const liftForce = this.calculateLiftForce(dynamicPressure, coefficients.lift);
        
        // Start with perfect score
        let efficiency = 100;
        
        // Penalize high drag coefficient
        if (coefficients.drag > 0.4) {
            efficiency -= 20;
        } else if (coefficients.drag > 0.3) {
            efficiency -= 10;
        }
        
        // Reward good downforce (negative lift)
        if (liftForce < -0.5) {
            efficiency += 10;
        } else if (liftForce > 0.2) {
            efficiency -= 15;
        }
        
        // Penalize large angles
        if (Math.abs(carAngleDegrees) > 15) {
            efficiency -= 20;
        } else if (Math.abs(carAngleDegrees) > 10) {
            efficiency -= 10;
        }
        
        // Ensure efficiency stays within 0-100 range
        return Math.max(0, Math.min(100, efficiency));
    }
    
    // Simulate wind pressure around the car
    simulateWindPressure(windSpeedMS, carAngleRadians) {
        const dynamicPressure = this.calculateDynamicPressure(windSpeedMS);
        
        // Calculate pressure at different points around the car
        const pressurePoints = {
            front: dynamicPressure * (1.0 + Math.abs(Math.cos(carAngleRadians)) * 0.3),
            rear: dynamicPressure * (0.3 + Math.abs(Math.cos(carAngleRadians)) * 0.2),
            sides: dynamicPressure * (0.6 + Math.abs(Math.sin(carAngleRadians)) * 0.4),
            top: dynamicPressure * (0.4 + Math.abs(Math.sin(carAngleRadians)) * 0.1),
            bottom: dynamicPressure * (0.8 + Math.abs(Math.sin(carAngleRadians)) * 0.2)
        };
        
        return pressurePoints;
    }
    
    // Calculate fuel efficiency impact (simplified)
    calculateFuelEfficiencyImpact(dragForce, windSpeedMS) {
        // Simplified calculation: more drag = more fuel consumption
        const baseFuelConsumption = 8.0; // L/100km (base consumption)
        const dragImpact = (dragForce / 100) * 0.5; // Simplified drag impact
        
        const actualFuelConsumption = baseFuelConsumption + dragImpact;
        
        return {
            baseFuelConsumption: baseFuelConsumption,
            actualFuelConsumption: actualFuelConsumption,
            extraConsumption: dragImpact
        };
    }
    
    // Get explanation of current aerodynamic situation
    getAerodynamicExplanation(windSpeedMPH, carAngleDegrees) {
        const forces = this.calculateForces(windSpeedMPH, carAngleDegrees);
        let explanation = "";
        
        // Explain drag
        if (forces.drag > 200) {
            explanation += "High drag forces - car is experiencing significant air resistance. ";
        } else if (forces.drag > 100) {
            explanation += "Moderate drag forces - normal air resistance. ";
        } else {
            explanation += "Low drag forces - good aerodynamic efficiency. ";
        }
        
        // Explain lift
        if (forces.lift > 0) {
            explanation += "Positive lift - car tends to lift off the ground. ";
        } else if (forces.lift < -50) {
            explanation += "Strong downforce - car is pushed down onto the road. ";
        } else {
            explanation += "Minimal lift forces - car is stable. ";
        }
        
        // Explain angle effect
        if (Math.abs(carAngleDegrees) > 10) {
            explanation += "Large angle creates turbulence and increases drag. ";
        } else {
            explanation += "Small angle maintains good airflow. ";
        }
        
        return explanation;
    }
    
    // Validate inputs
    validateInputs(windSpeedMPH, carAngleDegrees) {
        const errors = [];
        
        if (windSpeedMPH < 0 || windSpeedMPH > 200) {
            errors.push("Wind speed must be between 0 and 200 MPH");
        }
        
        if (carAngleDegrees < -45 || carAngleDegrees > 45) {
            errors.push("Car angle must be between -45 and 45 degrees");
        }
        
        return errors;
    }
    
    // Get car performance rating
    getPerformanceRating(windSpeedMPH, carAngleDegrees) {
        const forces = this.calculateForces(windSpeedMPH, carAngleDegrees);
        
        // Calculate efficiency score (lower drag = better score)
        let efficiencyScore = 100;
        
        if (forces.drag > 300) {
            efficiencyScore -= 40;
        } else if (forces.drag > 200) {
            efficiencyScore -= 20;
        } else if (forces.drag > 100) {
            efficiencyScore -= 10;
        }
        
        // Penalize high lift
        if (Math.abs(forces.lift) > 100) {
            efficiencyScore -= 15;
        }
        
        // Penalize large angles
        if (Math.abs(carAngleDegrees) > 15) {
            efficiencyScore -= 10;
        }
        
        return Math.max(0, efficiencyScore);
    }
    
    // Get recommended angle for best performance
    getRecommendedAngle(windSpeedMPH) {
        // For most cars, slightly negative angle (nose down) is best
        const baseAngle = -2; // degrees
        
        // Adjust based on wind speed
        const speedAdjustment = windSpeedMPH * 0.01;
        
        const recommendedAngle = baseAngle - speedAdjustment;
        
        return Math.max(-5, Math.min(5, recommendedAngle));
    }
} 