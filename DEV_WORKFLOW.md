# Development Workflow Guide

## Quick Start - All Services

To start all Module Federation services simultaneously:

```bash
npm run dev
```

This single command will start:
- **Desktop Host** on http://localhost:3011 (cyan)
- **Notepad Remote** on http://localhost:3001 (magenta)  
- **Shared UI Kit** on http://localhost:3003 (yellow)

The services are color-coded in the terminal output for easy identification.

## Individual Services

If you need to start services individually:

```bash
# Desktop Host only
npm run dev:host

# Notepad Remote only  
npm run dev:notepad

# Shared UI Kit only
npm run dev:ui-kit

# Legacy Vite system (if needed)
npm run dev:legacy
```

## Development Process

1. **Start all services:** `npm run dev`
2. **Wait for all services to be ready** (look for "webpack compiled" messages)
3. **Open browser:** Navigate to http://localhost:3011
4. **Development:** Make changes to any service - they will hot reload automatically

## Port Configuration

Default ports (configurable via environment variables):
- Desktop Host: 3011
- Notepad Remote: 3001
- Shared UI Kit: 3003

## Stopping Services

Press `Ctrl+C` to stop all services simultaneously. The `--kill-others` flag ensures that if one service fails, all others are stopped as well.

## Troubleshooting

### Port Already in Use
If you get "EADDRINUSE" errors:

```bash
# Windows - Kill processes on specific ports
netstat -ano | findstr :3011
taskkill /PID <PID> /F

# Or restart all services
npm run dev
```

### Service Not Loading
1. Check that all three services show "webpack compiled successfully"
2. Verify no CORS errors in browser console
3. Ensure all services are running on expected ports

### Module Federation Errors
1. Ensure all remotes are accessible at their URLs
2. Check browser network tab for failed remote loads
3. Verify webpack configurations match URL expectations

## Configuration

The development URLs are configured in:
- `apps/desktop-host/src/config/environment.ts` - Browser-side configuration
- `apps/*/webpack.config.js` - Build-time configuration

For different environments, modify these configuration files or set environment variables:

```bash
# Windows PowerShell
$env:HOST_URL="http://localhost:3011"
$env:NOTEPAD_REMOTE_URL="http://localhost:3001"
$env:SHARED_UI_KIT_URL="http://localhost:3003"
npm run dev
```
