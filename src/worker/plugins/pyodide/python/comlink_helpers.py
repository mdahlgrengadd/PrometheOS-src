import js
from pyodide.ffi import create_proxy, to_js


class ComlinkHelper:
    """Improved Comlink communication helper for Python"""

    @staticmethod
    def expose(obj, name="pythonExports"):
        """Expose a Python object to JavaScript via Comlink"""
        try:
            js_proxy = create_proxy(obj)
            # Make it available globally
            js.globalThis[name] = js_proxy
            print(f"Exposed Python object as {name} via Comlink")
            return True
        except Exception as e:
            print(f"Error exposing object: {e}")
            return False

    @staticmethod
    def get_proxy(name):
        """Get a JavaScript object/function via Comlink"""
        try:
            if hasattr(js.globalThis, name):
                return getattr(js.globalThis, name)
            print(f"Object {name} not found in global scope")
            return None
        except Exception as e:
            print(f"Error getting proxy: {e}")
            return None


# ComlinkHelper class is now available globally
# It will be attached to the desktop object when the desktop object is created in bridge_init.py

print("Python-Comlink integration enhanced")
