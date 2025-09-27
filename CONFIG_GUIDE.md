# Configuration Guide - Browser-Compatible Environment Setup

## Overview
This project uses a browser-compatible configuration approach instead of Node.js `process.env` variables, since those don't exist in the browser environment.

## How It Works

### 1. Configuration Files
- **`apps/desktop-host/src/config/environment.ts`** - Main configuration file with environment-specific settings
- **Webpack configs** - Use Node.js environment variables at build time only

### 2. Browser Configuration
The browser code uses TypeScript constants from the config file:

```typescript
// apps/desktop-host/src/config/environment.ts
export const CONFIG = {
  HOST_URL: 'http://localhost:3011',
  NOTEPAD_REMOTE_URL: 'http://localhost:3001',
  CALCULATOR_REMOTE_URL: 'http://localhost:3002',
  SHARED_UI_KIT_URL: 'http://localhost:3003',
};
```

### 3. Build-Time Configuration
Webpack configs can still use Node.js environment variables:

```javascript
// webpack.config.js (Node.js environment)
const HOST_URL = process.env.HOST_URL || 'http://localhost:3011';
```

## Configuration for Different Environments

### Development (Default)
No changes needed - uses localhost URLs by default.

### Staging/Production
Modify the `environment.ts` file or use build-time replacement:

#### Option 1: Direct Modification
```typescript
export const CONFIG = {
  HOST_URL: 'https://desktop.your-domain.com',
  NOTEPAD_REMOTE_URL: 'https://notepad.your-domain.com',
  // ... other URLs
};
```

#### Option 2: Environment Detection
```typescript
const getCurrentEnvironment = () => {
  if (window.location.hostname.includes('staging')) return 'staging';
  if (window.location.hostname.includes('localhost')) return 'development';
  return 'production';
};

export const ACTIVE_CONFIG = ENVIRONMENTS[getCurrentEnvironment()];
```

#### Option 3: Build-Time Replacement
Use webpack DefinePlugin to replace values at build time:

```javascript
// webpack.config.js
new webpack.DefinePlugin({
  __CONFIG_HOST_URL__: JSON.stringify(process.env.HOST_URL || 'http://localhost:3011'),
})
```

## Deployment Strategies

### 1. Simple Deployment
1. Modify `apps/desktop-host/src/config/environment.ts` with production URLs
2. Build and deploy

### 2. Multi-Environment Deployment
1. Use environment detection in the config file
2. Deploy same build to different environments
3. URLs are determined at runtime based on hostname

### 3. Build-Time Configuration
1. Set environment variables during build process
2. Use webpack DefinePlugin to inject values
3. Different builds for different environments

## PowerShell Commands (Windows)

```powershell
# Set environment variables for build
$env:HOST_URL="https://desktop.your-domain.com"
$env:NOTEPAD_REMOTE_URL="https://notepad.your-domain.com"

# Navigate and run
cd apps/desktop-host
npm run dev
```

## Key Benefits

1. **Browser Compatible** - No `process.env` dependency in browser code
2. **Type Safe** - TypeScript configuration with proper typing
3. **Flexible** - Multiple deployment strategies supported
4. **Simple** - Easy to understand and modify
5. **Maintainable** - Centralized configuration management

## Files Modified

- ✅ `apps/desktop-host/src/config/environment.ts` - New configuration file
- ✅ `apps/desktop-host/src/shell/RemoteRegistry.tsx` - Uses config instead of process.env
- ✅ `apps/desktop-host/webpack.config.js` - Removed DefinePlugin, kept Node.js env vars
- ✅ `apps/notepad-remote/webpack.config.js` - Cleaned up DefinePlugin
- ✅ `packages/shared-ui-kit/webpack.config.js` - Cleaned up DefinePlugin

## Testing

The solution should now work without any `process is not defined` errors in the browser console.
