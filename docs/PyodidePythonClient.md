# PrometheOS Python Client for Pyodide

This document explains how to use the PrometheOS Python client within the Pyodide environment in the Python Notebook app.

## Overview

The PrometheOS Python client provides a Python API for interacting with the PrometheOS desktop environment. In the Pyodide environment, the client is loaded dynamically from the `/public/python-modules/` directory via HTTP fetch.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Python Code   │    │  Python Client  │    │  Desktop API    │
│   (Pyodide)     │◄──►│ (prometheos_    │◄──►│   Bridge        │
│                 │    │  client.py)     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## How it Works

1. **Module Loading**: The Python client is fetched from `/prometheos/python-modules/prometheos_client.py`
2. **Desktop Bridge**: The client uses JavaScript interop to access the desktop API
3. **Unified API**: Same method signatures as the TypeScript client for consistency

## Usage in Notebook

### Basic Import Pattern

```python
# Fetch and load the PrometheOS Python client
import sys
import js

# Get the base URL for fetching Python modules
window = js.globalThis
base_url = str(window.location.origin) + '/prometheos/python-modules/'

# Fetch and execute the prometheos_client.py module
response = await js.fetch(base_url + 'prometheos_client.py')
if response.ok:
    module_code = await response.text()
    exec(module_code, globals())
    print("✅ PrometheOS Python client loaded!")
else:
    raise Exception(f"Failed to fetch: {response.status}")
```

### Available APIs

Once loaded, you have access to these modules:

#### launcher
- `await launcher.notify(message, notification_type="sonner")` - Show notifications
- `await launcher.launch_app(app_id)` - Launch applications
- `await launcher.kill_app(app_id)` - Kill applications

#### dialog
- `await dialog.open_dialog(title, description, confirm_label, cancel_label)` - Open dialogs

#### event
- `await event.list_events()` - List available events

#### on_event
- `await on_event.wait_for_event(event_id, timeout)` - Wait for specific events

#### api
- `await api.execute(component_id, action_id, params)` - Low-level API access

### Example Usage

```python
# Send a notification
result = await launcher.notify("Hello from Python!", "sonner")

# Launch calculator app
result = await launcher.launch_app("calculator")

# Open a dialog
result = await dialog.open_dialog(
    title="Python Client Demo",
    description="This uses the real PrometheOS Python client!",
    confirm_label="Great!",
    cancel_label="Close"
)

# Low-level API call
result = await api.execute('launcher', 'notify', {
    'message': 'Low-level API test',
    'type': 'sonner'
})
```

## Development Workflow

### Copying Python Modules

When you modify the Python client code in `src/prometheos-client-python/`, run:

```bash
npm run copy-python
```

This copies the Python files to `public/python-modules/` where Pyodide can fetch them.

### Automatic Copying

The build and dev scripts automatically copy Python modules:

- `npm run dev` - Includes Python module copying
- `npm run build` - Includes Python module copying in production builds

### File Structure

```
public/
  python-modules/           # Copied Python modules for Pyodide
    prometheos_client.py    # Main Python client
    __init__.py            # Package init
    example_usage.py       # Usage examples

src/
  prometheos-client-python/ # Source Python client code
    prometheos_client.py    # Main implementation
    __init__.py            # Package definition
    example_usage.py       # Examples
```

## API Compatibility

The Python client provides identical functionality to the TypeScript client:

| Python | TypeScript | Description |
|--------|------------|-------------|
| `launcher.notify()` | `launcher.notify()` | Send notifications |
| `launcher.launch_app()` | `launcher.launchApp()` | Launch applications |
| `dialog.open_dialog()` | `dialog.openDialog()` | Open dialogs |
| `event.list_events()` | `event.listEvents()` | List events |
| `on_event.wait_for_event()` | `onEvent.waitForEvent()` | Wait for events |

## Error Handling

The client includes fallback mechanisms:

```python
try:
    # Try to load real client
    # ... fetch and exec code ...
except Exception as e:
    print(f"❌ Import failed: {e}")
    
    # Fallback to direct desktop API calls
    class FallbackClient:
        @staticmethod
        async def notify(message, type="sonner"):
            return await desktop.api.execute('launcher', 'notify', {
                'message': message, 
                'type': type
            })
    
    launcher = FallbackClient()
```

## Testing

The Python Notebook includes comprehensive test cases:

1. **Real PrometheOS API Test** - Tests actual client import and usage
2. **Cross-Platform Compatibility** - Validates API compatibility
3. **Desktop Integration Test** - Tests desktop environment integration
4. **Python Client Demo** - Comprehensive demo of all features

## Troubleshooting

### Module Not Found
- Ensure Python modules are copied: `npm run copy-python`
- Check browser network tab for 404 errors on `/prometheos/python-modules/`

### Import Errors
- The client includes fallback to direct `desktop.api.execute()` calls
- Check browser console for JavaScript errors

### API Call Failures
- Ensure desktop API bridge is available
- Test with basic `desktop.api.execute()` calls first

## Future Enhancements

- Automatic module reloading during development
- Type hints and better error messages
- Additional API methods as they're added to the desktop system
- Performance optimizations for large Python modules
