# Wind Tunnel PWA - Changelog

All notable changes to this project will be documented in this file.

## [v1.2.0] - 2025-01-08

### ✨ New Features
- **Interactive STL Positioning System**: Complete drag-and-drop positioning for STL car models
- **Edit Position Button**: Added dedicated button on main screen for entering edit mode
- **Visual Direction Indicators**: Blue arrows show allowed movement directions during edit mode
- **Grid Snapping**: Car positions snap to 0.5 unit grid for precise placement
- **View-Specific Movement**: Simplified single-axis movement per camera view
  - Front view: Left-right movement only
  - Side view: Up-down movement only  
  - Top view: Left-right movement only

### 🔧 Improvements
- **Floor Constraint Protection**: Cars can no longer go below the floor surface
- **Improved STL Ground Positioning**: STL models now sit perfectly flat on the ground
- **Enhanced Test Section**: Clean 12×6×4 dimensions with solid gray floor
- **Better Visual Feedback**: Clear indicators during edit mode with proper color coding
- **Optimized Performance**: Improved memory management and resource cleanup

### 🎨 Visual Updates
- **Blue Direction Arrows**: Changed from green to blue to avoid conflict with wind indicators
- **Solid Floor**: Replaced transparent walls with solid gray floor for better reference
- **Removed Confusing Elements**: Eliminated yellow wireframe box and green alignment lines

### 🐛 Bug Fixes
- Fixed car positioning going under the floor
- Resolved STL model floating above ground surface
- Fixed direction arrow visibility conflicts
- Improved bounds checking for car movement
- Enhanced position saving and loading

### 🔄 Technical Changes
- Enhanced `CarModel.setPosition()` with floor constraint enforcement
- Updated `WindTunnel.getTestSectionBounds()` with proper Y-axis limits
- Improved drag system with better raycasting and mouse handling
- Added comprehensive position validation throughout the system

---

## [v1.1.0] - 2025-01-07

### ✨ New Features
- **STL Model Support**: Full support for loading and displaying STL car models
- **F1 Car Model**: Included high-quality F1 car STL file
- **Multiple Car Types**: Support for sedan, sports car, SUV, and truck models
- **Aerodynamic Calculations**: Real-time drag, lift, and pressure calculations
- **Wind Particle System**: Visual wind flow effects with particle animation

### 🔧 Improvements
- **3D Visualization**: Enhanced Three.js integration with proper lighting
- **Camera Controls**: Multiple camera views (front, side, top)
- **Settings Persistence**: Car positions and rotations saved locally
- **Responsive Design**: Optimized for various screen sizes

---

## [v1.0.0] - 2025-01-06

### ✨ Initial Release
- **Progressive Web App**: Full PWA functionality with offline support
- **Wind Tunnel Simulation**: Basic wind tunnel environment
- **3D Graphics**: Three.js-based 3D rendering system
- **Basic Car Models**: Simple geometric car shapes
- **Control Interface**: Wind speed and car angle controls
- **Data Export**: Basic aerodynamic data export functionality

---

## 🚀 Upcoming Features
- **Custom STL Upload**: Allow users to upload their own car models
- **Advanced Aerodynamics**: More sophisticated fluid dynamics calculations
- **Pressure Visualization**: Color-coded pressure maps on car surfaces
- **Performance Metrics**: Detailed performance analysis and comparisons
- **Export Improvements**: Enhanced data export with charts and graphs

---

## 📋 Version Numbering
- **Major.Minor.Patch** (e.g., 1.2.0)
- **Major**: Breaking changes or significant new features
- **Minor**: New features, improvements, and enhancements
- **Patch**: Bug fixes and small improvements

---

## 🔗 Links
- **Repository**: https://github.com/hadefuwa/wind-tunnel-rpi-pwa
- **Issues**: https://github.com/hadefuwa/wind-tunnel-rpi-pwa/issues
- **Releases**: https://github.com/hadefuwa/wind-tunnel-rpi-pwa/releases 