# ----------------------------------------------------
# Legacy Desktop API (postMessage - Compatibility)
# ----------------------------------------------------

class DesktopAPILegacy:
    """Python interface to PromethOS APIs using postMessage"""

    @staticmethod
    def list_components():
        """List all available API components"""
        try:
            from js import postMessage
            request_id = str(uuid.uuid4())

            # Convert Python dict to JS object using to_js
            message = to_js({
                'type': 'desktop-api-request',
                'requestId': request_id,
                'method': 'list_components'
            })
            # Send request to main thread via postMessage
            postMessage(message)

            print(f"API request sent: list_components")
            return {'success': True, 'message': 'Request sent to main thread'}

        except Exception as e:
            print(f"Error listing components: {e}")
            return {'success': False, 'error': str(e)}

    @staticmethod
    def execute(component_id, action, params=None):
        """Execute an action on a component"""
        try:
            if params is None:
                params = {}

            from js import postMessage
            import uuid
            request_id = str(uuid.uuid4())

            # Convert Python dict to JS object using to_js, with proper nested conversion
            message = to_js({
                'type': 'desktop-api-request',
                'requestId': request_id,
                'method': 'execute_action',
                'params': to_js({
                    'componentId': component_id,
                    'action': action,
                    'params': to_js(params)
                })
            })

            # Send request to main thread via postMessage
            postMessage(message)

            print(f"Sent API request: {component_id}.{action}")
            return {'success': True, 'message': 'Request sent to main thread'}

        except Exception as e:
            print(f"Error executing {component_id}.{action}: {e}")
            return {'success': False, 'error': str(e)}

    @staticmethod
    def subscribe_event(event_name, callback):
        """Subscribe to EventBus events"""
        try:
            proxy_callback = create_proxy(callback)

            from js import postMessage
            import uuid
            request_id = str(uuid.uuid4())

            # Store callback for later use
            if not hasattr(DesktopAPILegacy, '_event_callbacks'):
                DesktopAPILegacy._event_callbacks = {}
            DesktopAPILegacy._event_callbacks[event_name] = proxy_callback

            # Send subscription request via postMessage
            message = to_js({
                'type': 'desktop-api-request',
                'requestId': request_id,
                'method': 'subscribe_event',
                'params': to_js({
                    'eventName': event_name
                })
            })
            postMessage(message)

            def unsubscribe():
                if hasattr(DesktopAPILegacy, '_event_callbacks') and event_name in DesktopAPILegacy._event_callbacks:
                    del DesktopAPILegacy._event_callbacks[event_name]
                    proxy_callback.destroy()
                    # Could send unsubscribe message here if needed

            return unsubscribe

        except Exception as e:
            print(f"Error subscribing to event {event_name}: {e}")
            return lambda: None
