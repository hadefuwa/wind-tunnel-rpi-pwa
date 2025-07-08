/**
 * STL Loader for Three.js
 * Simple and beginner-friendly STL file loader
 * Based on Three.js STLLoader example
 */

class STLLoader {
    constructor() {
        console.log('STL Loader initialized');
    }

    // Load STL file from URL
    load(url, onLoad, onProgress, onError) {
        console.log('Loading STL file:', url);
        
        const loader = new THREE.FileLoader();
        loader.setResponseType('arraybuffer');
        
        loader.load(url, (buffer) => {
            try {
                const geometry = this.parse(buffer);
                if (onLoad) onLoad(geometry);
            } catch (error) {
                console.error('Error parsing STL file:', error);
                if (onError) onError(error);
            }
        }, onProgress, onError);
    }

    // Parse STL file buffer
    parse(buffer) {
        console.log('Parsing STL buffer...');
        
        // Check if it's binary or ASCII
        const isBinary = this.isBinary(buffer);
        
        if (isBinary) {
            console.log('Detected binary STL file');
            return this.parseBinary(buffer);
        } else {
            console.log('Detected ASCII STL file');
            return this.parseASCII(buffer);
        }
    }

    // Check if STL file is binary or ASCII
    isBinary(buffer) {
        const view = new DataView(buffer);
        const numTriangles = view.getUint32(80, true);
        const expectedSize = 80 + 4 + (numTriangles * 50);
        
        return buffer.byteLength === expectedSize;
    }

    // Parse binary STL file
    parseBinary(buffer) {
        console.log('Parsing binary STL...');
        
        const view = new DataView(buffer);
        const numTriangles = view.getUint32(80, true);
        
        console.log('Number of triangles:', numTriangles);
        
        const vertices = [];
        const normals = [];
        
        let offset = 84; // Skip header (80 bytes) + triangle count (4 bytes)
        
        for (let i = 0; i < numTriangles; i++) {
            // Read normal vector (3 floats)
            const nx = view.getFloat32(offset, true);
            const ny = view.getFloat32(offset + 4, true);
            const nz = view.getFloat32(offset + 8, true);
            offset += 12;
            
            // Read 3 vertices (3 floats each)
            for (let j = 0; j < 3; j++) {
                const x = view.getFloat32(offset, true);
                const y = view.getFloat32(offset + 4, true);
                const z = view.getFloat32(offset + 8, true);
                offset += 12;
                
                vertices.push(x, y, z);
                normals.push(nx, ny, nz);
            }
            
            // Skip attribute byte count (2 bytes)
            offset += 2;
        }
        
        return this.createGeometry(vertices, normals);
    }

    // Parse ASCII STL file
    parseASCII(buffer) {
        console.log('Parsing ASCII STL...');
        
        const text = new TextDecoder().decode(buffer);
        const lines = text.split('\n');
        
        const vertices = [];
        const normals = [];
        
        let currentNormal = null;
        let vertexCount = 0;
        
        for (let line of lines) {
            line = line.trim();
            
            if (line.startsWith('facet normal')) {
                // Parse normal vector
                const parts = line.split(/\s+/);
                currentNormal = [
                    parseFloat(parts[2]),
                    parseFloat(parts[3]),
                    parseFloat(parts[4])
                ];
            } else if (line.startsWith('vertex')) {
                // Parse vertex
                const parts = line.split(/\s+/);
                const x = parseFloat(parts[1]);
                const y = parseFloat(parts[2]);
                const z = parseFloat(parts[3]);
                
                vertices.push(x, y, z);
                
                if (currentNormal) {
                    normals.push(currentNormal[0], currentNormal[1], currentNormal[2]);
                }
                
                vertexCount++;
            }
        }
        
        console.log('Parsed vertices:', vertexCount);
        
        return this.createGeometry(vertices, normals);
    }

    // Create Three.js geometry from vertices and normals
    createGeometry(vertices, normals) {
        console.log('Creating Three.js geometry...');
        
        const geometry = new THREE.BufferGeometry();
        
        // Set vertices
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        
        // Set normals
        if (normals.length > 0) {
            geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        } else {
            // Calculate normals if not provided
            geometry.computeVertexNormals();
        }
        
        console.log('Geometry created successfully');
        return geometry;
    }

    // Load STL file from File object (for file uploads)
    loadFromFile(file, onLoad, onError) {
        console.log('Loading STL from file:', file.name);
        
        const reader = new FileReader();
        
        reader.onload = (event) => {
            try {
                const buffer = event.target.result;
                const geometry = this.parse(buffer);
                if (onLoad) onLoad(geometry);
            } catch (error) {
                console.error('Error parsing uploaded STL file:', error);
                if (onError) onError(error);
            }
        };
        
        reader.onerror = (error) => {
            console.error('Error reading file:', error);
            if (onError) onError(error);
        };
        
        reader.readAsArrayBuffer(file);
    }
}

// Make it globally available
window.STLLoader = STLLoader; 