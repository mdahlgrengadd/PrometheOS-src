# ----------------------------------------------------
# MCP Protocol Layer (JSON-RPC 2.0 Interface)
# ----------------------------------------------------

class MCPProtocol:
    """Python interface to MCP protocol (JSON-RPC 2.0)"""

    @staticmethod
    async def send(message):
        """Send a raw MCP protocol message (JSON-RPC 2.0 format)"""
        try:
            # Ensure message is properly formatted as JSON-RPC 2.0
            if not isinstance(message, dict):
                raise ValueError("Message must be a dictionary")

            if not message.get('jsonrpc') == '2.0':
                message['jsonrpc'] = '2.0'

            if 'id' not in message:
                message['id'] = str(uuid.uuid4())

            # Convert to JS object - use JSON serialization to avoid JsProxy issues
            import json
            js_message_json = json.dumps(message)

            # Debug: Log the message being sent
            print(f"Sending MCP message: {message}")
            print(f"JSON message: {js_message_json}")

            # Forward to MCP handler in worker via the exposed plugin instance
            # Access the plugin instance from pyodide globals (use js.globalThis, not Python globals())
            plugin_instance = js.globalThis._pyodide_plugin_instance
            if plugin_instance is None:
                raise Exception("Pyodide plugin instance not available")

            # Pass the JSON string instead of JsProxy
            result = await plugin_instance.handleMCPProtocolMessage(js_message_json)

            # Extract the actual response from the PythonResult wrapper
            if hasattr(result, 'success') and result.success and hasattr(result, 'result'):
                return result.result.to_py() if hasattr(result.result, 'to_py') else result.result
            elif hasattr(result, 'error'):
                return {'jsonrpc': '2.0', 'error': {'code': -32603, 'message': result.error}, 'id': message.get('id')}
            else:
                return {'jsonrpc': '2.0', 'error': {'code': -32603, 'message': 'Internal error'}, 'id': message.get('id')}

        except Exception as e:
            print(f"Error sending MCP message: {e}")
            return {'jsonrpc': '2.0', 'error': {'code': -32603, 'message': str(e)}, 'id': message.get('id')}

    @staticmethod
    async def tools_list():
        """Get list of available tools via MCP protocol"""
        message = {
            'jsonrpc': '2.0',
            'method': 'tools/list',
            'id': str(uuid.uuid4())
        }
        return await MCPProtocol.send(message)

    @staticmethod
    async def tools_call(tool_name, arguments=None):
        """Call a tool via MCP protocol"""
        if arguments is None:
            arguments = {}

        message = {
            'jsonrpc': '2.0',
            'method': 'tools/call',
            'params': {
                'name': tool_name,
                'arguments': arguments
            },
            'id': str(uuid.uuid4())
        }
        return await MCPProtocol.send(message)

    @staticmethod
    async def resources_list():
        """List available resources via MCP protocol"""
        message = {
            'jsonrpc': '2.0',
            'method': 'resources/list',
            'id': str(uuid.uuid4())
        }
        return await MCPProtocol.send(message)
