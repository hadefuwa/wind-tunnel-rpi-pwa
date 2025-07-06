# 🧪 Wind Tunnel PWA Test Guide

## Quick Test Steps

### 1. Start the Application
```bash
# Windows Command Prompt/PowerShell:
python -m http.server 8080

# Then open: http://localhost:8080
```

### 2. Visual Verification Checklist

**✅ Initial Load:**
- [ ] Loading screen appears with spinner
- [ ] Loading screen disappears after ~2 seconds
- [ ] 3D wind tunnel scene loads (dark blue background)
- [ ] Red car model visible in center
- [ ] Green arrows showing wind direction
- [ ] Grid floor visible at bottom

**✅ Controls Panel (Bottom):**
- [ ] Wind Speed slider (0-100 MPH)
- [ ] Car Angle slider (-20° to +20°)
- [ ] Three view buttons (Front/Side/Top)
- [ ] Real-time data display (Drag/Lift/Pressure)

**✅ Particle Effects:**
- [ ] Blue-green particles flowing from left to right
- [ ] Particles reset when reaching tunnel exit
- [ ] Particle speed changes with wind speed slider

### 3. Interaction Tests

**Wind Speed Slider:**
1. Move slider to different positions
2. Verify particles move faster/slower
3. Check data values update in real-time

**Car Angle Slider:**
1. Rotate car left and right
2. Verify car model rotates visually
3. Check drag/lift values change

**Camera Views:**
1. Click "Side" - camera moves to side view
2. Click "Top" - camera moves to overhead view  
3. Click "Front" - camera returns to front view

### 4. Performance Check

**Frame Rate:**
- [ ] FPS counter shows 30+ FPS
- [ ] Smooth animation without stuttering
- [ ] Responsive controls (no lag)

### 5. PWA Features

**Service Worker:**
- [ ] Check browser console for "SW registered"
- [ ] No errors in console

**Installation:**
- [ ] Install button appears in browser
- [ ] App can be installed as PWA

## Expected Behavior

- **Drag values** should increase with wind speed and car angle
- **Lift values** can be positive or negative depending on angle
- **Pressure values** should increase with wind speed
- **Camera transitions** should be smooth
- **Particles** should flow continuously

## Common Issues

1. **Black screen** = WebGL not supported/enabled
2. **No particles** = Check browser console for errors
3. **Poor performance** = Reduce particle count in code
4. **Controls not working** = Check touch-action CSS

## Success Criteria

✅ **The app works correctly if:**
- All visual elements load properly
- Controls respond to input
- Physics calculations update in real-time
- No console errors
- Smooth 30+ FPS performance 