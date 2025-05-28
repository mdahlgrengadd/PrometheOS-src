# PrometheOS Desktop Environment

A modern desktop environment with seamless Python integration through Pyodide. Build desktop applications, automation scripts, and interactive tools using familiar Python syntax with direct access to desktop APIs.

## 🚀 Quick Start

Get up and running in 3 simple commands:

```bash
# 1. Install dependencies
npm install

# 2. Build everything (generates APIs, clients, and Python packages)
npm run build

# 3. Start development server
npm run dev
```

Your development server will be running at `http://localhost:8080/prometheos/`

## 🐍 Python Integration (Micropip)

### Installation in Pyodide

The PrometheOS Python client is available as a wheel package for micropip installation:

```python
import micropip
await micropip.install("http://localhost:8080/prometheos/wheels/prometheos-1.0.0-py3-none-any.whl")
import prometheos
```

### Basic Usage

```python
# Initialize (auto-detects desktop bridge)
prometheos.initialize()

# Send notifications
await prometheos.launcher.notify("Hello from Python!")

# Launch applications
await prometheos.launcher.launch_app("calculator")

# Open dialogs
result = await prometheos.dialog.open_dialog(
    title="Python App",
    description="Interactive dialog from Python code",
    confirm_label="OK"
)

# Wait for events
await prometheos.on_event.wait_for_event("app_launched")
```

## 📦 Development vs Production

### Development Mode
```bash
npm run dev
```
- Hot reload enabled
- Automatic rebuilding of Python packages
- Development server at `http://localhost:8080/prometheos/`

### Production Build
```bash
npm run build
npm run preview
```
- Optimized build
- Static files ready for deployment
- Preview server at `http://localhost:4173/prometheus/`

### Deployment
```bash
npm run build
# Deploy contents of 'dist/' directory to your web server
```

Python packages remain accessible at:
- Development: `http://localhost:8080/prometheos/wheels/prometheos-1.0.0-py3-none-any.whl`
- Production: `https://your-domain.com/prometheos/wheels/prometheos-1.0.0-py3-none-any.whl`

## 🛠️ Available Commands

### Core Commands
- `npm run build` - Complete production build (APIs + clients + Python packages)
- `npm run dev` - Development server with hot reload
- `npm run preview` - Preview production build locally

### API Generation
- `npm run codegen` - Generate OpenAPI clients (TypeScript + Python)
- `npm run build:openapi` - Generate OpenAPI specification only

### Python Package Building
- `npm run build:python` - Create Python package + wheel
- `npm run build:wheel` - Build wheel package only
- `npm run create-python-package` - Create package structure only

## 🔧 Project Structure

```
prometheos/
├── src/                              # Source code
│   ├── prometheos-client/           # TypeScript client wrapper
│   ├── prometheos-client-python/    # Python client wrapper (source)
│   ├── prometheos-client-generated/ # Generated TypeScript client
│   └── prometheos-client-python-generated/ # Generated Python client
├── public/
│   ├── python-modules/              # Python package structure
│   └── wheels/                      # Built wheel packages
├── scripts/                         # Build automation
└── openapi.json                     # Generated API specification
```

## 📋 Prerequisites

- **Node.js** 16+ (for build pipeline)
- **Python** 3.8+ (for wheel building)
- **npm** (package management)

## 🧪 Testing Your Installation

### 1. Verify Build Output
```bash
# Check that wheel package exists
ls public/wheels/prometheos-1.0.0-py3-none-any.whl

# Check that Python package structure exists
ls public/python-modules/prometheos/
```

### 2. Test in Browser
Navigate to your development server and run:

```python
import micropip
await micropip.install("http://localhost:8080/prometheos/wheels/prometheos-1.0.0-py3-none-any.whl")
import prometheos

# Test basic functionality
if prometheos.initialize():
    print("✓ PrometheOS client initialized successfully!")
    await prometheos.launcher.notify("Hello from PrometheOS!")
else:
    print("✗ Failed to initialize PrometheOS client")
```

## 🚨 Troubleshooting

### Python Not Found
```bash
# Check Python installation
python --version  # Windows
python3 --version # macOS/Linux
```

If Python is not installed: https://www.python.org/downloads/

### Build Failures
```bash
# Clean rebuild
rm -rf public/python-modules public/wheels
npm run build
```

### Port Conflicts
The development server automatically finds the next available port if 8080 is busy.

### Desktop Bridge Not Available
If you see "Desktop API bridge not available":
1. Ensure you're running the full development server (`npm run dev`)
2. Check browser console for JavaScript errors
3. Verify the page loaded completely before running Python code

## 🎯 API Reference

### Launcher API
```python
await prometheos.launcher.launch_app("app_id")
await prometheos.launcher.kill_app("app_id") 
await prometheos.launcher.notify("message", "type")
```

### Dialog API
```python
await prometheos.dialog.open_dialog(
    title="Title",
    description="Description", 
    confirm_label="OK",
    cancel_label="Cancel"
)
```

### Event API
```python
await prometheos.on_event.wait_for_event("event_id", timeout=5000)
await prometheos.event.list_events()
```

### Low-Level API
```python
await prometheos.api.execute("component", "action", {"param": "value"})
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run build` to ensure everything generates correctly
5. Test the Python client with micropip
6. Submit a pull request

## 📄 License

[Your License Here]

---

**Ready to build desktop applications with Python?** Start with `npm install && npm run build && npm run dev` and you're ready to go! 🚀
