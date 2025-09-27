# Environment Variables Setup Guide

## Overview
All hardcoded URLs have been replaced with configurable environment variables across the Module Federation architecture.

## Environment Variables

### Desktop Host (Port 3011)
- `HOST_URL` - Desktop host URL (default: http://localhost:3011)
- `DEV_SERVER_PORT` - Development server port (default: 3011)
- `DEV_SERVER_HOST` - Development server host (default: localhost)

### Remote Applications
- `NOTEPAD_REMOTE_URL` - Notepad remote URL (default: http://localhost:3001)
- `CALCULATOR_REMOTE_URL` - Calculator remote URL (default: http://localhost:3002)

### Shared Packages
- `SHARED_UI_KIT_URL` - Shared UI kit URL (default: http://localhost:3003)

## Usage

### Option 1: Using dotenv.env file
```bash
# Copy the reference file to create environment-specific configs
cp dotenv.env .env.development
cp dotenv.env .env.production

# Edit the files with environment-specific values
# Then use with dotenv-cli:
npx dotenv -e .env.development npm run dev
```

### Option 2: Set environment variables directly
```bash
# Windows PowerShell
$env:HOST_URL="http://localhost:3011"
$env:NOTEPAD_REMOTE_URL="http://localhost:3001"
$env:SHARED_UI_KIT_URL="http://localhost:3003"
npm run dev

# Linux/Mac
export HOST_URL="http://localhost:3011"
export NOTEPAD_REMOTE_URL="http://localhost:3001"
export SHARED_UI_KIT_URL="http://localhost:3003"
npm run dev
```

### Option 3: Production deployment
Set these variables in your deployment environment:
```bash
HOST_URL=https://desktop.your-domain.com
NOTEPAD_REMOTE_URL=https://notepad.your-domain.com
CALCULATOR_REMOTE_URL=https://calculator.your-domain.com
SHARED_UI_KIT_URL=https://ui-kit.your-domain.com
```

## Testing the Configuration

1. **Start the desktop host:**
   ```bash
   cd apps/desktop-host
   npm run dev
   ```

2. **Start the notepad remote:**
   ```bash
   cd apps/notepad-remote
   npm run start
   ```

3. **Start the shared UI kit:**
   ```bash
   cd packages/shared-ui-kit
   npm run start
   ```

4. **Verify the configuration:**
   - Check browser console for any `process is not defined` errors
   - Verify that Module Federation remotes load correctly
   - Check that all URLs are resolved from environment variables

## Troubleshooting

### "process is not defined" Error
This error should be resolved with the DefinePlugin configuration. If you still see it:
1. Ensure webpack DefinePlugin is properly configured
2. Check that the build process is completing successfully
3. Clear webpack cache: `rm -rf node_modules/.cache`

### Remote Loading Failures
If remotes fail to load:
1. Verify all development servers are running on correct ports
2. Check CORS headers are properly configured
3. Ensure environment variables match actual server URLs

## Files Modified
- `apps/desktop-host/webpack.config.js` - Added environment variable support
- `apps/notepad-remote/webpack.config.js` - Added environment variable support  
- `packages/shared-ui-kit/webpack.config.js` - Added environment variable support
- `apps/desktop-host/src/shell/RemoteRegistry.tsx` - Uses environment variables for remote URLs
- `dotenv.env` - Reference environment configuration file
