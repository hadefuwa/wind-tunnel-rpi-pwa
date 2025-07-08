/**
 * Car Settings Storage System
 * Saves and loads car rotation and position settings using localStorage
 * Simple and beginner-friendly local storage solution
 */

class CarSettingsStorage {
    constructor() {
        console.log('Car Settings Storage initialized');
        
        // Storage key for localStorage
        this.storageKey = 'windTunnelCarSettings';
        
        // Default settings
        this.defaultSettings = {
            rotations: {
                f1: { x: 0, y: 90, z: 0 }, // F1 car typically needs 90° Y rotation
                sedan: { x: 0, y: 0, z: 0 },
                sports: { x: 0, y: 0, z: 0 },
                suv: { x: 0, y: 0, z: 0 },
                truck: { x: 0, y: 0, z: 0 },
                custom: { x: 0, y: 0, z: 0 }
            },
            positions: {
                f1: { x: 0, y: -1.5, z: 0 },
                sedan: { x: 0, y: -1.5, z: 0 },
                sports: { x: 0, y: -1.5, z: 0 },
                suv: { x: 0, y: -1.5, z: 0 },
                truck: { x: 0, y: -1.5, z: 0 },
                custom: { x: 0, y: -1.5, z: 0 }
            },
            lastModified: new Date().toISOString()
        };
        
        // Load existing settings or create default
        this.loadSettings();
    }
    
    // Load settings from localStorage
    loadSettings() {
        try {
            const savedSettings = localStorage.getItem(this.storageKey);
            
            if (savedSettings) {
                this.settings = JSON.parse(savedSettings);
                console.log('Car settings loaded from localStorage');
                
                // Ensure all car types have settings (for backward compatibility)
                this.ensureAllCarTypes();
            } else {
                console.log('No saved settings found, using defaults');
                this.settings = JSON.parse(JSON.stringify(this.defaultSettings));
                this.saveSettings();
            }
        } catch (error) {
            console.error('Error loading car settings:', error);
            this.settings = JSON.parse(JSON.stringify(this.defaultSettings));
        }
    }
    
    // Ensure all car types have rotation and position settings
    ensureAllCarTypes() {
        const carTypes = ['f1', 'sedan', 'sports', 'suv', 'truck', 'custom'];
        
        // Check rotations
        if (!this.settings.rotations) {
            this.settings.rotations = {};
        }
        
        // Check positions
        if (!this.settings.positions) {
            this.settings.positions = {};
        }
        
        carTypes.forEach(carType => {
            if (!this.settings.rotations[carType]) {
                this.settings.rotations[carType] = { x: 0, y: 0, z: 0 };
            }
            
            if (!this.settings.positions[carType]) {
                this.settings.positions[carType] = { x: 0, y: -1.5, z: 0 };
            }
        });
        
        this.saveSettings();
    }
    
    // Save settings to localStorage
    saveSettings() {
        try {
            this.settings.lastModified = new Date().toISOString();
            localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
            console.log('Car settings saved to localStorage');
        } catch (error) {
            console.error('Error saving car settings:', error);
        }
    }
    
    // Get rotation for a specific car type
    getRotation(carType) {
        if (this.settings.rotations[carType]) {
            return this.settings.rotations[carType];
        } else {
            // Return default rotation
            return { x: 0, y: 0, z: 0 };
        }
    }
    
    // Set rotation for a specific car type
    setRotation(carType, rotation) {
        if (!this.settings.rotations[carType]) {
            this.settings.rotations[carType] = {};
        }
        
        this.settings.rotations[carType] = {
            x: rotation.x || 0,
            y: rotation.y || 0,
            z: rotation.z || 0
        };
        
        this.saveSettings();
        console.log(`Rotation saved for ${carType}:`, this.settings.rotations[carType]);
    }
    
    // Get position for a specific car type
    getPosition(carType) {
        if (this.settings.positions[carType]) {
            return this.settings.positions[carType];
        } else {
            // Return default position
            return { x: 0, y: -1.5, z: 0 };
        }
    }
    
    // Set position for a specific car type
    setPosition(carType, position) {
        if (!this.settings.positions[carType]) {
            this.settings.positions[carType] = {};
        }
        
        this.settings.positions[carType] = {
            x: position.x || 0,
            y: position.y || -1.5,
            z: position.z || 0
        };
        
        this.saveSettings();
        console.log(`Position saved for ${carType}:`, this.settings.positions[carType]);
    }
    
    // Reset rotation for a specific car type to default
    resetRotation(carType) {
        const defaultRotation = this.defaultSettings.rotations[carType] || { x: 0, y: 0, z: 0 };
        this.setRotation(carType, defaultRotation);
        console.log(`Rotation reset for ${carType}`);
    }
    
    // Reset position for a specific car type to default
    resetPosition(carType) {
        this.setPosition(carType, { x: 0, y: -1.5, z: 0 });
        console.log(`Position reset for ${carType}`);
    }
    
    // Reset all settings for a specific car type
    resetCarSettings(carType) {
        this.resetRotation(carType);
        this.resetPosition(carType);
        console.log(`All settings reset for ${carType}`);
    }
    
    // Get all settings (for debugging or export)
    getAllSettings() {
        return JSON.parse(JSON.stringify(this.settings));
    }
    
    // Clear all settings and reset to defaults
    clearAllSettings() {
        this.settings = JSON.parse(JSON.stringify(this.defaultSettings));
        this.saveSettings();
        console.log('All car settings cleared and reset to defaults');
    }
    
    // Export settings as JSON string
    exportSettings() {
        return JSON.stringify(this.settings, null, 2);
    }
    
    // Import settings from JSON string
    importSettings(jsonString) {
        try {
            const importedSettings = JSON.parse(jsonString);
            this.settings = importedSettings;
            this.ensureAllCarTypes();
            this.saveSettings();
            console.log('Settings imported successfully');
            return true;
        } catch (error) {
            console.error('Error importing settings:', error);
            return false;
        }
    }
    
    // Check if localStorage is available
    isStorageAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            console.warn('localStorage not available:', error);
            return false;
        }
    }
}

// Make it globally available
window.CarSettingsStorage = CarSettingsStorage; 