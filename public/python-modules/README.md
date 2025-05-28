# PrometheOS Python Client

A Python client library for interacting with the PrometheOS desktop environment through Pyodide.

## Installation

```python
import micropip
await micropip.install('/prometheos/python-modules/')
import prometheos
```

## Usage

```python
# Simple usage
await prometheos.launcher.notify("Hello from Python!")
await prometheos.launcher.launch_app("calculator")

# Dialog interaction
result = await prometheos.dialog.open_dialog(
    title="Python App",
    description="Hello from Python!",
    confirm_label="OK"
)
```