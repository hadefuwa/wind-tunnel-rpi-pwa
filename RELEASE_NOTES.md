# Wind Tunnel PWA - Release v1.2.0

**Release Date**: January 8, 2025  
**Version**: 1.2.0  
**Codename**: "Interactive Positioning"

## 🎯 What's New

This release introduces a complete **interactive positioning system** for STL car models, making it easy to precisely position your cars in the wind tunnel with visual feedback and intuitive controls.

## ✨ Major Features

### 🖱️ Interactive STL Positioning
- **Drag-and-Drop System**: Click and drag STL car models directly in the 3D view
- **Edit Mode Button**: Dedicated "Edit Position" button on the main screen
- **Visual Direction Indicators**: Blue arrows show exactly which directions you can move
- **Grid Snapping**: Positions automatically snap to 0.5-unit grid for precision
- **Save/Cancel Controls**: Save your changes or cancel to revert to previous position

### 🎮 Simplified Movement Controls
- **Front View**: Move left-right only (X-axis)
- **Side View**: Move up-down only (Y-axis)  
- **Top View**: Move left-right only (X-axis)
- **Intuitive Design**: Each view focuses on the most natural movement direction

### 🎨 Enhanced Visual Experience
- **Blue Direction Arrows**: Clear visual indicators that don't conflict with wind effects
- **Solid Gray Floor**: Better reference surface for car positioning
- **Clean Test Section**: Optimized 12×6×4 unit dimensions
- **Improved Lighting**: Better visibility during edit mode

## 🔧 Technical Improvements

### 🛡️ Floor Constraint Protection
- Cars can **never go below the floor** surface
- **Double-layer protection** in both positioning and animation systems
- **Automatic correction** when invalid positions are detected
- **Debug logging** for troubleshooting positioning issues

### 🎯 Enhanced STL Handling
- **Perfect Ground Positioning**: STL models sit exactly flat on the floor
- **Improved Scaling**: Better automatic sizing for different STL files
- **Optimized Performance**: Faster loading and rendering
- **Memory Management**: Proper cleanup of 3D resources

## 🐛 Bug Fixes

- ✅ **Fixed**: Cars going under the floor during positioning
- ✅ **Fixed**: STL models floating above the ground surface
- ✅ **Fixed**: Direction arrow color conflicts with wind indicators
- ✅ **Fixed**: Inconsistent bounds checking during movement
- ✅ **Fixed**: Position saving and loading edge cases

## 🔄 Breaking Changes

**None** - This release is fully backward compatible with existing saved positions and settings.

## 📋 How to Use New Features

### Interactive Positioning
1. **Click "Edit Position"** on the main screen
2. **Select a camera view** (Front, Side, or Top)
3. **Click and drag** the car model to move it
4. **Watch the blue arrows** to see allowed movement directions
5. **Click "Save"** to keep changes or **"Cancel"** to revert

### Tips for Best Results
- Use **Front view** for left-right positioning
- Use **Side view** for height adjustments
- Use **Top view** for precise left-right fine-tuning
- Positions **automatically snap** to the grid for precision

## 🚀 Performance

- **Faster rendering** with optimized 3D calculations
- **Reduced memory usage** through better resource management
- **Smoother animations** with improved frame rates
- **Responsive controls** with minimal input lag

## 🔗 Links

- **Repository**: https://github.com/hadefuwa/wind-tunnel-rpi-pwa
- **Live Demo**: Available at your deployed URL
- **Issues**: Report bugs or request features on GitHub
- **Documentation**: See README.md for full setup instructions

## 🙏 Acknowledgments

Special thanks to all users who provided feedback on the positioning system and helped identify the floor constraint issues!

---

**Full Changelog**: [View all changes](CHANGELOG.md)  
**Previous Version**: [v1.1.0](https://github.com/hadefuwa/wind-tunnel-rpi-pwa/releases/tag/v1.1.0) 