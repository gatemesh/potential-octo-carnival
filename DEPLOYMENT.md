# Vercel Deployment Troubleshooting Guide

## Common "No Production Deployment" Issues

### 1. Build Configuration Issues

**Problem**: Vercel can't find or execute the build command.

**Solutions**:
- Ensure `vercel.json` has the correct `buildCommand`
- Verify `outputDirectory` points to the correct build folder
- Check that all dependencies are properly listed in `package.json`

### 2. Node.js Version Mismatch

**Problem**: Build fails due to Node.js version incompatibility.

**Solution**: Add Node.js version specification:
```json
{
  "functions": {
    "packages/web/dist/**": {
      "runtime": "nodejs18.x"
    }
  }
}
```

### 3. Package Manager Issues

**Problem**: Vercel can't install dependencies with pnpm.

**Solutions**:
- Ensure `pnpm-lock.yaml` is committed
- Use `--frozen-lockfile` flag in build command
- Alternative: Use the simple vercel.json configuration

### 4. Build Output Issues

**Problem**: Build succeeds but files aren't served correctly.

**Solutions**:
- Verify `outputDirectory` path is correct
- Check that `index.html` exists in the output directory
- Ensure static assets are in the right location

## Quick Fixes

### Option 1: Use Simple Configuration
Replace `vercel.json` with `vercel-simple.json` content:
```json
{
  "version": 2,
  "buildCommand": "pnpm install && pnpm build:web",
  "outputDirectory": "packages/web/dist"
}
```

### Option 2: Manual Deployment
1. Build locally: `pnpm build:web`
2. Deploy the `packages/web/dist` folder directly
3. Use Vercel CLI: `vercel --prod packages/web/dist`

### Option 3: Framework Detection
Remove custom build command and let Vercel auto-detect:
```json
{
  "version": 2,
  "outputDirectory": "packages/web/dist"
}
```

## Verification Steps

1. **Test Local Build**:
   ```bash
   pnpm clean
   pnpm build:web
   pnpm verify:build
   ```

2. **Check Build Output**:
   - Navigate to `packages/web/dist`
   - Verify `index.html` exists
   - Check `assets/` folder has JS and CSS files

3. **Preview Locally**:
   ```bash
   pnpm preview
   ```

4. **Deploy to Preview**:
   ```bash
   pnpm deploy:preview
   ```

## Environment Variables

Required variables for full functionality:
- `VITE_GOOGLE_MAPS_API_KEY`: For map features
- `VITE_API_URL`: Backend API endpoint
- `VITE_DEV_MODE`: Development features toggle

## Build Performance

Optimized build creates these chunks:
- `vendor.js`: React and core libraries (~141KB)
- `ui.js`: UI components (~26KB)
- `maps.js`: Google Maps integration (~152KB)
- `charts.js`: Chart components (~383KB)
- `index.js`: Main application code (~208KB)

## Support

If issues persist:
1. Check Vercel deployment logs
2. Compare with successful local build
3. Try the simple configuration first
4. Ensure all files are committed and pushed

## Alternative Deployment Platforms

If Vercel continues to have issues, consider:
- **Netlify**: Often works better with monorepos
- **GitHub Pages**: For static hosting
- **Cloudflare Pages**: Good pnpm support