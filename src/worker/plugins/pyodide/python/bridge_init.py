# Import components (will be loaded together by the TypeScript loader)
# Classes will be available from previous executions in the same context

# Create legacy instances (safely check if classes exist)
try:
    desktop_api_legacy = DesktopAPILegacy()
    events_legacy = EventsLegacy()
except NameError as e:
    print(f"Warning: Some classes not available during initialization: {e}")
    desktop_api_legacy = None
    events_legacy = None

# Create the desktop module structure


class Desktop:
    def __init__(self):
        # Safely initialize API components
        try:
            self.api = DesktopAPI()
        except NameError:
            self.api = None
            print("Warning: DesktopAPI not available")

        try:
            self.events = Events()
        except NameError:
            self.events = None
            print("Warning: Events not available")

        try:
            self.mcp = MCPProtocol()
        except NameError:
            self.mcp = None
            print("Warning: MCPProtocol not available")

        try:
            self.comlink = ComlinkHelper()
        except NameError:
            self.comlink = None
            print("Warning: ComlinkHelper not available")

        # Legacy access for backward compatibility
        self.api_legacy = desktop_api_legacy
        self.events_legacy = events_legacy


# Make it available globally
desktop = Desktop()


def handle_desktop_api_response(message):
    """Handle responses from the main thread API"""
    try:
        if message.get('type') == 'desktop-api-response':
            print(f"Received API response: {message}")
            # Could store results in a promise-like structure here

        elif message.get('type') == 'desktop-api-event':
            # Handle event notifications
            event_name = message.get('eventName')
            data = message.get('data')

            # Safely check for event callbacks
            try:
                if hasattr(DesktopAPILegacy, '_event_callbacks') and event_name in DesktopAPILegacy._event_callbacks:
                    callback = DesktopAPILegacy._event_callbacks[event_name]
                    callback(data)
            except NameError:
                print("Warning: DesktopAPILegacy not available for event handling")

        elif message.get('type') == 'mcp-protocol-response':
            # Handle MCP protocol responses
            print(f"Received MCP protocol response: {message.get('message')}")
            # Could integrate with a promise system here

    except Exception as e:
        print(f"Error handling API response: {e}")


print("Hybrid Desktop API Bridge initialized in Python context")
