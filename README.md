# GateMesh Agriculture Web Client

A modern, user-friendly web interface for configuring and monitoring GateMesh agriculture IoT nodes. Built with React, TypeScript, and Tailwind CSS with an earth-toned agriculture theme.

## Features

### 🌾 Agriculture-Focused Design
- **40+ Node Types** across 7 categories:
  - Irrigation Systems (Headgate Controllers, Pumps, Sensors)
  - Livestock Infrastructure (Feeders, Trackers, Water Monitors)
  - Equipment Monitoring (Generators, Tractors, Solar Panels)
  - Barn & Building (Grain Silos, Greenhouses, Coops)
  - Crop & Field Monitoring (Plant Health, Pest Detection)
  - Specialized (Beehives, Fish Ponds, Hydroponics)
  - Processing & Handling (Milk Tanks, Grain Elevators)

### 🧙 Setup Wizard
**5-Step Configuration Process:**
1. **Role Selection** - Category cards with visual navigation
2. **Mesh Network** - Configure network role (Client/Router/Repeater)
3. **Location Assignment** - Farm → Zone → Field hierarchy
4. **Advanced Config** - Auto-detect sensors, configure thresholds
5. **Review & Deploy** - Visual summary before activation

### 👥 Multi-User Access Control
- **Owner** - Full farm management
- **Admin** - System-wide monitoring with MQTT access
- **Viewer** - Read-only dashboard access

### 📱 User Experience
- **Farmer-Friendly** - Designed for non-technical users
- **Category Cards** - Visual node type selection
- **Hierarchical Organization** - Farm > Zone > Field > Node
- **Multi-Role Nodes** - Single node can perform multiple functions
- **Auto-Detection** - Sensors automatically detected via Grove connectors

## Quick Start

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm
- Google Maps API key (optional, for map features)

### Installation

```bash
# Navigate to project
cd gatemesh-web

# Install dependencies
pnpm install

# Configure Google Maps (optional)
cp packages/web/.env.example packages/web/.env
# Edit .env and add your Google Maps API key

# Start development server
pnpm dev

# Build for production
pnpm build
```

### Google Maps Setup (Optional)

For full map functionality, you'll need a Google Maps API key:

1. **Quick setup**: See [GOOGLE_MAPS_SETUP.md](GOOGLE_MAPS_SETUP.md) for detailed instructions
2. **TL;DR**:
   - Get API key from [Google Cloud Console](https://console.cloud.google.com/)
   - Enable: Maps JavaScript API + Places API
   - Add to `packages/web/.env`: `VITE_GOOGLE_MAPS_API_KEY=your_key`

**Without Google Maps:**
- Manual lat/long entry still works
- Wizard shows configuration instructions
- All other features work normally

### Demo Credentials

The app includes demo authentication:

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| Owner | owner@farm.com | demo | Full farm management |
| Admin | admin@gatemesh.com | demo | All farms + MQTT monitoring |
| Viewer | viewer@farm.com | demo | Read-only access |

## Project Structure

```
gatemesh-web/
├── packages/
│   ├── web/                          # Main React application
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Auth/             # Login & authentication
│   │   │   │   ├── Wizard/           # 5-step setup wizard
│   │   │   │   │   ├── SetupWizard.tsx
│   │   │   │   │   └── steps/
│   │   │   │   │       ├── StepRoleSelection.tsx      # Category cards
│   │   │   │   │       ├── StepMeshConfig.tsx          # Network config
│   │   │   │   │       ├── StepLocationAssignment.tsx  # Hierarchy
│   │   │   │   │       ├── StepAdvancedConfig.tsx      # Detailed settings
│   │   │   │   │       └── StepReview.tsx              # Final review
│   │   │   │   ├── Dashboard/        # Main dashboard views
│   │   │   │   ├── Connect/          # Web Serial connection
│   │   │   │   └── Monitor/          # Real-time monitoring
│   │   │   ├── store/
│   │   │   │   ├── authStore.ts      # User authentication
│   │   │   │   ├── farmStore.ts      # Farm hierarchy (Farm/Zone/Field)
│   │   │   │   ├── nodeStore.ts      # Node management
│   │   │   │   └── irrigationStore.ts # Sensor data
│   │   │   ├── types/
│   │   │   │   └── agriculture.ts    # Complete type system
│   │   │   ├── data/
│   │   │   │   └── nodeCatalog.ts    # 40+ node metadata
│   │   │   ├── App.tsx               # Main application
│   │   │   └── main.tsx              # Entry point
│   │   ├── package.json
│   │   └── tailwind.config.js        # Earth-toned theme
│   ├── core/                          # Core GateMesh logic
│   └── transport-web-serial/          # Web Serial API
├── package.json
└── pnpm-workspace.yaml
```

## Usage Workflow

### 1. Login
- Open http://localhost:3000
- Use demo credentials or configure authentication

### 2. Add a Node
1. Click **"Add Node"** button
2. Setup wizard opens automatically

### 3. Configure via Wizard

**Step 1: Role Selection**
- Browse 7 categories
- Select primary role (e.g., "Irrigation → Water Level Sensor")
- Add additional roles (multi-role support)
- Search/filter available nodes

**Step 2: Mesh Network**
- Choose network role:
  - Client (low power, battery-friendly)
  - Router (always-on, extends range)
  - Router+Client (hybrid mode)
  - Repeater (dedicated relay)
  - Tracker (GPS-enabled)
  - Sensor (ultra-low power)

**Step 3: Location**
- Create/select Farm
- Create/select Zone (irrigation/pasture/crop/building)
- Create/select Field
- Assign friendly name (e.g., "North Field Water Sensor")
- Optional: GPS coordinates

**Step 4: Advanced Config**
- Auto-detected sensors shown
- Configure role-specific settings:
  - Thresholds (e.g., water level alerts)
  - Intervals (reporting frequency)
  - Calibration values
- General settings (sleep mode, etc.)
- Add installation notes

**Step 5: Review**
- Visual summary of all configuration
- Verify before deployment
- Click "Complete" to save

### 4. Monitor
- Dashboard shows all configured nodes
- Real-time sensor data
- Hierarchical organization by Farm/Zone/Field

## Type System

### Node Categories
```typescript
enum NodeCategory {
  IRRIGATION = 'irrigation',
  LIVESTOCK = 'livestock',
  EQUIPMENT = 'equipment',
  BUILDING = 'building',
  CROP = 'crop',
  SPECIALIZED = 'specialized',
  PROCESSING = 'processing',
}
```

### Multi-Role Support
```typescript
interface GateMeshNode {
  nodeTypes: NodeType[];  // Can have multiple roles
  meshRole: MeshRole;     // Network function
  // ... hierarchy
  farmId?: string;
  zoneId?: string;
  fieldId?: string;
  // ... config
}
```

### Hierarchical Structure
```
Farm
└── Zone (irrigation/pasture/crop/building/mixed)
    └── Field
        └── Node (multi-role)
```

## Customization

### Adding New Node Types

1. **Update Enum** (`types/agriculture.ts`):
```typescript
export enum NodeType {
  MY_NEW_SENSOR = 350,
}
```

2. **Add Metadata** (`data/nodeCatalog.ts`):
```typescript
{
  id: NodeType.MY_NEW_SENSOR,
  name: 'My New Sensor',
  category: NodeCategory.CROP,
  description: 'What it does...',
  icon: 'sensor-icon',
  configFields: [
    {
      key: 'threshold',
      label: 'Alert Threshold',
      type: 'number',
      required: false,
      unit: 'units',
    },
  ],
}
```

### Theme Customization

Earth tones defined in `tailwind.config.js`:
```javascript
colors: {
  earth: { /* browns */ },
  soil: { /* tans */ },
  primary: { /* greens */ },
}
```

## Offline Support (Planned)

- IndexedDB caching for offline use
- Command queuing for rural connectivity
- Local data storage (24hr history)

## Google Maps Integration (Planned)

- Visual node placement on farm map
- Satellite imagery overlay
- Boundary drawing for fields
- GPS auto-population from node hardware

## Network Topology View (Planned)

- Visual mesh network graph
- Signal strength indicators
- Parent-child relationships
- Water flow paths for irrigation

## Technologies

- **React 18** - UI framework
- **TypeScript 5** - Type safety
- **Vite 5** - Build tool
- **Tailwind CSS 3** - Styling (earth tones)
- **Zustand** - State management
- **Web Serial API** - USB device connection
- **Lucide React** - Icons

## Browser Support

| Feature | Chrome | Edge | Firefox | Safari |
|---------|--------|------|---------|--------|
| Web App | ✅ | ✅ | ✅ | ✅ |
| Web Serial | ✅ 89+ | ✅ 89+ | ❌ | ❌ |

**Recommendation:** Use Chrome or Edge for USB device configuration.

## Development

### Scripts

```bash
pnpm dev          # Start dev server (port 3000)
pnpm build        # Production build
pnpm lint         # Code linting
pnpm preview      # Preview production build
```

### Adding Features

1. Create component in `src/components/`
2. Add types to `src/types/agriculture.ts`
3. Update stores in `src/store/`
4. Integrate in `App.tsx`

## Deployment

### Static Hosting
```bash
pnpm build
# Deploy packages/web/dist to any static host
```

### Docker
```bash
docker build -t gatemesh-web .
docker run -p 8080:80 gatemesh-web
```

### Raspberry Pi Base Station
```bash
# Build and copy to Pi
pnpm build
scp -r packages/web/dist/* pi@raspberrypi:/var/www/gatemesh/
```

## Troubleshooting

### Web Serial Not Working
- Ensure HTTPS or localhost
- Use Chrome/Edge 89+
- Check browser permissions

### Zustand Persist Issues
- Clear localStorage: `localStorage.clear()`
- Check browser console for errors

### Build Errors
```bash
# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## Roadmap

- [x] Complete node catalog (40+ types)
- [x] User authentication & permissions
- [x] Farm/Zone/Field hierarchy
- [x] 5-step setup wizard
- [x] Category cards UI
- [x] Multi-role node support
- [x] Google Maps integration
  - [x] Interactive node placement
  - [x] Farm map overview
  - [x] "Use My Location" button
  - [x] Field boundary drawing
  - [ ] Offline map caching
- [ ] Water flow path visualization
- [ ] Network topology view
- [ ] Offline capability (IndexedDB)
- [ ] Templates & clone config
- [ ] MQTT admin monitoring
- [ ] Mobile app (React Native)

## Contributing

This is a commercial project for GateMesh agriculture systems.

## License

Proprietary - All rights reserved

## Support

For setup assistance or feature requests, contact the GateMesh team.

---

**Built for farmers, by engineers.** 🌾
