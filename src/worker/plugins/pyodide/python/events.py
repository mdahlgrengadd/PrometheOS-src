# ----------------------------------------------------
# Events System
# ----------------------------------------------------

class Events:
    """EventBus integration"""

    @staticmethod
    async def emit(event_name, data=None):
        """Emit an event to the desktop EventBus"""
        try:
            # Safely get Comlink bridge from globalThis
            api_comlink = getattr(js.globalThis, 'desktop_api_comlink', None)
            if api_comlink is None:
                raise Exception("Comlink API bridge not available")

            # Convert data for JS
            js_data = to_js(data) if data is not None else None

            # Direct call to emit
            await api_comlink.emitEvent(event_name, js_data)
            return {'success': True, 'message': f'Event {event_name} emitted'}
        except Exception as e:
            print(f"Error emitting event {event_name} via Comlink: {e}")
            # Fallback to postMessage (will be available from combined script)
            return {'success': False, 'error': 'Comlink bridge not available'}
    
    @staticmethod
    async def subscribe(event_name, callback):
        """Subscribe to desktop events"""
        # Will reference DesktopAPI when combined
        return None

class EventsLegacy:
    """EventBus integration via postMessage"""
    
    @staticmethod
    def emit(event_name, data=None):
        """Emit an event to the desktop EventBus"""
        try:
            from js import postMessage
            import uuid
            request_id = str(uuid.uuid4())
            
            message = to_js({
                'type': 'desktop-api-request',
                'requestId': request_id,
                'method': 'emit_event',
                'params': to_js({
                    'eventName': event_name,
                    'data': to_js(data) if data is not None else None
                })
            })
            postMessage(message)
            
            return {'success': True, 'message': f'Event {event_name} emitted'}
            
        except Exception as e:
            print(f"Error emitting event {event_name}: {e}")
            return {'success': False, 'error': str(e)}
    
    @staticmethod
    def subscribe(event_name, callback):
        """Subscribe to desktop events"""
        # Will reference DesktopAPILegacy when combined
        return lambda: None
