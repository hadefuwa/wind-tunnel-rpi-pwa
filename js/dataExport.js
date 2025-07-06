// ===== DATA EXPORT SYSTEM =====
// Handles saving and exporting wind tunnel test results
// Simple and beginner-friendly code for Raspberry Pi

class DataExportSystem {
    constructor() {
        console.log('Creating Data Export System...');
        
        // Storage for test results
        this.testHistory = [];
        this.maxHistorySize = 100; // Keep last 100 tests
        this.currentTestId = 1;
        
        // Test session info
        this.sessionStartTime = new Date();
        this.sessionName = 'Wind Tunnel Session';
        
        console.log('Data Export System initialized');
    }
    
    // Record a new test result
    recordTest(windSpeed, carAngle, carType, forces) {
        const testResult = {
            id: this.currentTestId++,
            timestamp: new Date().toISOString(),
            sessionTime: Date.now() - this.sessionStartTime.getTime(),
            windSpeed: windSpeed,
            carAngle: carAngle,
            carType: carType,
            dragForce: forces.drag,
            liftForce: forces.lift,
            pressure: forces.pressure,
            notes: ''
        };
        
        // Add to history
        this.testHistory.push(testResult);
        
        // Keep only the most recent tests
        if (this.testHistory.length > this.maxHistorySize) {
            this.testHistory.shift(); // Remove oldest test
        }
        
        console.log('Test recorded:', testResult.id);
        
        // Update UI if available
        this.updateTestHistoryUI();
        
        return testResult;
    }
    
    // Export all test results as CSV
    exportToCSV() {
        if (this.testHistory.length === 0) {
            alert('No test data to export!');
            return;
        }
        
        console.log('Exporting', this.testHistory.length, 'test results to CSV...');
        
        // Create CSV header
        const csvHeader = [
            'Test ID',
            'Timestamp',
            'Session Time (ms)',
            'Wind Speed (MPH)', 
            'Car Angle (degrees)',
            'Car Type',
            'Drag Force (N)',
            'Lift Force (N)',
            'Pressure (kPa)',
            'Notes'
        ].join(',');
        
        // Create CSV rows
        const csvRows = this.testHistory.map(test => [
            test.id,
            test.timestamp,
            test.sessionTime,
            test.windSpeed,
            test.carAngle,
            test.carType,
            test.dragForce.toFixed(3),
            test.liftForce.toFixed(3),
            test.pressure.toFixed(3),
            test.notes
        ].join(','));
        
        // Combine header and rows
        const csvContent = [csvHeader, ...csvRows].join('\n');
        
        // Create and download file
        this.downloadFile(csvContent, 'wind_tunnel_results.csv', 'text/csv');
        
        console.log('CSV export complete!');
    }
    
    // Export test results as JSON (for advanced users)
    exportToJSON() {
        if (this.testHistory.length === 0) {
            alert('No test data to export!');
            return;
        }
        
        console.log('Exporting test results to JSON...');
        
        const exportData = {
            sessionInfo: {
                name: this.sessionName,
                startTime: this.sessionStartTime.toISOString(),
                duration: Date.now() - this.sessionStartTime.getTime(),
                totalTests: this.testHistory.length
            },
            tests: this.testHistory
        };
        
        const jsonContent = JSON.stringify(exportData, null, 2);
        
        // Create and download file
        this.downloadFile(jsonContent, 'wind_tunnel_results.json', 'application/json');
        
        console.log('JSON export complete!');
    }
    
    // Download file helper function
    downloadFile(content, filename, mimeType) {
        // Create a blob with the content
        const blob = new Blob([content], { type: mimeType });
        
        // Create download link
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = filename;
        
        // Add to page, click, and remove
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        // Clean up the URL
        URL.revokeObjectURL(downloadLink.href);
        
        console.log('File downloaded:', filename);
    }
    
    // Clear all test history
    clearHistory() {
        const confirmed = confirm('Are you sure you want to clear all test history? This cannot be undone.');
        
        if (confirmed) {
            this.testHistory = [];
            this.currentTestId = 1;
            this.sessionStartTime = new Date();
            
            console.log('Test history cleared');
            this.updateTestHistoryUI();
            
            alert('Test history cleared successfully!');
        }
    }
    
    // Get test statistics
    getTestStatistics() {
        if (this.testHistory.length === 0) {
            return null;
        }
        
        const dragValues = this.testHistory.map(test => test.dragForce);
        const liftValues = this.testHistory.map(test => test.liftForce);
        const windSpeeds = this.testHistory.map(test => test.windSpeed);
        
        return {
            totalTests: this.testHistory.length,
            averageDrag: dragValues.reduce((a, b) => a + b, 0) / dragValues.length,
            maxDrag: Math.max(...dragValues),
            minDrag: Math.min(...dragValues),
            averageLift: liftValues.reduce((a, b) => a + b, 0) / liftValues.length,
            maxLift: Math.max(...liftValues),
            minLift: Math.min(...liftValues),
            averageWindSpeed: windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length,
            maxWindSpeed: Math.max(...windSpeeds),
            minWindSpeed: Math.min(...windSpeeds),
            sessionDuration: Date.now() - this.sessionStartTime.getTime()
        };
    }
    
    // Update the test history UI
    updateTestHistoryUI() {
        const historyContainer = document.getElementById('testHistory');
        const statsContainer = document.getElementById('testStats');
        
        if (historyContainer) {
            // Show last 5 tests
            const recentTests = this.testHistory.slice(-5).reverse();
            
            historyContainer.innerHTML = recentTests.map(test => `
                <div class="test-item">
                    <span class="test-id">#${test.id}</span>
                    <span class="test-details">${test.carType} @ ${test.windSpeed}MPH, ${test.carAngle}°</span>
                    <span class="test-forces">D:${test.dragForce.toFixed(1)}N L:${test.liftForce.toFixed(1)}N</span>
                </div>
            `).join('');
        }
        
        if (statsContainer) {
            const stats = this.getTestStatistics();
            if (stats) {
                statsContainer.innerHTML = `
                    <div class="stat-item">Tests: ${stats.totalTests}</div>
                    <div class="stat-item">Avg Drag: ${stats.averageDrag.toFixed(1)}N</div>
                    <div class="stat-item">Avg Lift: ${stats.averageLift.toFixed(1)}N</div>
                    <div class="stat-item">Session: ${Math.floor(stats.sessionDuration / 60000)}min</div>
                `;
            }
        }
    }
    
    // Import test data from JSON file
    importFromJSON(jsonContent) {
        try {
            const importData = JSON.parse(jsonContent);
            
            if (importData.tests && Array.isArray(importData.tests)) {
                // Add imported tests to history
                this.testHistory = [...this.testHistory, ...importData.tests];
                
                // Update test IDs
                this.currentTestId = Math.max(...this.testHistory.map(t => t.id)) + 1;
                
                // Keep within max size
                if (this.testHistory.length > this.maxHistorySize) {
                    this.testHistory = this.testHistory.slice(-this.maxHistorySize);
                }
                
                this.updateTestHistoryUI();
                
                console.log('Imported', importData.tests.length, 'test results');
                alert(`Successfully imported ${importData.tests.length} test results!`);
            } else {
                throw new Error('Invalid JSON format');
            }
        } catch (error) {
            console.error('Import error:', error);
            alert('Error importing data: Invalid file format');
        }
    }
    
    // Add a note to the most recent test
    addNoteToLastTest(note) {
        if (this.testHistory.length > 0) {
            this.testHistory[this.testHistory.length - 1].notes = note;
            console.log('Note added to test #' + this.testHistory[this.testHistory.length - 1].id);
            this.updateTestHistoryUI();
        }
    }
    
    // Get all tests for a specific car type
    getTestsByCarType(carType) {
        return this.testHistory.filter(test => test.carType === carType);
    }
    
    // Get the best performing test (lowest drag)
    getBestTest() {
        if (this.testHistory.length === 0) return null;
        
        return this.testHistory.reduce((best, current) => 
            current.dragForce < best.dragForce ? current : best
        );
    }
    
    // Generate a simple report
    generateReport() {
        const stats = this.getTestStatistics();
        if (!stats) {
            alert('No test data available for report!');
            return;
        }
        
        const report = `
WIND TUNNEL TEST REPORT
Generated: ${new Date().toLocaleDateString()}
Session Duration: ${Math.floor(stats.sessionDuration / 60000)} minutes

SUMMARY:
- Total Tests: ${stats.totalTests}
- Average Wind Speed: ${stats.averageWindSpeed.toFixed(1)} MPH
- Average Drag Force: ${stats.averageDrag.toFixed(2)} N
- Average Lift Force: ${stats.averageLift.toFixed(2)} N

PERFORMANCE RANGE:
- Drag: ${stats.minDrag.toFixed(2)} - ${stats.maxDrag.toFixed(2)} N
- Lift: ${stats.minLift.toFixed(2)} - ${stats.maxLift.toFixed(2)} N
- Wind Speed: ${stats.minWindSpeed} - ${stats.maxWindSpeed} MPH

BEST TEST:
${this.getBestTest() ? `Test #${this.getBestTest().id} - ${this.getBestTest().carType} with ${this.getBestTest().dragForce.toFixed(2)}N drag` : 'No tests available'}
        `.trim();
        
        this.downloadFile(report, 'wind_tunnel_report.txt', 'text/plain');
        
        console.log('Report generated successfully!');
    }
} 