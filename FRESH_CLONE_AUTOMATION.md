# PrometheOS Python Client - Fresh Clone Setup Guide

This guide demonstrates the complete automated build pipeline for the PrometheOS Python client, ensuring that users can successfully use the enhanced Python client with micropip imports from a fresh GitHub clone.

## 🎯 Overview

The PrometheOS Python client provides a seamless bridge between Pyodide environments and desktop functionality through an enhanced OpenAPI-generated client with custom initialization patterns.

## 🚀 Quick Start (Fresh Clone)

After cloning the repository, the complete build pipeline is fully automated:

```bash
# 1. Install dependencies
npm install

# 2. Generate everything (OpenAPI + clients + wheel)
npm run build

# 3. Start development server
npm run dev
```

That's it! The automation handles:
- ✅ OpenAPI specification generation 
- ✅ TypeScript & Python client generation
- ✅ Python package creation
- ✅ Wheel building
- ✅ Development server setup

## 📦 Automated Build Pipeline

### Complete Build Commands

```bash
# Full production build (everything)
npm run build

# Development server (with auto-rebuild)  
npm run dev

# Individual components
npm run codegen          # Generate OpenAPI clients
npm run build:python     # Create Python package + wheel
npm run build:wheel      # Build wheel only
```

### What Gets Built

1. **OpenAPI Specification** (`openapi.json`)
   - Generated from component definitions
   - 6 endpoints for the unified services API

2. **Generated Clients**
   - TypeScript client: `src/prometheos-client-generated/`
   - Python client: `src/prometheos-client-python-generated/`

3. **Enhanced Wrappers**
   - TypeScript: `src/prometheos-client/index.ts`
   - Python: `src/prometheos-client-python/prometheos_client.py`

4. **Python Package** (`public/python-modules/prometheos/`)
   - Proper package structure for micropip
   - Enhanced client code with desktop bridge integration
   - Generated API components

5. **Wheel Package** (`public/wheels/prometheos-1.0.0-py3-none-any.whl`)
   - Installable Python wheel
   - Ready for micropip installation
   - Contains all enhanced features

## 🔧 Technical Details

### New Automation Scripts

- `scripts/build-python-wheel.js` - Automated wheel building
- `scripts/create-python-package.js` - Package structure creation
- `scripts/generate-unified-client.js` - OpenAPI client generation

### Package.json Integration

```json
{
  "scripts": {
    "dev": "node scripts/build-workers.cjs && npm run build:python && vite",
    "build": "node scripts/build-workers.cjs && npm run build:python && tsc && vite build && node scripts/setup-shadow.mjs && node scripts/fix-symlinks.mjs",
    "build:python": "npm run create-python-package && npm run build:wheel",
    "build:wheel": "node scripts/build-python-wheel.js"
  }
}
```

### Requirements

- **Node.js** (for build pipeline)
- **Python 3.8+** (for wheel building)
- **npm** (for dependencies)

## 🧪 Testing the Pipeline

### 1. Start Development Server

```bash
npm run dev
```

Server runs at: `http://localhost:8080/prometheos/` (or next available port)

### 2. Test Micropip Installation

Open browser to test environment and run:

```python
import micropip
await micropip.install("http://localhost:8081/prometheos/wheels/prometheos-1.0.0-py3-none-any.whl")
import prometheos

# Test the enhanced client
await prometheos.services.notify("Hello from enhanced Python client!")
```

### 3. Verify Build Output

Check that all components are generated:

```bash
# Generated clients
ls src/prometheos-client-generated/
ls src/prometheos-client-python-generated/

# Python package
ls public/python-modules/prometheos/

# Wheel package  
ls public/wheels/
```

## 🎉 Success Verification

The automation is working correctly when:

1. ✅ `npm run build` completes without errors
2. ✅ Wheel file exists: `public/wheels/prometheos-1.0.0-py3-none-any.whl`
3. ✅ Development server starts successfully
4. ✅ Micropip installation works in browser
5. ✅ Enhanced Python client functions properly

## 🔍 Troubleshooting

### Python Not Found

```bash
# Windows
python --version

# macOS/Linux  
python3 --version
```

If Python is not installed, download from: https://www.python.org/downloads/

### Build Failures

```bash
# Clean and rebuild
rm -rf public/python-modules public/wheels
npm run build:python
```

### Port Conflicts

Development server automatically finds next available port if 8080 is busy.

## 📚 Usage Examples

### Basic Client Usage

```python
import prometheos

# Simple notification
await prometheos.services.notify("Hello World!")

# Launch application
result = await prometheos.services.launch_app("calculator")

# Open dialog
response = await prometheos.dialog.open_dialog(
    title="Python App",
    description="Dialog from Python",
    confirm_label="OK"
)
```

### Advanced Integration

```python
# Event handling
await prometheos.on_event.wait_for_event("app_launched")

# Error handling with enhanced client
try:
    await prometheos.services.launch_app("nonexistent")
except Exception as e:
    print(f"Launch failed: {e}")
```

## 🎯 Fresh Clone Workflow

This complete automation ensures that anyone cloning the repository can:

1. **Clone** → `git clone <repository>`
2. **Install** → `npm install` 
3. **Build** → `npm run build`
4. **Develop** → `npm run dev`
5. **Test** → Micropip install in browser

No manual steps required! The enhanced PrometheOS Python client with desktop bridge integration is ready to use.

---

*Generated wheel package contains the complete enhanced Python client with improved initialization patterns and desktop bridge functionality.*
