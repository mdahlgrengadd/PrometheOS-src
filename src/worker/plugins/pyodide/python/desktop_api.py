import js
from pyodide.ffi import create_proxy, to_js, JsProxy
import json
import uuid

print("Starting Hybrid Desktop API bridge setup...")

# ----------------------------------------------------
# 1. Desktop API Layer (Comlink - Ergonomic Interface)
# ----------------------------------------------------


class DesktopAPI:
    """Python interface to Desktop Dreamscape APIs using Comlink"""

    @staticmethod
    async def list_components():
        """List all available API components"""
        try:
            # Safely get Comlink bridge from globalThis
            api_comlink = getattr(js.globalThis, 'desktop_api_comlink', None)
            if api_comlink is None:
                raise Exception("Comlink API bridge not available")

            # Direct call to the Comlink proxy
            result = await api_comlink.listComponents()
            return result.to_py()
        except Exception as e:
            print(f"Error listing components via Comlink: {e}")
            # Fallback to postMessage (will be available from combined script)
            # return desktop_api_legacy.list_components()
            return {'success': False, 'error': 'Comlink bridge not available'}

    @staticmethod
    async def execute(component_id, action, params=None):
        """Execute an action on a component"""
        try:
            if params is None:
                params = {}

            # Safely get Comlink bridge from globalThis
            api_comlink = getattr(js.globalThis, 'desktop_api_comlink', None)
            if api_comlink is None:
                raise Exception("Comlink API bridge not available")

            # Convert Python dict to JS object with proper conversion
            js_params = to_js(params)

            # Direct call that returns the actual result
            result = await api_comlink.execute(component_id, action, js_params)
            return result.to_py()
        except Exception as e:
            print(f"Error executing {component_id}.{action} via Comlink: {e}")
            # Fallback to postMessage (will be available from combined script)
            return {'success': False, 'error': 'Comlink bridge not available'}

    @staticmethod
    async def subscribe_event(event_name, callback):
        """Subscribe to EventBus events"""
        try:
            proxy_callback = create_proxy(callback)

            # Safely get Comlink bridge from globalThis
            api_comlink = getattr(js.globalThis, 'desktop_api_comlink', None)
            if api_comlink is None:
                raise Exception("Comlink API bridge not available")

            # Direct call to subscribe
            unsubscribe = await api_comlink.subscribeEvent(event_name, proxy_callback)

            # Convert the JS function to a Python callable
            def python_unsubscribe():
                try:
                    unsubscribe()
                    proxy_callback.destroy()
                except Exception as e:
                    print(f"Error unsubscribing: {e}")

            return python_unsubscribe
        except Exception as e:
            print(f"Error subscribing to event {event_name} via Comlink: {e}")
            # Fallback to postMessage (will be available from combined script)
            return lambda: None
