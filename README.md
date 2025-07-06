# 🚗💨 Wind Tunnel PWA

A **Progressive Web App** that simulates a 3D wind tunnel with a car model, animated wind particles, and real-time aerodynamic calculations. Designed specifically for **Raspberry Pi 7" touchscreen** (800x480) but works on any modern device.

![Wind Tunnel Preview](assets/screenshots/preview.png)

![image](https://github.com/user-attachments/assets/6f6d39de-dfda-4117-99c6-e04d0e5faeb7)


## ✨ Features

- **3D Wind Tunnel Visualization** - Realistic tunnel environment with animated wind effects
- **Interactive Car Model** - Simple 3D car built from basic shapes 
- **Real-time Physics** - Live aerodynamic calculations (drag, lift, pressure)
- **Touch-Friendly Controls** - Large buttons and sliders optimized for touchscreens
- **Multiple Camera Views** - Front, side, and top views of the wind tunnel
- **Progressive Web App** - Works offline and can be installed like a native app
- **Raspberry Pi Optimized** - Smooth performance on Raspberry Pi 4

## 🎮 Controls

| Control | Description |
|---------|-------------|
| **Wind Speed Slider** | Adjust wind speed from 0-100 MPH |
| **Car Angle Slider** | Rotate car from -20° to +20° |
| **Front View Button** | Camera positioned in front of car |
| **Side View Button** | Camera positioned to the side |
| **Top View Button** | Camera positioned above the tunnel |

## 🚀 Quick Start

### 🪟 Windows Testing

**Method 1: Python (Recommended)**
```bash
# 1. Open Command Prompt or PowerShell as Administrator
# 2. Navigate to the project folder
cd C:\path\to\wind-tunnel-rpi-pwa

# 3. Start Python web server
python -m http.server 8080
# OR if you have Python 3 specifically:
python3 -m http.server 8080

# 4. Open your browser and go to:
# http://localhost:8080
```

**Method 2: Node.js**
```bash
# If you have Node.js installed:
npx http-server -p 8080
```

**Method 3: Live Server (VS Code)**
```bash
# If using VS Code:
# 1. Install "Live Server" extension
# 2. Right-click on index.html
# 3. Select "Open with Live Server"
```

**Method 4: PHP (if available)**
```bash
php -S localhost:8080
```

### 🐧 Linux/macOS Testing

```bash
# Navigate to project folder
cd /path/to/wind-tunnel-rpi-pwa

# Start web server
python3 -m http.server 8080

# Open browser to http://localhost:8080
```

### ⚠️ Important Notes

- **Must use a web server** - Opening `index.html` directly won't work properly
- **Chrome/Edge recommended** - Best WebGL performance
- **Allow WebGL** - Make sure hardware acceleration is enabled
- **Local network access** - Use `http://[your-ip]:8080` to test on other devices

## 🥧 Raspberry Pi Setup

### Requirements

- **Raspberry Pi 4** (recommended) or Pi 3B+
- **7" Touchscreen Display** (800x480)
- **Raspbian OS** with desktop environment
- **Chromium Browser** (pre-installed)

### Installation Steps

1. **Update your Pi:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Install Chromium (if not installed):**
   ```bash
   sudo apt install chromium-browser -y
   ```

3. **Copy the app to your Pi:**
   ```bash
   # Option 1: Git clone (if you have internet)
   git clone https://github.com/hadefuwa/wind-tunnel-rpi-pwa.git
   cd wind-tunnel-rpi-pwa
   
   # Option 2: USB transfer
   # Copy files to /home/pi/wind-tunnel-pwa/
   
   # Option 3: SCP from Windows
   scp -r * pi@[PI_IP_ADDRESS]:/home/pi/wind-tunnel-pwa/
   ```

4. **Create startup script:**
   ```bash
   nano /home/pi/start-wind-tunnel.sh
   ```
   
   Add this content:
   ```bash
   #!/bin/bash
   export DISPLAY=:0
   cd /home/pi/wind-tunnel-pwa
   python3 -m http.server 8080 &
   sleep 3
   chromium-browser --kiosk --no-sandbox --disable-web-security \
       --disable-features=TranslateUI --disable-extensions \
       --window-size=800,480 --start-fullscreen \
       http://localhost:8080
   ```

5. **Make it executable:**
   ```bash
   chmod +x /home/pi/start-wind-tunnel.sh
   ```

6. **Test the app:**
   ```bash
   ./start-wind-tunnel.sh
   ```

7. **Auto-start on boot (optional):**
   ```bash
   mkdir -p ~/.config/lxsession/LXDE-pi
   echo "@/home/pi/start-wind-tunnel.sh" >> ~/.config/lxsession/LXDE-pi/autostart
   ```

## 📱 Installing as PWA

The app can be installed as a Progressive Web App:

1. **On Desktop:** Look for the "Install" button in your browser's address bar
2. **On Mobile:** Use "Add to Home Screen" from the browser menu
3. **On Pi:** Chromium will show an install prompt automatically

## 🔧 Technical Details

### Built With

- **HTML5 Canvas** - For 3D rendering surface
- **Three.js** - 3D graphics and WebGL rendering
- **Vanilla JavaScript** - Simple, beginner-friendly code
- **CSS3** - Responsive design and animations
- **Service Worker** - Offline functionality

### File Structure

```
wind-tunnel-rpi-pwa/
├── index.html              # Main app file
├── manifest.json           # PWA configuration
├── sw.js                  # Service worker for offline use
├── css/
│   ├── styles.css         # Main styles
│   └── animations.css     # Wind and UI animations
├── js/
│   ├── main.js           # App initialization
│   ├── windTunnel.js     # 3D scene management
│   ├── windParticles.js  # Particle effects
│   ├── carModel.js       # 3D car model
│   ├── aerodynamics.js   # Physics calculations
│   └── three.min.js      # Three.js library
├── assets/
│   ├── icons/            # PWA icons
│   └── screenshots/      # App screenshots
└── README.md             # This file
```

### Performance Tips

- **Raspberry Pi 4:** Runs smoothly at 30+ FPS
- **Raspberry Pi 3:** May need reduced particle count
- **Mobile devices:** Automatically adjusts quality
- **Desktop:** Full quality with all effects

## 🧮 Physics & Calculations

The app performs real-time aerodynamic calculations:

- **Drag Force:** `F_drag = 0.5 × ρ × v² × Cd × A`
- **Lift Force:** `F_lift = 0.5 × ρ × v² × Cl × A`
- **Dynamic Pressure:** `q = 0.5 × ρ × v²`

Where:
- `ρ` = Air density (1.225 kg/m³)
- `v` = Wind velocity (m/s)
- `Cd` = Drag coefficient (~0.3)
- `Cl` = Lift coefficient (~0.1)
- `A` = Frontal area (2.2 m²)

## 🎨 Customization

### Adding Your Own Car Model

Replace the simple car in `js/carModel.js`:

```javascript
// In carModel.js, modify the createCar() function
createCar() {
    // Load your own 3D model here
    const loader = new THREE.GLTFLoader();
    loader.load('path/to/your/model.glb', (gltf) => {
        this.carGroup = gltf.scene;
        // ... rest of setup
    });
}
```

### Changing Wind Tunnel Environment

Modify the tunnel setup in `js/windTunnel.js`:

```javascript
// In windTunnel.js, modify setupTunnel()
setupTunnel() {
    // Change tunnel size, colors, or add decorations
    const tunnelGeometry = new THREE.BoxGeometry(30, 10, 10); // Bigger tunnel
    // ... customize as needed
}
```

## 🐛 Troubleshooting

### Common Issues

1. **"App won't load"**
   - Make sure you're running a web server (not opening files directly)
   - Check browser console for errors (F12)
   - Ensure WebGL is supported and enabled

2. **"Poor performance on Pi"**
   - Reduce particle count in `js/windParticles.js`
   - Disable shadows and anti-aliasing in `js/windTunnel.js`
   - Close other applications to free up memory

3. **"Touch controls not working"**
   - Ensure `touch-action: none` is set in CSS
   - Check if screen calibration is needed
   - Try using a mouse first to test

4. **"PWA features not working"**
   - Must be served over HTTPS or localhost
   - Check if service worker is registered
   - Look for errors in browser developer tools

5. **"Can't start Python server"**
   - Make sure Python is installed: `python --version`
   - Try `python3` instead of `python`
   - Check if port 8080 is already in use

### Browser Compatibility

| Browser | Windows | Raspberry Pi | Mobile |
|---------|---------|--------------|--------|
| Chrome  | ✅ Full | ✅ Full     | ✅ Full |
| Edge    | ✅ Full | ❌ N/A      | ✅ Full |
| Firefox | ✅ Good | ✅ Good     | ✅ Good |
| Safari  | ❌ N/A  | ❌ N/A      | ✅ Good |

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Ideas for Contributions

- Add more realistic car models
- Implement CFD visualization
- Add sound effects
- Create different tunnel environments
- Improve mobile responsiveness
- Add data export features

## 📞 Support

If you encounter any issues or have questions:

1. Check the troubleshooting section above
2. Open an issue on GitHub: https://github.com/hadefuwa/wind-tunnel-rpi-pwa/issues
3. Contact the developer

## 🙏 Acknowledgments

- **Three.js** - Amazing 3D graphics library
- **Web APIs** - For modern browser capabilities
- **Raspberry Pi Foundation** - For affordable computing
- **Open Source Community** - For inspiration and support

---

**Happy wind tunnel testing!** 🚗💨 
