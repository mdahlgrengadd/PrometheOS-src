import { detectFileOperations } from "./fileOperationDetector";

interface PythonFunction {
  name: string;
  parameters: string[];
  required: string[];
  metadata?: any;
}

export const processUserScriptWithAST = async (
  userScript: string,
  pyodide: any,
  ignoreMissingFiles: boolean = false
): Promise<{
  spec: any;
  functions: PythonFunction[];
  missingFiles?: string[];
  requiresConfirmation?: boolean;
}> => {
  if (!pyodide) throw new Error("Pyodide not available");

  try {
    pyodide.globals.set("user_script", userScript);

    const specJson = await pyodide.runPythonAsync(`
import ast
import json
import inspect
from typing import get_type_hints, Any, Union, Optional, List, Dict
from js import console

def get_python_type_to_json_schema(annotation):
    """Convert Python type annotations to JSON schema types with better type handling"""
    # Handle basic types
    if annotation == int:
        return {"type": "integer", "format": "int64"}
    elif annotation == float:
        return {"type": "number", "format": "double"}
    elif annotation == str:
        return {"type": "string"}
    elif annotation == bool:
        return {"type": "boolean"}
    elif annotation == bytes:
        return {"type": "string", "format": "byte"}
    
    # Handle typing module types
    if hasattr(annotation, '__origin__'):
        origin = annotation.__origin__
        args = getattr(annotation, '__args__', ())
        
        if origin is list or origin is List:
            item_type = args[0] if args else str
            return {
                "type": "array",
                "items": get_python_type_to_json_schema(item_type)
            }
        elif origin is dict or origin is Dict:
            key_type = args[0] if len(args) > 0 else str
            value_type = args[1] if len(args) > 1 else str
            return {
                "type": "object",
                "additionalProperties": get_python_type_to_json_schema(value_type)
            }
        elif origin is tuple:
            return {
                "type": "array",
                "items": {"type": "string"},
                "minItems": len(args),
                "maxItems": len(args)
            }
        elif origin is Union:
            # Handle Optional types (Union[T, None])
            non_none_types = [arg for arg in args if arg != type(None)]
            if len(non_none_types) == 1:
                schema = get_python_type_to_json_schema(non_none_types[0])
                schema["nullable"] = True
                return schema
            else:
                # Multiple union types
                return {
                    "oneOf": [get_python_type_to_json_schema(arg) for arg in non_none_types]
                }
    
    # Handle string type annotations
    if isinstance(annotation, str):
        if annotation == 'int':
            return {"type": "integer"}
        elif annotation == 'float':
            return {"type": "number"}
        elif annotation == 'str':
            return {"type": "string"}
        elif annotation == 'bool':
            return {"type": "boolean"}
        elif annotation.startswith('List[') or annotation.startswith('list['):
            return {"type": "array", "items": {"type": "string"}}
        elif annotation.startswith('Dict[') or annotation.startswith('dict['):
            return {"type": "object"}
    
    # Default fallback
    return {"type": "string"}

def extract_function_metadata(node):
    """Extract detailed metadata from AST function node"""
    metadata = {
        "name": node.name,
        "docstring": None,
        "decorators": [],
        "line_number": node.lineno,
        "is_async": isinstance(node, ast.AsyncFunctionDef)
    }
    
    # Extract docstring
    if (node.body and isinstance(node.body[0], ast.Expr) and 
        isinstance(node.body[0].value, ast.Constant) and 
        isinstance(node.body[0].value.value, str)):
        metadata["docstring"] = node.body[0].value.value
    
    # Extract decorators
    for decorator in node.decorator_list:
        if isinstance(decorator, ast.Name):
            metadata["decorators"].append(decorator.id)
        elif isinstance(decorator, ast.Attribute):
            metadata["decorators"].append(f"{decorator.attr}")
    
    return metadata

def safe_exec_for_analysis(script_content, ignore_missing_files=False):
    """Safely execute script for analysis, handling common runtime errors"""
    missing_files = []
    
    try:
        # Check for file operations first using Python regex
        import re
        file_patterns = [
            r'open\\s*\\(\\s*["\\\']([^"\\\']+)["\\\']',
            r'pd\\.read_csv\\s*\\(\\s*["\\\']([^"\\\']+)["\\\']',
            r'pd\\.read_excel\\s*\\(\\s*["\\\']([^"\\\']+)["\\\']',
            r'np\\.loadtxt\\s*\\(\\s*["\\\']([^"\\\']+)["\\\']',
            r'with\\s+open\\s*\\(\\s*["\\\']([^"\\\']+)["\\\']'
        ]
        
        detected_files = set()
        for pattern in file_patterns:
            matches = re.findall(pattern, script_content)
            detected_files.update(matches)
        
        detected_files_list = list(detected_files)
        console.log(f"Detected file operations: {detected_files_list}")
        
        if detected_files_list and not ignore_missing_files:
            # Return missing files list for user confirmation
            return False, detected_files_list
        
        # Create mock objects for file operations if ignoring missing files
        mock_globals = {
            '__builtins__': __builtins__,
        }
        
        if ignore_missing_files:
            # Mock file operations
            def mock_open(*args, **kwargs):
                class MockFile:
                    def read(self): return ""
                    def readline(self): return ""
                    def readlines(self): return []
                    def write(self, data): pass
                    def close(self): pass
                    def __enter__(self): return self
                    def __exit__(self, *args): pass
                return MockFile()
            
            mock_globals['open'] = mock_open
        
        # Try to execute with mocks first
        exec(script_content, mock_globals)
        
        # If that works, execute in real globals for function inspection
        exec(script_content, globals())
        return True, []
        
    except FileNotFoundError as e:
        console.log(f"File operation detected during analysis: {e}")
        # Extract filename from error
        import re
        match = re.search(r"'([^']+)'", str(e))
        if match:
            missing_files.append(match.group(1))
        return False, missing_files
    except Exception as e:
        console.log(f"Script execution failed during analysis: {e}")
        if not ignore_missing_files:
            return False, []
        return True, []

# Parse the user script using AST
console.log("Starting AST analysis...")
tree = ast.parse(user_script)

# Try to execute the script safely for function inspection
execution_successful, missing_files = safe_exec_for_analysis(user_script, ${
      ignoreMissingFiles ? "True" : "False"
    })

result = None

if not execution_successful and missing_files:
    # Return missing files for user confirmation
    result = json.dumps({"missing_files": missing_files, "requires_confirmation": True})
else:
    # Continue with normal processing
    # Discover functions and their signatures using AST + runtime inspection
    paths = {}
    function_info = []

    console.log(f"Found {len([n for n in tree.body if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef))])} function definitions")

    for node in tree.body:
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            func_name = node.name
            
            # Skip private functions
            if func_name.startswith('_'):
                console.log(f"Skipping private function: {func_name}")
                continue
            
            try:
                # Extract AST metadata
                metadata = extract_function_metadata(node)
                console.log(f"Processing function: {func_name}")
                
                # Try to get the actual function object for runtime inspection
                func_obj = None
                type_hints = {}
                sig = None
                
                if execution_successful:
                    func_obj = globals().get(func_name)
                    if func_obj:
                        try:
                            type_hints = get_type_hints(func_obj)
                            sig = inspect.signature(func_obj)
                        except Exception as e:
                            console.log(f"Could not get runtime info for {func_name}: {e}")
                
                # Build parameter schema using AST analysis
                properties = {}
                required = []
                
                # Use AST to extract parameters
                for arg in node.args.args:
                    param_name = arg.arg
                    
                    # Get type from AST annotation or type hints
                    param_type = str
                    if arg.annotation:
                        if isinstance(arg.annotation, ast.Name):
                            type_name = arg.annotation.id
                            if type_name == 'int':
                                param_type = int
                            elif type_name == 'float':
                                param_type = float
                            elif type_name == 'str':
                                param_type = str
                            elif type_name == 'bool':
                                param_type = bool
                    elif func_obj and param_name in type_hints:
                        param_type = type_hints[param_name]
                    
                    param_schema = get_python_type_to_json_schema(param_type)
                    
                    # Add description from docstring if available
                    if metadata["docstring"]:
                        param_schema["description"] = f"Parameter for {func_name}"
                    
                    # Check if parameter has default value
                    defaults_start = len(node.args.args) - len(node.args.defaults)
                    param_index = node.args.args.index(arg)
                    
                    if param_index < defaults_start:
                        required.append(param_name)
                    else:
                        # Has default value
                        default_index = param_index - defaults_start
                        if default_index < len(node.args.defaults):
                            default_node = node.args.defaults[default_index]
                            if isinstance(default_node, ast.Constant):
                                param_schema["default"] = default_node.value
                    
                    properties[param_name] = param_schema
                
                # Get return type
                return_type = str
                if node.returns:
                    if isinstance(node.returns, ast.Name):
                        type_name = node.returns.id
                        if type_name == 'int':
                            return_type = int
                        elif type_name == 'float':
                            return_type = float
                        elif type_name == 'str':
                            return_type = str
                        elif type_name == 'bool':
                            return_type = bool
                elif func_obj and 'return' in type_hints:
                    return_type = type_hints['return']
                
                return_schema = get_python_type_to_json_schema(return_type)
                
                # Create OpenAPI path with enhanced metadata
                operation = {
                    "operationId": func_name,
                    "summary": f"Call {func_name} function",
                    "description": metadata["docstring"] or f"Execute the {func_name} Python function with type-safe parameters",
                    "tags": ["python-functions"],
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": properties,
                                    "required": required,
                                    "additionalProperties": False
                                }
                            }
                        }
                    },                    "responses": {
                        "200": {
                            "description": "Function execution result (success or error)",
                            "content": {
                                "application/json": {
                                    "schema": {"$ref": "#/components/schemas/Result"}
                                }
                            }
                        },
                        "400": {
                            "description": "Invalid request format",
                            "content": {
                                "application/json": {
                                    "schema": {"$ref": "#/components/schemas/Result"}
                                }
                            }
                        }
                    }
                }
                
                if metadata["is_async"]:
                    operation["description"] += " (Async function)"
                
                paths[f"/{func_name}"] = {"post": operation}
                
                function_info.append({
                    "name": func_name,
                    "parameters": list(properties.keys()),
                    "required": required,
                    "metadata": metadata
                })
                
                console.log(f"Successfully processed function: {func_name}")
                
            except Exception as e:
                console.log(f"Error processing function {func_name}: {e}")
                import traceback
                traceback.print_exc()
                continue

    # Create enhanced OpenAPI spec
    spec = {
        "openapi": "3.0.0",
        "info": {
            "title": "Python Script API",
            "version": "1.0.0",
            "description": "Auto-generated API from Python script using AST analysis and FFI type preservation"
        },
        "servers": [
            {
                "url": "/api",
                "description": "Local Pyodide runtime"
            }
        ],
        "paths": paths,        "components": {
            "schemas": {
                "Result": {
                    "type": "object",
                    "properties": {
                        "type": {
                            "type": "string",
                            "enum": ["success_with_output", "function_result", "error", "error_with_output"],
                            "description": "The type of execution result"
                        },                        "result": {
                            "description": "The actual return value from the Python function (null for void functions)",
                            "nullable": True
                        },
                        "stdout": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Array of stdout output lines (when available)"
                        },
                        "error": {
                            "type": "string",
                            "description": "Error message (when type is 'error' or 'error_with_output')"
                        }
                    },                    "required": ["type"],
                    "additionalProperties": False,
                    "description": "Unified response format for all Python function executions. Check the 'type' field to determine if it's a success or error response."
                }
            }
        }
    }

    console.log(f"Generated OpenAPI spec with {len(paths)} endpoints")
    result = json.dumps({"spec": spec, "functions": function_info})

result
    `);

    const specJsonResult = JSON.parse(specJson);

    // Check if we need user confirmation for missing files
    if (specJsonResult.requires_confirmation) {
      return {
        spec: null,
        functions: [],
        missingFiles: specJsonResult.missing_files,
        requiresConfirmation: true,
      };
    }

    return {
      spec: specJsonResult.spec,
      functions: specJsonResult.functions,
    };
  } catch (err: any) {
    throw new Error(`Failed to parse Python script with AST: ${err.message}`);
  }
};
