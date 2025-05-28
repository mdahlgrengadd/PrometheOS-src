import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Code,
  FileText,
  Folder,
  Play,
} from "lucide-react";
import React, { useEffect, useState } from "react";

import { workerPluginManager } from "../../WorkerPluginManagerClient";
import { PyodideNotebook } from "./notebook/PyodideNotebook";

interface TestCase {
  id: string;
  name: string;
  description: string;
  code: string;
  type: "code" | "markdown";
}

interface TestCategory {
  id: string;
  name: string;
  icon: React.ComponentType<{ size?: string | number; className?: string }>;
  expanded: boolean;
  cases: TestCase[];
}

const testCategories: TestCategory[] = [
  {
    id: "basic",
    name: "Basic Tests",
    icon: Play,
    expanded: true,
    cases: [
      {
        id: "hello-world",
        name: "Hello World",
        description: "Simple Python execution",
        type: "code",
        code: 'print("Hello from Python!")\n2 + 2',
      },
      {
        id: "json-processing",
        name: "JSON Processing",
        description: "Test JSON manipulation",
        type: "code",
        code: 'import json\ndata = {"message": "Hello from Python", "numbers": [1, 2, 3]}\njson.dumps(data, indent=2)',
      },
    ],
  },
  {
    id: "api-tests",
    name: "Desktop API Tests",
    icon: Code,
    expanded: true,
    cases: [
      {
        id: "enhanced-prometheos-client",
        name: "Enhanced PrometheOS Client",
        description: "Test enhanced initialization and features",
        type: "code",
        code: `# Enhanced PrometheOS Client Test
print("=== Enhanced PrometheOS Client Test ===")

try:
    # Install via micropip
    import micropip
    await micropip.install("http://localhost:8080/prometheos/wheels/prometheos-1.0.0-py3-none-any.whl")
    
    # Import the enhanced client
    import prometheos
    print("✓ Enhanced PrometheOS client imported")
    
    # Test initialization patterns
    print("\\n🔧 Testing initialization patterns...")
    
    # Method 1: Auto-initialization
    init_success = prometheos.initialize()
    print(f"Auto-init result: {init_success}")
    
    # Check availability
    available = prometheos.is_available()
    print(f"Client available: {available}")
    
    if available:
        # Test enhanced error handling
        try:
            result = await prometheos.launcher.notify("Enhanced client working!")
            print(f"✓ Notification: {result}")
        except Exception as e:
            print(f"Notification error: {e}")
        
        # Test dialog with enhanced error handling
        try:
            result = await prometheos.dialog.open_dialog(
                "Enhanced Test",
                "Enhanced PrometheOS client is working with improved initialization!"
            )
            print(f"✓ Dialog: {result}")
        except Exception as e:
            print(f"Dialog error: {e}")
    else:
        print("⚠️ Client not available - checking debugging info...")
        print(f"Available functions: {[x for x in dir(prometheos) if not x.startswith('_')]}")
        
        # Try manual initialization
        if 'desktop' in globals():
            manual_init = prometheos.initialize(desktop)
            print(f"Manual init with desktop: {manual_init}")
    
    print("\\n🎉 Enhanced client test complete!")
    
except Exception as e:
    print(f"✗ Enhanced test failed: {e}")
    import traceback
    traceback.print_exc()`,
      },
      {
        id: "api-verification",
        name: "API Verification",
        description: "Check if desktop API is available",
        type: "code",
        code: `# Desktop API Verification
print("=== Desktop API Verification ===")

try:
    print(f"Desktop object: {type(desktop)}")
    print(f"Desktop API: {type(desktop.api)}")
    print(f"Desktop Events: {type(desktop.events)}")
    print("✓ Desktop object is available")
except NameError as e:
    print(f"✗ Desktop object not found: {e}")

print("=== Verification Complete ===")`,
      },
      {
        id: "api-notification-test",
        name: "Notification Test",
        description: "Send a test notification",
        type: "code",
        code: `# Notification Test
print("=== Notification Test ===")

try:
    result = await desktop.api.execute("launcher", "notify", {
        "message": "Hello from Python!",
        "type": "sonner"
    })
    print(f"✓ Notification sent: {result}")
except Exception as e:
    print(f"✗ Failed: {e}")`,
      },
      {
        id: "api-calculator-test",
        name: "Calculator Test",
        description: "Test calculator API",
        type: "code",
        code: `# Calculator Test
print("=== Calculator Test ===")

try:
    result = await desktop.api.execute("calculator", "add", {"a": 15, "b": 27})
    print(f"Raw response: {result}")
    
    # Extract result value
    if isinstance(result, dict):
        if result.get("Success") is False:
            raise Exception(f"Calculator error: {result.get('Error', 'Unknown')}")
        actual_result = result.get("Result", result.get("result", result))
    else:
        actual_result = result
    
    print(f"✓ 15 + 27 = {actual_result}")
    if actual_result == 42:
        print("✓ Result is correct")
except Exception as e:
    print(f"✗ Failed: {e}")
    print("(Calculator app may need to be opened first)")`,
      },
    ],
  },
  {
    id: "prometheos-client",
    name: "PrometheOS Python Client",
    icon: Code,
    expanded: true,
    cases: [
      {
        id: "micropip-install",
        name: "Micropip Install",
        description: "Install PrometheOS client using micropip with wheel",
        type: "code",
        code: `# PrometheOS Client Installation with Micropip
print("=== PrometheOS Client Installation ===")

try:
    import micropip
    import js
    
    # Get the wheel URL from the current server
    window = js.globalThis
    base_url = str(window.location.origin)
    wheel_url = f"{base_url}/prometheos/wheels/prometheos-1.0.0-py3-none-any.whl"
    
    print(f"📦 Installing from wheel: {wheel_url}")
    
    # Install the package using micropip
    await micropip.install(wheel_url)
    
    print("✓ PrometheOS package installed successfully!")
    
    # Now import the package
    import prometheos
    print("✓ PrometheOS client imported successfully!")
      # Initialize the client - using enhanced initialization
    print("\\n🔧 Initializing PrometheOS client...")
    
    # Method 1: Auto-initialization (enhanced detection)
    try:
        if prometheos.initialize():
            print("✓ Auto-initialization successful")
        else:
            print("⚠️ Auto-initialization failed, trying manual...")
            
            # Method 2: Manual initialization with desktop object
            if 'desktop' in globals():
                prometheos.initialize(desktop)
                print("✓ Manual initialization with desktop object successful")
            else:
                print("✗ No desktop object found")
    except Exception as e:
        print(f"⚠️ Initialization error: {e}")
    
    # Test basic functionality
    print("\\n🧪 Testing client functionality...")
    
    # Check if client is available
    if prometheos.is_available():
        print("✓ PrometheOS client is available and ready")
        
        # Test notification
        result = await prometheos.launcher.notify("Hello from enhanced PrometheOS client!")
        print(f"✓ Notification test: {result}")
        
        # Test dialog
        result = await prometheos.dialog.open_dialog(
            "Enhanced Success", 
            "PrometheOS client with enhanced initialization working!"
        )
        print(f"✓ Dialog test: {result}")
        
        print("\\n🎉 Enhanced micropip installation successful!")
    else:
        print("✗ PrometheOS client not properly initialized")
        print("Available functions:", dir(prometheos))
        raise Exception("Client initialization failed")
    
except Exception as e:
    print(f"✗ Micropip installation failed: {e}")
    print("\\nFalling back to direct import...")
    
    # Fallback to direct import
    try:
        window = js.globalThis
        base_url = str(window.location.origin) + '/prometheos/python-modules/'
        
        response = await js.fetch(base_url + 'prometheos/__init__.py')
        if response.ok:
            module_code = await response.text()
            exec(module_code, globals())
            print("✓ Fallback: Direct import successful!")
            
            # Test the imported module
            if 'launcher' in globals():
                result = await launcher.notify("Fallback import successful!")
                print(f"✓ Fallback test: {result}")
                
        else:
            print(f"✗ Fallback failed: {response.status}")
    except Exception as fallback_error:
        print(f"✗ Fallback error: {fallback_error}")`,
      },
      {
        id: "direct-import",
        name: "Direct Import (Backup)",
        description: "Import PrometheOS client via direct module loading",
        type: "code",
        code: `# PrometheOS Client Direct Import (Backup Method)
print("=== PrometheOS Client Direct Import ===")

try:
    import js
    
    # Get base URL for the Python modules
    window = js.globalThis
    base_url = str(window.location.origin) + '/prometheos/python-modules/'
    print(f"🌐 Loading from: {base_url}")
    
    # Fetch and load the PrometheOS module directly
    response = await js.fetch(base_url + 'prometheos/__init__.py')
    if response.ok:
        module_code = await response.text()
        exec(module_code, globals())
        print("✓ PrometheOS client loaded successfully!")
        
        # Test basic functionality
        print("\\n🧪 Testing client functionality...")
        
        # Test notification
        if 'launcher' in globals():
            result = await launcher.notify("PrometheOS Python client is working!")
            print(f"✓ Notification test: {result}")
        
        # Test dialog
        if 'dialog' in globals():
            result = await dialog.open_dialog("Direct Import Success", "PrometheOS Python client loaded successfully!")
            print(f"✓ Dialog test: {result}")
        
        print("\\n🎉 PrometheOS Python client is ready!")
        
    else:
        print(f"✗ Failed to fetch module: {response.status}")
        
except Exception as e:
    print(f"✗ Import failed: {e}")`,
      },
      {
        id: "client-api-demo",
        name: "API Demo",
        description: "Demonstrate PrometheOS client APIs",
        type: "code",
        code: `# PrometheOS Client API Demo
print("=== PrometheOS Client API Demo ===")

try:
    import js
    
    # Load the PrometheOS client
    window = js.globalThis
    base_url = str(window.location.origin) + '/prometheos/python-modules/'
    
    response = await js.fetch(base_url + 'prometheos/__init__.py')
    if response.ok:
        module_code = await response.text()
        exec(module_code, globals())
        print("✓ PrometheOS client loaded")
    else:
        raise Exception(f"Failed to load client: {response.status}")
    
    # Demo 1: Launcher API
    print("\\n🚀 Launcher API Demo:")
    try:
        result = await launcher.notify("Demo notification from Python!", "sonner")
        print(f"  ✓ Notification: {result}")
        
        result = await launcher.launch_app("calculator")
        print(f"  ✓ Launch calculator: {result}")
    except Exception as e:
        print(f"  ✗ Launcher error: {e}")
    
    # Demo 2: Dialog API
    print("\\n💬 Dialog API Demo:")
    try:
        result = await dialog.open_dialog(
            title="Python API Demo",
            description="This demonstrates the PrometheOS Python client in action!",
            confirm_label="Awesome!",
            cancel_label="Close"
        )
        print(f"  ✓ Dialog result: {result}")
    except Exception as e:
        print(f"  ✗ Dialog error: {e}")
    
    print("\\n🎉 API Demo Complete!")
    
except Exception as e:
    print(f"✗ Demo failed: {e}")`,
      },
    ],
  },
  {
    id: "documentation",
    name: "Documentation",
    icon: BookOpen,
    expanded: false,
    cases: [
      {
        id: "getting-started",
        name: "Getting Started",
        description: "Introduction to the Python Notebook",
        type: "markdown",
        code: `# Python Notebook with Pyodide

Welcome to the Python Notebook! This is a Jupyter-style interface for running Python code directly in your browser using Pyodide.

## Features

- **Interactive Python Execution**: Run Python code directly in your browser
- **Desktop API Integration**: Access desktop functionality from Python
- **Event System**: Subscribe to and emit events between Python and the desktop
- **Multiple Cell Types**: Support for both code and markdown cells

## Getting Started

1. First, initialize Pyodide by running the initialization code
2. Try the basic examples in the sidebar
3. Explore the Desktop API integration features
4. Create your own experiments!

## Desktop API

The desktop API is available through the \`desktop\` object in Python:

- \`desktop.api\` - Access to desktop functionality
- \`desktop.events\` - Event subscription and emission

Try the API tests in the sidebar to see what's available!`,
      },
    ],
  },
];

interface TreeItemProps {
  category?: TestCategory;
  testCase?: TestCase;
  level: number;
  selectedTestId?: string | null;
  onCategoryToggle?: (categoryId: string) => void;
  onTestSelect?: (testCase: TestCase) => void;
}

const TreeItem: React.FC<TreeItemProps> = ({
  category,
  testCase,
  level,
  selectedTestId,
  onCategoryToggle,
  onTestSelect,
}) => {
  const handleClick = () => {
    if (category && onCategoryToggle) {
      onCategoryToggle(category.id);
    } else if (testCase && onTestSelect) {
      onTestSelect(testCase);
    }
  };

  if (category) {
    const Icon = category.icon;
    return (
      <div>
        <div
          className="flex items-center py-1 px-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          onClick={handleClick}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
        >
          <span className="mr-1">
            {category.expanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </span>
          <Icon size={16} className="mr-2 text-blue-500" />
          <span className="text-sm font-medium">{category.name}</span>
        </div>

        {category.expanded && (
          <div>
            {category.cases.map((testCase) => (
              <TreeItem
                key={testCase.id}
                testCase={testCase}
                level={level + 1}
                selectedTestId={selectedTestId}
                onTestSelect={onTestSelect}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (testCase) {
    const isSelected = selectedTestId === testCase.id;
    return (
      <div
        className={`flex items-center py-1 px-2 cursor-pointer rounded transition-colors ${
          isSelected
            ? "bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100"
            : "hover:bg-gray-100 dark:hover:bg-gray-800"
        }`}
        onClick={handleClick}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        <FileText
          size={14}
          className={`mr-2 ${
            isSelected ? "text-blue-600 dark:text-blue-400" : "text-gray-500"
          }`}
        />
        <div className="flex-1 min-w-0">
          <div className="text-sm truncate">{testCase.name}</div>
          <div className="text-xs text-gray-500 truncate">
            {testCase.description}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export const PythonNotebook: React.FC = () => {
  // Sort categories to place 'Documentation' at the top
  const sortedCategories = [...testCategories].sort((a, b) =>
    a.id === "documentation" ? -1 : b.id === "documentation" ? 1 : 0
  );
  const [categories, setCategories] = useState(sortedCategories);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initProgress, setInitProgress] = useState("Not started");
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [initialCells, setInitialCells] = useState([
    {
      id: "welcome",
      type: "markdown" as const,
      content: `# Welcome to Python Notebook

This is a Jupyter-style Python notebook powered by Pyodide. You can run Python code directly in your browser!

**First steps:**
1. Initialize Pyodide (if not already done)
2. Try running some Python code
3. Explore the test cases in the sidebar

Use the sidebar to load pre-built test cases and examples.`,
    },
    {
      id: "init-cell",
      type: "code" as const,
      content: `# Initialize Pyodide
print("Initializing Pyodide...")
# This will be handled by the notebook's execution system`,
    },
  ]);

  // Check Pyodide status on mount and periodically
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const ready = await workerPluginManager.isPyodideReady();
        setIsInitialized(ready);
        if (ready) {
          setInitProgress("Pyodide ready!");
        } else {
          setInitProgress("Pyodide not started");
        }
      } catch (error) {
        console.error("Error checking Pyodide status:", error);
        setInitProgress("Status check failed");
      }
    };

    checkStatus();

    // Check status periodically (every 2 seconds) to keep it updated
    const interval = setInterval(checkStatus, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleCategoryToggle = (categoryId: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, expanded: !cat.expanded } : cat
      )
    );
  };

  const handleTestSelect = (testCase: TestCase) => {
    // Set the selected test for visual feedback
    setSelectedTestId(testCase.id);

    // Replace the current cells with just the selected test case
    setInitialCells([
      {
        id: `test-${testCase.id}-${Date.now()}`,
        type: testCase.type,
        content: testCase.code,
      },
    ]);
  };

  // Handle sidebar resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const delta = e.clientX - startX;
      const newWidth = Math.max(200, Math.min(500, startWidth + delta));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, startX, startWidth]);

  const startResizing = (e: React.MouseEvent) => {
    setIsResizing(true);
    setStartX(e.clientX);
    setStartWidth(sidebarWidth);
    e.preventDefault();
  };

  return (
    <div className="flex h-full bg-white dark:bg-gray-900 overflow-hidden">
      {/* Sidebar */}
      <div
        className="flex-shrink-0 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex flex-col"
        style={{ width: `${sidebarWidth}px` }}
      >
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Test Cases
          </h3>
          <div className="mt-2 flex items-center text-xs">
            <div
              className={`w-2 h-2 rounded-full mr-2 ${
                isInitialized ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="text-gray-600 dark:text-gray-400">
              {initProgress}
            </span>
          </div>
        </div>

        <div className="p-2 overflow-auto flex-1">
          {categories.map((category) => (
            <TreeItem
              key={category.id}
              category={category}
              level={0}
              selectedTestId={selectedTestId}
              onCategoryToggle={handleCategoryToggle}
              onTestSelect={handleTestSelect}
            />
          ))}
        </div>
      </div>

      {/* Resize handle */}
      <div
        className="w-1 cursor-col-resize bg-gray-200 dark:bg-gray-700 hover:bg-blue-400 dark:hover:bg-blue-600 transition-colors"
        onMouseDown={startResizing}
      />

      {/* Main notebook area */}
      <div className="flex-1 overflow-hidden">
        <PyodideNotebook className="h-full" initialCells={initialCells} />
      </div>
    </div>
  );
};
