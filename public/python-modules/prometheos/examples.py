"""
Example usage of the PrometheOS Python client

This demonstrates how to use the Python client in both import styles:
1. Import the generated client components
2. Use the convenience wrapper functions
"""

import asyncio
from prometheos_client import services, api

async def example_basic_usage():
    """Basic usage examples"""
    
    # Launch an application (recommended: use services)
    try:
        result = await services.launch_app("audioplayer")
        print(f"Launched app: {result}")
    except Exception as e:
        print(f"Failed to launch app: {e}")
    
    # Show a notification (recommended: use services)
    try:
        await services.notify("Hello from Python!", "radix")
        print("Notification sent successfully")
    except Exception as e:
        print(f"Failed to send notification: {e}")
    
    # Open a dialog (recommended: use services)
    try:
        result = await services.open_dialog(
            title="Python Dialog",
            description="This dialog was opened from Python!",
            confirm_label="OK",
            cancel_label="Cancel"
        )
        print(f"Dialog result: {result}")
    except Exception as e:
        print(f"Failed to open dialog: {e}")

async def example_event_handling():
    """Event handling examples"""
    
    # List available events (recommended: use services)
    try:
        events = await services.list_events()
        print(f"Available events: {events}")
    except Exception as e:
        print(f"Failed to list events: {e}")
    
    # Wait for a specific event (recommended: use services)
    try:
        result = await services.wait_for_event("app-launched", timeout=5000)
        print(f"Event received: {result}")
    except Exception as e:
        print(f"Failed to wait for event: {e}")

async def example_low_level_api():
    """Low-level API access examples"""
    
    # Direct API calls
    try:
        # Kill an app using low-level API
        result = await api.execute("services", "killApp", {"appId": "audioplayer"})
        print(f"Kill app result: {result}")
    except Exception as e:
        print(f"Failed to execute API call: {e}")

async def main():
    """Main example function"""
    print("🐍 PrometheOS Python Client Examples")
    print("=" * 40)
    
    print("\n1. Basic Usage (Recommended):")
    await example_basic_usage()
    
    print("\n2. Event Handling:")
    await example_event_handling()
    
    print("\n3. Low-level API:")
    await example_low_level_api()

# Run examples (only in Pyodide environment)
if __name__ == "__main__":
    try:
        # In Pyodide, we need to use asyncio differently
        import js
        if hasattr(js, 'desktop'):
            asyncio.create_task(main())
        else:
            print("⚠️  Desktop API not available. Run this in the PrometheOS environment.")
    except ImportError:
        print("⚠️  This example requires the Pyodide environment.")
