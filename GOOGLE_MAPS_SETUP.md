# Google Maps Integration Setup Guide

This guide will help you configure Google Maps for the GateMesh web client.

## Prerequisites

- Google Cloud account
- Credit card (required by Google, though free tier is generous)
- Node.js and pnpm installed

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Enter project name: `GateMesh Web Client`
4. Click **"Create"**

## Step 2: Enable Required APIs

1. In the Cloud Console, go to **"APIs & Services"** → **"Library"**
2. Enable the following APIs:
   - **Maps JavaScript API** (required)
   - **Places API** (required)
   - **Geocoding API** (optional, for address search)
   - **Geolocation API** (optional, for location detection)

For each API:
- Search for the API name
- Click on it
- Click **"Enable"**

## Step 3: Create API Key

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"API Key"**
3. Your API key will be generated (looks like: `AIzaSy...`)
4. Click **"Close"** (we'll restrict it next)

## Step 4: Restrict API Key (Important for Security)

1. Click on your newly created API key
2. Under **"Application restrictions"**:
   - Choose **"HTTP referrers (web sites)"**
   - Add these referrers:
     ```
     http://localhost:3000/*
     http://localhost:5173/*
     https://yourdomain.com/*
     ```

3. Under **"API restrictions"**:
   - Choose **"Restrict key"**
   - Select:
     - Maps JavaScript API
     - Places API
     - Geocoding API (if enabled)
     - Geolocation API (if enabled)

4. Click **"Save"**

## Step 5: Configure the Web Client

1. In the `gatemesh-web/packages/web/` directory, create a `.env` file:
   ```bash
   cd packages/web
   cp .env.example .env
   ```

2. Edit the `.env` file:
   ```bash
   VITE_GOOGLE_MAPS_API_KEY=AIzaSy_your_actual_api_key_here
   ```

3. **Important**: Never commit `.env` to git! It's already in `.gitignore`.

## Step 6: Install Dependencies

```bash
cd gatemesh-web
pnpm install
```

The `@react-google-maps/api` package will be installed automatically.

## Step 7: Test the Integration

1. Start the development server:
   ```bash
   pnpm dev
   ```

2. Login with demo credentials (e.g., `owner@farm.com` / `demo`)

3. Test maps in these places:
   - **Setup Wizard**: Click "Add Node" → Go to Step 3 (Location)
   - **Map View**: Click "Map" in navigation
   - **Field Configuration**: (Future feature)

### Expected Behavior

✅ **Working:**
- Interactive map loads
- Can click to place markers
- "Use My Location" button works (if you grant permission)
- Satellite/Hybrid/Terrain views available
- Coordinates display updates

❌ **Not Working:**
- See Troubleshooting section below

## Pricing & Quotas

Google Maps has a **generous free tier**:

| API | Monthly Free | Cost After |
|-----|--------------|------------|
| Maps JavaScript API | $200 credit | $7/1000 loads |
| Places API | $200 credit | Varies |
| Geocoding API | $200 credit | $5/1000 requests |

**For typical GateMesh usage:**
- ~100 users × 10 map loads/day = 30,000 loads/month
- Cost: ~$0 (within free tier)

### Set Billing Alerts

1. In Google Cloud Console → **"Billing"**
2. Click **"Budgets & alerts"**
3. Create budget with email alerts at:
   - 50% of budget
   - 90% of budget
   - 100% of budget

Recommended budget: $50/month (plenty of buffer)

## Troubleshooting

### Map Shows "For development purposes only" watermark

**Problem:** API key restrictions are blocking your domain.

**Solution:**
1. Check console for errors
2. Add your exact URL to HTTP referrers
3. Wait 5 minutes for changes to propagate

### "This page can't load Google Maps correctly"

**Problem:** Invalid or missing API key.

**Solution:**
1. Verify `.env` file exists in `packages/web/`
2. Check API key has no extra spaces
3. Restart dev server (`Ctrl+C` then `pnpm dev`)
4. Clear browser cache

### Map doesn't load at all

**Problem:** Required APIs not enabled.

**Solution:**
1. Go to Google Cloud Console
2. Check all required APIs are enabled
3. Wait 2-3 minutes after enabling

### "Use My Location" doesn't work

**Problem:** Browser doesn't have location permission or not on HTTPS.

**Solution:**
1. Grant location permission when prompted
2. For production, use HTTPS (required by browsers)
3. For development, `localhost` works fine

### Coordinates don't update when clicking

**Problem:** Component state not updating.

**Solution:**
1. Check browser console for errors
2. Ensure `onPositionChange` callback is provided
3. Verify map is in editable mode

## Advanced Configuration

### Custom Map Styles

Edit `packages/web/src/config/maps.ts`:

```typescript
mapStyles: [
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  // Add more styles...
],
```

Use [Google Maps Styling Wizard](https://mapstyle.withgoogle.com/) to create custom styles.

### Change Default Location

Edit `packages/web/src/config/maps.ts`:

```typescript
defaultCenter: {
  lat: 40.7128,  // Your farm's latitude
  lng: -74.0060, // Your farm's longitude
},
```

### Adjust Zoom Levels

Edit `getMapOptions()` in `packages/web/src/config/maps.ts`:

```typescript
case 'farm':
  return {
    ...baseOptions,
    zoom: 14, // Increase for closer view
  };
```

## Deployment

### Production Build

Before deploying:

1. Add production domain to API key restrictions:
   ```
   https://yourdomain.com/*
   https://www.yourdomain.com/*
   ```

2. Set environment variable on your hosting platform:
   - **Vercel/Netlify**: Add `VITE_GOOGLE_MAPS_API_KEY` in dashboard
   - **Docker**: Pass as environment variable
   - **Static hosting**: Build with env var set

3. Build:
   ```bash
   VITE_GOOGLE_MAPS_API_KEY=your_key pnpm build
   ```

### Raspberry Pi Base Station

1. Create `.env` on the Pi:
   ```bash
   ssh pi@raspberrypi
   cd /var/www/gatemesh
   nano .env
   ```

2. Add API key:
   ```
   VITE_GOOGLE_MAPS_API_KEY=AIzaSy...
   ```

3. Add Pi's IP to API key restrictions:
   ```
   http://192.168.1.100/*
   ```

4. Rebuild and deploy:
   ```bash
   pnpm build
   scp -r dist/* pi@raspberrypi:/var/www/gatemesh/
   ```

## Security Best Practices

✅ **DO:**
- Use API key restrictions (HTTP referrers + API restrictions)
- Set up billing alerts
- Never commit `.env` files
- Use different API keys for dev/staging/prod
- Rotate keys if exposed

❌ **DON'T:**
- Commit API keys to git
- Share API keys in public channels
- Use same key for multiple projects
- Skip setting up restrictions

## Support

If you encounter issues:

1. Check browser console for errors
2. Verify all APIs are enabled in Google Cloud
3. Confirm API key restrictions are correct
4. Wait 5 minutes after making changes (propagation time)

For GateMesh-specific issues, contact the development team.

---

**Setup complete!** You should now have fully functional Google Maps integration. 🗺️
