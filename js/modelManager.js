// Model Manager for Settings Page
// Handles viewing, editing, and managing preloaded car models

class ModelManager {
    constructor() {
        this.models = {};
        this.disabledModels = new Set();
        this.init();
    }

    init() {
        // Load models from carModel when available
        this.loadModelsFromCarModel();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Load saved settings
        this.loadSettings();
    }

    loadModelsFromCarModel() {
        // Wait for carManager to be available
        if (window.carManager && window.carManager.carTypes) {
            this.models = JSON.parse(JSON.stringify(window.carManager.carTypes));
            this.renderModelList();
        } else {
            // Try again in 500ms
            setTimeout(() => this.loadModelsFromCarModel(), 500);
        }
    }

    setupEventListeners() {
        // Model management buttons
        const addNewModelBtn = document.getElementById('addNewModel');
        const resetAllModelsBtn = document.getElementById('resetAllModels');
        
        if (addNewModelBtn) {
            addNewModelBtn.addEventListener('click', () => this.addNewModel());
        }
        
        if (resetAllModelsBtn) {
            resetAllModelsBtn.addEventListener('click', () => this.resetAllModels());
        }

        // Settings checkboxes
        this.setupSettingsListeners();
        
        // Data management buttons
        this.setupDataManagementListeners();
    }

    setupSettingsListeners() {
        const settings = ['enableParticles', 'enableSounds', 'autoSave', 'performanceMode'];
        
        settings.forEach(settingId => {
            const checkbox = document.getElementById(settingId);
            if (checkbox) {
                checkbox.addEventListener('change', () => this.saveSetting(settingId, checkbox.checked));
            }
        });
    }

    setupDataManagementListeners() {
        const exportBtn = document.getElementById('exportSettings');
        const importBtn = document.getElementById('importSettings');
        const clearBtn = document.getElementById('clearAllData');
        
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportSettings());
        }
        
        if (importBtn) {
            importBtn.addEventListener('click', () => this.importSettings());
        }
        
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearAllData());
        }
    }

    renderModelList() {
        const modelList = document.getElementById('modelList');
        if (!modelList) return;

        modelList.innerHTML = '';

        Object.keys(this.models).forEach(modelId => {
            const model = this.models[modelId];
            const isDisabled = this.disabledModels.has(modelId);
            
            const modelItem = this.createModelItem(modelId, model, isDisabled);
            modelList.appendChild(modelItem);
        });
    }

    createModelItem(modelId, model, isDisabled) {
        const item = document.createElement('div');
        item.className = `model-item ${isDisabled ? 'disabled' : ''}`;
        item.dataset.modelId = modelId;

        item.innerHTML = `
            <div class="model-header">
                <div class="model-info">
                    <div class="model-name">${model.name}</div>
                    <div class="model-type">${model.isSTL ? 'STL MODEL' : 'GEOMETRIC'}</div>
                </div>
                <div class="model-actions">
                    <button class="model-btn edit-btn" onclick="modelManager.editModel('${modelId}')">Edit</button>
                    <button class="model-btn ${isDisabled ? 'enable-btn' : 'disable-btn'}" 
                            onclick="modelManager.toggleModel('${modelId}')">
                        ${isDisabled ? 'Enable' : 'Disable'}
                    </button>
                </div>
            </div>
            
            <div class="model-details">
                <div class="model-property">
                    <label>Description</label>
                    <div style="color: #ccc; font-size: 14px;">${model.description || 'No description'}</div>
                </div>
            </div>
            
            <div class="model-characteristics">
                <div class="characteristic-item">
                    <div class="characteristic-label">Drag Coefficient</div>
                    <div class="characteristic-value">${model.dragCoefficient.toFixed(2)}</div>
                </div>
                <div class="characteristic-item">
                    <div class="characteristic-label">Lift Coefficient</div>
                    <div class="characteristic-value">${model.liftCoefficient.toFixed(2)}</div>
                </div>
                <div class="characteristic-item">
                    <div class="characteristic-label">Frontal Area</div>
                    <div class="characteristic-value">${model.frontalArea.toFixed(1)} m²</div>
                </div>
                <div class="characteristic-item">
                    <div class="characteristic-label">Weight</div>
                    <div class="characteristic-value">${model.weight || 1500} kg</div>
                </div>
            </div>
        `;

        return item;
    }

    editModel(modelId) {
        const model = this.models[modelId];
        if (!model) return;

        this.showModelEditor(modelId, model);
    }

    showModelEditor(modelId, model) {
        // Create modal if it doesn't exist
        let modal = document.getElementById('modelEditorModal');
        if (!modal) {
            modal = this.createModelEditorModal();
            document.body.appendChild(modal);
        }

        // Populate modal with model data
        this.populateModelEditor(modelId, model);
        
        // Show modal
        modal.classList.add('active');
    }

    createModelEditorModal() {
        const modal = document.createElement('div');
        modal.id = 'modelEditorModal';
        modal.className = 'model-editor-modal';
        
        modal.innerHTML = `
            <div class="model-editor-content">
                <div class="model-editor-header">
                    <h3>Edit Car Model</h3>
                    <p>Modify the characteristics and properties of this car model</p>
                </div>
                
                <div class="model-details">
                    <div class="model-property">
                        <label>Model Name</label>
                        <input type="text" id="editModelName" placeholder="Enter model name">
                    </div>
                    
                    <div class="model-property">
                        <label>Description</label>
                        <textarea id="editModelDescription" placeholder="Enter model description"></textarea>
                    </div>
                    
                    <div class="model-property">
                        <label>Drag Coefficient (Cd)</label>
                        <input type="number" id="editDragCoeff" step="0.01" min="0" max="2">
                    </div>
                    
                    <div class="model-property">
                        <label>Lift Coefficient (Cl)</label>
                        <input type="number" id="editLiftCoeff" step="0.01" min="-2" max="2">
                    </div>
                    
                    <div class="model-property">
                        <label>Frontal Area (m²)</label>
                        <input type="number" id="editFrontalArea" step="0.1" min="0.5" max="10">
                    </div>
                    
                    <div class="model-property">
                        <label>Weight (kg)</label>
                        <input type="number" id="editWeight" step="10" min="500" max="5000">
                    </div>
                </div>
                
                <div class="model-editor-actions">
                    <button class="setup-btn save-btn" onclick="modelManager.saveModelChanges()">Save Changes</button>
                    <button class="setup-btn" onclick="modelManager.resetModelToDefault()">Reset to Default</button>
                    <button class="setup-btn back-btn" onclick="modelManager.closeModelEditor()">Cancel</button>
                </div>
            </div>
        `;

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModelEditor();
            }
        });

        return modal;
    }

    populateModelEditor(modelId, model) {
        this.currentEditingModelId = modelId;
        
        document.getElementById('editModelName').value = model.name;
        document.getElementById('editModelDescription').value = model.description || '';
        document.getElementById('editDragCoeff').value = model.dragCoefficient;
        document.getElementById('editLiftCoeff').value = model.liftCoefficient;
        document.getElementById('editFrontalArea').value = model.frontalArea;
        document.getElementById('editWeight').value = model.weight || 1500;
    }

    saveModelChanges() {
        if (!this.currentEditingModelId) return;

        const modelId = this.currentEditingModelId;
        const model = this.models[modelId];

        // Get values from form
        model.name = document.getElementById('editModelName').value;
        model.description = document.getElementById('editModelDescription').value;
        model.dragCoefficient = parseFloat(document.getElementById('editDragCoeff').value);
        model.liftCoefficient = parseFloat(document.getElementById('editLiftCoeff').value);
        model.frontalArea = parseFloat(document.getElementById('editFrontalArea').value);
        model.weight = parseInt(document.getElementById('editWeight').value);

        // Update the car model system
        if (window.carManager && window.carManager.carTypes) {
            window.carManager.carTypes[modelId] = { ...model };
        }

        // Save to localStorage
        this.saveModelsToStorage();
        
        // Update UI
        this.renderModelList();
        this.closeModelEditor();
        
        // Show success message
        this.showNotification('Model updated successfully!', 'success');
    }

    resetModelToDefault() {
        if (!this.currentEditingModelId) return;
        
        // Reset to original values (you would store originals separately)
        const defaults = this.getDefaultModelData(this.currentEditingModelId);
        this.populateModelEditor(this.currentEditingModelId, defaults);
    }

    getDefaultModelData(modelId) {
        // Default model characteristics
        const defaults = {
            f1: {
                name: "F1 Race Car",
                description: "Formula 1 racing car with maximum downforce",
                dragCoefficient: 0.7,
                liftCoefficient: -2.5,
                frontalArea: 1.8,
                weight: 740
            },
            sedan: {
                name: "Sedan",
                description: "Standard passenger car with good aerodynamics",
                dragCoefficient: 0.3,
                liftCoefficient: 0.1,
                frontalArea: 2.2,
                weight: 1500
            },
            sports: {
                name: "Sports Car",
                description: "Low-profile car with aggressive aerodynamics",
                dragCoefficient: 0.35,
                liftCoefficient: -0.2,
                frontalArea: 2.0,
                weight: 1300
            },
            suv: {
                name: "SUV",
                description: "Tall vehicle with higher drag coefficient",
                dragCoefficient: 0.45,
                liftCoefficient: 0.2,
                frontalArea: 2.8,
                weight: 2200
            },
            truck: {
                name: "Truck",
                description: "Large vehicle with poor aerodynamics",
                dragCoefficient: 0.8,
                liftCoefficient: 0.1,
                frontalArea: 3.5,
                weight: 3500
            }
        };
        
        return defaults[modelId] || {};
    }

    closeModelEditor() {
        const modal = document.getElementById('modelEditorModal');
        if (modal) {
            modal.classList.remove('active');
        }
        this.currentEditingModelId = null;
    }

    toggleModel(modelId) {
        if (this.disabledModels.has(modelId)) {
            this.disabledModels.delete(modelId);
        } else {
            this.disabledModels.add(modelId);
        }
        
        this.saveSettings();
        this.renderModelList();
        this.updateCarTypeSelect();
    }

    updateCarTypeSelect() {
        // Update the car type dropdown to hide/show disabled models
        const carTypeSelect = document.getElementById('carType');
        if (!carTypeSelect) return;

        Array.from(carTypeSelect.options).forEach(option => {
            const modelId = option.value;
            if (this.disabledModels.has(modelId)) {
                option.style.display = 'none';
                option.disabled = true;
            } else {
                option.style.display = '';
                option.disabled = false;
            }
        });
    }

    addNewModel() {
        // For now, show a message that this feature is coming soon
        this.showNotification('Add New Model feature coming soon!', 'info');
    }

    resetAllModels() {
        if (confirm('Are you sure you want to reset all models to their default values? This cannot be undone.')) {
            // Reset all models to defaults
            Object.keys(this.models).forEach(modelId => {
                const defaults = this.getDefaultModelData(modelId);
                this.models[modelId] = { ...this.models[modelId], ...defaults };
            });
            
            // Clear disabled models
            this.disabledModels.clear();
            
            // Update car model system
            if (window.carManager && window.carManager.carTypes) {
                Object.keys(this.models).forEach(modelId => {
                    window.carManager.carTypes[modelId] = { ...this.models[modelId] };
                });
            }
            
            this.saveModelsToStorage();
            this.saveSettings();
            this.renderModelList();
            this.updateCarTypeSelect();
            
            this.showNotification('All models reset to defaults!', 'success');
        }
    }

    saveSetting(settingName, value) {
        const settings = this.getSettings();
        settings[settingName] = value;
        localStorage.setItem('windTunnelSettings', JSON.stringify(settings));
    }

    getSettings() {
        try {
            return JSON.parse(localStorage.getItem('windTunnelSettings')) || {};
        } catch {
            return {};
        }
    }

    loadSettings() {
        const settings = this.getSettings();
        
        // Load disabled models
        if (settings.disabledModels) {
            this.disabledModels = new Set(settings.disabledModels);
        }
        
        // Load checkbox settings
        const checkboxes = ['enableParticles', 'enableSounds', 'autoSave', 'performanceMode'];
        checkboxes.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox && settings[id] !== undefined) {
                checkbox.checked = settings[id];
            }
        });
        
        // Load custom models
        if (settings.customModels) {
            Object.assign(this.models, settings.customModels);
        }
    }

    saveSettings() {
        const settings = this.getSettings();
        settings.disabledModels = Array.from(this.disabledModels);
        
        // Save checkbox settings
        const checkboxes = ['enableParticles', 'enableSounds', 'autoSave', 'performanceMode'];
        checkboxes.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                settings[id] = checkbox.checked;
            }
        });
        
        localStorage.setItem('windTunnelSettings', JSON.stringify(settings));
    }

    saveModelsToStorage() {
        const settings = this.getSettings();
        settings.customModels = this.models;
        localStorage.setItem('windTunnelSettings', JSON.stringify(settings));
    }

    exportSettings() {
        const settings = this.getSettings();
        settings.models = this.models;
        settings.disabledModels = Array.from(this.disabledModels);
        
        const dataStr = JSON.stringify(settings, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'wind-tunnel-settings.json';
        link.click();
        
        this.showNotification('Settings exported successfully!', 'success');
    }

    importSettings() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const settings = JSON.parse(e.target.result);
                    
                    // Import models
                    if (settings.models) {
                        this.models = settings.models;
                    }
                    
                    // Import disabled models
                    if (settings.disabledModels) {
                        this.disabledModels = new Set(settings.disabledModels);
                    }
                    
                    // Save and update
                    this.saveModelsToStorage();
                    this.saveSettings();
                    this.loadSettings();
                    this.renderModelList();
                    this.updateCarTypeSelect();
                    
                    this.showNotification('Settings imported successfully!', 'success');
                } catch (error) {
                    this.showNotification('Error importing settings file', 'error');
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }

    clearAllData() {
        if (confirm('Are you sure you want to clear all saved data? This will reset everything to defaults and cannot be undone.')) {
            localStorage.removeItem('windTunnelSettings');
            localStorage.removeItem('windTunnelCarSettings');
            
            // Reset everything
            this.disabledModels.clear();
            this.loadModelsFromCarModel();
            this.loadSettings();
            this.renderModelList();
            this.updateCarTypeSelect();
            
            this.showNotification('All data cleared successfully!', 'success');
        }
    }

    showNotification(message, type = 'info') {
        // Use existing notification system if available
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            alert(message);
        }
    }

    onPageShow() {
        // Called when settings page is shown
        this.renderModelList();
        this.updateCarTypeSelect();
    }
}

// Initialize model manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.modelManager = new ModelManager();
}); 