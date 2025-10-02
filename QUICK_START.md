# GateMesh Web Client - Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Step 1: Install Dependencies (1 minute)

```bash
cd gatemesh-web
pnpm install
```

### Step 2: Start Dev Server (30 seconds)

```bash
pnpm dev
```

**✅ App is now running:** http://localhost:3000

### Step 3: Login (10 seconds)

Use demo credentials:
- **Email:** `owner@farm.com`
- **Password:** `demo`

### Step 4: Add Your First Node (2 minutes)

1. Click **"Add Node"** button (top-right)
2. **Step 1**: Click "Irrigation Systems" → Select "Water Level Sensor"
3. **Step 2**: Select "Client" mesh role
4. **Step 3**:
   - Name: "Test Sensor"
   - Create Farm: "Demo Farm"
   - Create Zone: "North Zone"
   - Create Field: "Test Field"
5. **Step 4**: Leave defaults
6. **Step 5**: Click "Complete"

**✅ Your first node is configured!**

### Step 5: View All Nodes (30 seconds)

Click **"Map"** in navigation to see your node on a map!

_(Note: Map requires Google Maps API key - see below)_

---

## 🗺️ Optional: Enable Google Maps (5 minutes)

### Why?
- Interactive node placement (click on map)
- Satellite view of your farm
- Draw field boundaries
- "Use My Location" button

### How?

**1. Get API Key (3 minutes)**
- Go to https://console.cloud.google.com/
- Create project (or use existing)
- Enable "Maps JavaScript API"
- Create API key

**2. Add to Project (1 minute)**
```bash
cd packages/web
cp .env.example .env
nano .env
```

Add this line:
```
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

**3. Restart Server**
```bash
# Ctrl+C to stop
pnpm dev
```

**✅ Maps are now working!**

For detailed setup: See [GOOGLE_MAPS_SETUP.md](GOOGLE_MAPS_SETUP.md)

---

## 📱 What You Can Do Now

### Demo the Setup Wizard
- Click "Add Node" → Try different node types
- **Irrigation**: Water sensors, pumps, valves
- **Livestock**: Feed monitors, trackers, gates
- **Equipment**: Generators, solar panels, fuel tanks
- **Crop**: Plant health, pest monitors

### Explore the Interface
- **Dashboard**: Overview cards
- **Nodes**: List all configured nodes
- **Monitor**: Real-time sensor data (placeholder)
- **Map**: Satellite view with all nodes (requires API key)
- **Connect**: Web Serial for USB devices

### Test Multi-Role Nodes
- Add a node with multiple roles
- Example: Weather Station + Soil Moisture
- See both capabilities in one device

### Create Hierarchy
- Add multiple farms
- Create zones within farms (irrigation/pasture/crop)
- Create fields within zones
- Organize nodes by location

---

## 🎯 Common Tasks

### Add Another User
Currently demo-only. Edit `src/store/authStore.ts` to add users.

**Available roles:**
- **Owner**: Manage their farm(s)
- **Admin**: All farms + MQTT monitoring
- **Viewer**: Read-only access

### Change Default Location
Edit `packages/web/src/config/maps.ts`:
```typescript
defaultCenter: {
  lat: 40.7128,  // Your farm latitude
  lng: -74.0060, // Your farm longitude
}
```

### Customize Theme
Edit `packages/web/tailwind.config.js`:
```javascript
colors: {
  earth: { /* browns */ },
  soil: { /* tans */ },
}
```

### Add New Node Type
1. Edit `src/types/agriculture.ts` (add enum)
2. Edit `src/data/nodeCatalog.ts` (add metadata)
3. Restart dev server

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change port
pnpm dev --port 3001
```

### Maps Not Loading
1. Check `.env` file exists in `packages/web/`
2. Verify API key is correct
3. Restart dev server
4. Check browser console for errors

### "Cannot find module"
```bash
# Clean reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Changes Not Appearing
```bash
# Clear cache
Ctrl+Shift+R (hard refresh)
# Or
Ctrl+C  # Stop server
pnpm dev  # Restart
```

---

## 📚 Next Steps

Once you're comfortable:

1. **Read full docs**: [README.md](README.md)
2. **Production deployment**: See "Deployment" section in README
3. **Customize for your needs**: See "Customization" section
4. **Set up Google Maps**: [GOOGLE_MAPS_SETUP.md](GOOGLE_MAPS_SETUP.md)

---

## 💡 Pro Tips

### Development Workflow
```bash
# Terminal 1: Run dev server
pnpm dev

# Terminal 2: Watch for errors
pnpm lint

# Terminal 3: (optional) Type checking
pnpm tsc --noEmit --watch
```

### Browser DevTools
- **F12** to open console
- Check **Network** tab for API errors
- Check **Application** → **Local Storage** for persisted data
- Use **React DevTools** extension to inspect components

### Keyboard Shortcuts
- **Ctrl+C**: Stop dev server
- **Ctrl+R**: Refresh browser
- **Ctrl+Shift+R**: Hard refresh (clear cache)

---

## 🎉 You're Ready!

You now have:
- ✅ Working web client
- ✅ Complete setup wizard
- ✅ Node catalog (40+ types)
- ✅ Hierarchical organization
- ✅ Optional Google Maps

**Happy farming!** 🌾

Need help? Check:
- [README.md](README.md) - Full documentation
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - What's been built
- [GOOGLE_MAPS_SETUP.md](GOOGLE_MAPS_SETUP.md) - Maps integration
