# Module Federation Development Setup

## ✅ **COMPLETED: Environment Variable Configuration**

All hardcoded URLs have been successfully replaced with configurable environment variables:

### 🔧 **What Was Changed:**
- ✅ Replaced `'http://localhost:3011/'` and other hardcoded URLs with environment variables
- ✅ Created browser-compatible configuration system (no `process.env` in browser)
- ✅ Updated webpack configurations to use environment variables at build time
- ✅ Added configuration files for easy environment management

### 📁 **Configuration Files:**
- `apps/desktop-host/src/config/environment.ts` - Browser-side configuration
- `CONFIG_GUIDE.md` - Detailed configuration guide
- All webpack.config.js files updated with environment variable support

## 🚀 **NEW: Single Command Development**

### **Start All Services:**
```bash
npm run dev
```

This single command starts:
- **Desktop Host** (http://localhost:3011) - Main application
- **Notepad Remote** (http://localhost:3001) - Notepad module
- **Shared UI Kit** (http://localhost:3003) - Shared components

### **Individual Services:**
```bash
npm run dev:host      # Desktop Host only
npm run dev:notepad   # Notepad Remote only  
npm run dev:ui-kit    # Shared UI Kit only
npm run dev:legacy    # Original Vite system
```

### **Test Services:**
```bash
npm run test:services # Check if all services are running
```

## 📋 **Development Workflow:**

1. **Start all services:** `npm run dev`
2. **Wait for compilation** (look for "webpack compiled successfully" messages)
3. **Open browser:** http://localhost:3011
4. **Develop:** Changes hot-reload automatically

## 🔧 **Configuration:**

### **Default URLs (Development):**
- Desktop Host: `http://localhost:3011`
- Notepad Remote: `http://localhost:3001`
- Shared UI Kit: `http://localhost:3003`

### **Change URLs:**
Modify `apps/desktop-host/src/config/environment.ts`:

```typescript
export const CONFIG = {
  HOST_URL: 'http://localhost:3011',
  NOTEPAD_REMOTE_URL: 'http://localhost:3001',
  SHARED_UI_KIT_URL: 'http://localhost:3003',
  // ... other settings
};
```

### **Environment Variables (Build Time):**
```bash
# Windows PowerShell
$env:HOST_URL="http://localhost:3011"
$env:NOTEPAD_REMOTE_URL="http://localhost:3001"
npm run dev
```

## 🛠️ **Troubleshooting:**

### **Port Already in Use:**
```bash
# Windows - Find and kill process
netstat -ano | findstr :3011
taskkill /PID <PID> /F
```

### **Services Not Starting:**
- Check that all package.json files have correct scripts
- Ensure no firewall blocking ports
- Try individual services: `npm run dev:host`, etc.

### **Module Federation Errors:**
- Verify all services show "webpack compiled successfully"
- Check browser console for CORS errors
- Ensure remoteEntry.js files are accessible

## 📚 **Additional Documentation:**
- `DEV_WORKFLOW.md` - Detailed development workflow
- `CONFIG_GUIDE.md` - Configuration management guide
- Individual app README files (if present)

---

**🎉 Ready for development!** Run `npm run dev` and open http://localhost:3011
