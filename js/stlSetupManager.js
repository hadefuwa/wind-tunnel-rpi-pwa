// STL Setup Manager
// Handles the setup page controls and connects them to the main app

class STLSetupManager {
    constructor() {
        this.setupControls = {};
        this.previewScene = null;
        this.previewRenderer = null;
        this.previewCamera = null;
        this.previewModel = null;
        this.init();
    }

    init() {
        // Get all setup page controls
        this.setupControls = {
            // File input
            fileInput: document.getElementById('stlFileInputSetup'),
            uploadStatus: document.getElementById('uploadStatusSetup'),
            
            // Rotation controls
            rotationX: document.getElementById('rotationXSetup'),
            rotationY: document.getElementById('rotationYSetup'),
            rotationZ: document.getElementById('rotationZSetup'),
            rotationXValue: document.getElementById('rotationXValueSetup'),
            rotationYValue: document.getElementById('rotationYValueSetup'),
            rotationZValue: document.getElementById('rotationZValueSetup'),
            resetRotation: document.getElementById('resetRotationSetup'),
            saveRotation: document.getElementById('saveRotationSetup'),
            
            // Position controls
            positionX: document.getElementById('positionXSetup'),
            positionY: document.getElementById('positionYSetup'),
            positionZ: document.getElementById('positionZSetup'),
            positionXValue: document.getElementById('positionXValueSetup'),
            positionYValue: document.getElementById('positionYValueSetup'),
            positionZValue: document.getElementById('positionZValueSetup'),
            resetPosition: document.getElementById('resetPositionSetup'),
            savePosition: document.getElementById('savePositionSetup'),
            
            // Action buttons
            applySettings: document.getElementById('applySettingsBtn'),
            backToMain: document.getElementById('backToMainBtn')
        };

        // Add event listeners
        this.addEventListeners();
        
        // Initialize preview canvas
        this.initPreview();
    }

    addEventListeners() {
        // File input
        if (this.setupControls.fileInput) {
            this.setupControls.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        }

        // Rotation controls
        if (this.setupControls.rotationX) {
            this.setupControls.rotationX.addEventListener('input', (e) => this.updateRotationValue('X', e.target.value));
        }
        if (this.setupControls.rotationY) {
            this.setupControls.rotationY.addEventListener('input', (e) => this.updateRotationValue('Y', e.target.value));
        }
        if (this.setupControls.rotationZ) {
            this.setupControls.rotationZ.addEventListener('input', (e) => this.updateRotationValue('Z', e.target.value));
        }

        // Position controls
        if (this.setupControls.positionX) {
            this.setupControls.positionX.addEventListener('input', (e) => this.updatePositionValue('X', e.target.value));
        }
        if (this.setupControls.positionY) {
            this.setupControls.positionY.addEventListener('input', (e) => this.updatePositionValue('Y', e.target.value));
        }
        if (this.setupControls.positionZ) {
            this.setupControls.positionZ.addEventListener('input', (e) => this.updatePositionValue('Z', e.target.value));
        }

        // Buttons
        if (this.setupControls.resetRotation) {
            this.setupControls.resetRotation.addEventListener('click', () => this.resetRotation());
        }
        if (this.setupControls.saveRotation) {
            this.setupControls.saveRotation.addEventListener('click', () => this.saveRotation());
        }
        if (this.setupControls.resetPosition) {
            this.setupControls.resetPosition.addEventListener('click', () => this.resetPosition());
        }
        if (this.setupControls.savePosition) {
            this.setupControls.savePosition.addEventListener('click', () => this.savePosition());
        }
        if (this.setupControls.applySettings) {
            this.setupControls.applySettings.addEventListener('click', () => this.applySettingsToMainApp());
        }
    }

    initPreview() {
        const canvas = document.getElementById('previewCanvas');
        if (!canvas) return;

        // Create Three.js scene for preview
        this.previewScene = new THREE.Scene();
        this.previewCamera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
        this.previewRenderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
        this.previewRenderer.setSize(canvas.width, canvas.height);
        this.previewRenderer.setClearColor(0x000000);

        // Add lights
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.previewScene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        this.previewScene.add(directionalLight);

        // Set camera position
        this.previewCamera.position.set(0, 0, 5);
        this.previewCamera.lookAt(0, 0, 0);

        // Start render loop
        this.renderPreview();
    }

    renderPreview() {
        if (this.previewRenderer && this.previewScene && this.previewCamera) {
            this.previewRenderer.render(this.previewScene, this.previewCamera);
        }
        requestAnimationFrame(() => this.renderPreview());
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        this.setupControls.uploadStatus.textContent = 'Loading...';
        this.setupControls.uploadStatus.style.color = '#FFA500';

        // Use the existing STL loader
        if (window.STLLoader) {
            const loader = new STLLoader();
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const geometry = loader.parse(e.target.result);
                    this.loadPreviewModel(geometry);
                    this.setupControls.uploadStatus.textContent = 'File loaded successfully!';
                    this.setupControls.uploadStatus.style.color = '#4CAF50';
                } catch (error) {
                    this.setupControls.uploadStatus.textContent = 'Error loading file';
                    this.setupControls.uploadStatus.style.color = '#f44336';
                }
            };
            
            reader.readAsArrayBuffer(file);
        }
    }

    loadPreviewModel(geometry) {
        // Remove existing model
        if (this.previewModel) {
            this.previewScene.remove(this.previewModel);
        }

        // Create new model
        const material = new THREE.MeshLambertMaterial({ color: 0x2196F3 });
        this.previewModel = new THREE.Mesh(geometry, material);
        
        // Center and scale the model
        geometry.computeBoundingBox();
        const box = geometry.boundingBox;
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        // Center the geometry
        geometry.translate(-center.x, -center.y, -center.z);
        
        // Scale to fit in preview
        const maxSize = Math.max(size.x, size.y, size.z);
        const scale = 2 / maxSize;
        this.previewModel.scale.set(scale, scale, scale);
        
        this.previewScene.add(this.previewModel);
        this.updatePreviewTransform();
    }

    updateRotationValue(axis, value) {
        const valueElement = this.setupControls[`rotation${axis}Value`];
        if (valueElement) {
            valueElement.textContent = value + '°';
        }
        this.updatePreviewTransform();
    }

    updatePositionValue(axis, value) {
        const valueElement = this.setupControls[`position${axis}Value`];
        if (valueElement) {
            valueElement.textContent = parseFloat(value).toFixed(1);
        }
        this.updatePreviewTransform();
    }

    updatePreviewTransform() {
        if (!this.previewModel) return;

        // Get current values
        const rotX = parseFloat(this.setupControls.rotationX.value) * Math.PI / 180;
        const rotY = parseFloat(this.setupControls.rotationY.value) * Math.PI / 180;
        const rotZ = parseFloat(this.setupControls.rotationZ.value) * Math.PI / 180;
        
        const posX = parseFloat(this.setupControls.positionX.value) * 0.5;
        const posY = parseFloat(this.setupControls.positionY.value) * 0.5;
        const posZ = parseFloat(this.setupControls.positionZ.value) * 0.5;

        // Apply transforms
        this.previewModel.rotation.set(rotX, rotY, rotZ);
        this.previewModel.position.set(posX, posY, posZ);
    }

    resetRotation() {
        this.setupControls.rotationX.value = 0;
        this.setupControls.rotationY.value = 0;
        this.setupControls.rotationZ.value = 0;
        this.updateRotationValue('X', 0);
        this.updateRotationValue('Y', 0);
        this.updateRotationValue('Z', 0);
    }

    saveRotation() {
        const currentCarType = window.carManager ? window.carManager.getCurrentCarType() : 'f1';
        const rotationData = {
            x: parseFloat(this.setupControls.rotationX.value),
            y: parseFloat(this.setupControls.rotationY.value),
            z: parseFloat(this.setupControls.rotationZ.value)
        };
        
        if (window.carSettings) {
            window.carSettings.setRotation(currentCarType, rotationData);
        }
        
        // Show feedback
        this.setupControls.saveRotation.textContent = 'Saved!';
        setTimeout(() => {
            this.setupControls.saveRotation.textContent = 'Save Rotation';
        }, 1000);
    }

    resetPosition() {
        this.setupControls.positionX.value = 0;
        this.setupControls.positionY.value = -1.5;
        this.setupControls.positionZ.value = 0;
        this.updatePositionValue('X', 0);
        this.updatePositionValue('Y', -1.5);
        this.updatePositionValue('Z', 0);
    }

    savePosition() {
        const currentCarType = window.carManager ? window.carManager.getCurrentCarType() : 'f1';
        const positionData = {
            x: parseFloat(this.setupControls.positionX.value),
            y: parseFloat(this.setupControls.positionY.value),
            z: parseFloat(this.setupControls.positionZ.value)
        };
        
        if (window.carSettings) {
            window.carSettings.setPosition(currentCarType, positionData);
        }
        
        // Show feedback
        this.setupControls.savePosition.textContent = 'Saved!';
        setTimeout(() => {
            this.setupControls.savePosition.textContent = 'Save Position';
        }, 1000);
    }

    applySettingsToMainApp() {
        // Apply current settings to the main app
        if (window.carManager) {
            const rotationData = {
                x: parseFloat(this.setupControls.rotationX.value),
                y: parseFloat(this.setupControls.rotationY.value),
                z: parseFloat(this.setupControls.rotationZ.value)
            };
            
            const positionData = {
                x: parseFloat(this.setupControls.positionX.value),
                y: parseFloat(this.setupControls.positionY.value),
                z: parseFloat(this.setupControls.positionZ.value)
            };
            
            window.carManager.applyRotation(rotationData);
            window.carManager.applyPosition(positionData);
        }
        
        // Show feedback
        this.setupControls.applySettings.textContent = 'Applied!';
        setTimeout(() => {
            this.setupControls.applySettings.textContent = 'Apply to Wind Tunnel';
        }, 1000);
        
        // Go back to main page
        setTimeout(() => {
            if (window.menuSystem) {
                window.menuSystem.showPage('main');
            }
        }, 1500);
    }

    loadCurrentSettings() {
        // Load settings from the main app
        const currentCarType = window.carManager ? window.carManager.getCurrentCarType() : 'f1';
        
        if (window.carSettings) {
            const rotation = window.carSettings.getRotation(currentCarType);
            const position = window.carSettings.getPosition(currentCarType);
            
            // Set rotation values
            this.setupControls.rotationX.value = rotation.x;
            this.setupControls.rotationY.value = rotation.y;
            this.setupControls.rotationZ.value = rotation.z;
            this.updateRotationValue('X', rotation.x);
            this.updateRotationValue('Y', rotation.y);
            this.updateRotationValue('Z', rotation.z);
            
            // Set position values
            this.setupControls.positionX.value = position.x;
            this.setupControls.positionY.value = position.y;
            this.setupControls.positionZ.value = position.z;
            this.updatePositionValue('X', position.x);
            this.updatePositionValue('Y', position.y);
            this.updatePositionValue('Z', position.z);
        }
    }

    onPageShow() {
        // Called when the STL setup page is shown
        this.loadCurrentSettings();
        this.updatePreviewTransform();
    }
}

// Initialize STL setup manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.stlSetupManager = new STLSetupManager();
}); 