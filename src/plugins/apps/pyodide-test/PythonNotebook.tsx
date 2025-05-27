import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, FileText, Folder, Play, Code, BookOpen } from 'lucide-react';
import { PyodideNotebook } from './notebook/PyodideNotebook';
import { workerPluginManager } from '../../WorkerPluginManagerClient';

interface TestCase {
  id: string;
  name: string;
  description: string;
  code: string;
  type: 'code' | 'markdown';
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
    id: 'basic',
    name: 'Basic Tests',
    icon: Play,
    expanded: true,
    cases: [
      {
        id: 'hello-world',
        name: 'Hello World',
        description: 'Simple arithmetic and output',
        type: 'code',
        code: 'print("Hello from Python!")\n2 + 2'
      },
      {
        id: 'json-processing',
        name: 'JSON Processing',
        description: 'Test JSON manipulation',
        type: 'code',
        code: 'import json\ndata = {"message": "Hello from Python", "numbers": [1, 2, 3]}\njson.dumps(data, indent=2)'
      },
      {
        id: 'loops-variables',
        name: 'Loops & Variables',
        description: 'Test control flow',
        type: 'code',
        code: 'for i in range(5):\n    print(f"Count: {i}")\n\nresult = sum(range(10))\nprint(f"Sum of 0-9: {result}")\nresult'
      }
    ]
  },
  {
    id: 'api-tests',
    name: 'Desktop API Tests',
    icon: Code,
    expanded: true,
    cases: [
      {
        id: 'api-verification',
        name: 'API Verification',
        description: 'Check if desktop API is available',
        type: 'code',
        code: `# Simple Desktop API Verification Test
print("=== Desktop API Verification ===")

# Check if desktop object exists
try:
    print(f"Desktop object type: {type(desktop)}")
    print(f"Desktop API type: {type(desktop.api)}")
    print(f"Desktop Events type: {type(desktop.events)}")
    print("✓ Desktop object is available")
except NameError as e:
    print(f"✗ Desktop object not found: {e}")
    print("This indicates the Desktop API bridge setup failed")

# Check available methods
try:
    print(f"Desktop API methods: {dir(desktop.api)}")
    print(f"Desktop Events methods: {dir(desktop.events)}")
except:
    print("Could not inspect desktop object methods")

print("=== Verification Complete ===")
"Desktop API verification completed"`
      },
      {
        id: 'api-bridge-suite',
        name: 'API Bridge Test Suite',
        description: 'Comprehensive API bridge testing',
        type: 'code',
        code: `# Comprehensive Desktop API Bridge Test
print("=== Desktop API Bridge Test Suite ===")
print()

# Test 1: List available components
print("1. Testing component listing...")
components = await desktop.api.list_components()
comp_count = len(components) if hasattr(components, '__len__') else "unknown"
print(f"   Found {comp_count} components")
print(f"   Result: {components}")
print()

# Test 2: Test event emission
print("2. Testing event emission...")
events_result = await desktop.events.emit("python_test_event", {
    "message": "Hello from Python!",
    "timestamp": "2025-05-27", 
    "test": True
})
print(f"   Event emission result: {events_result}")
print()

# Test 3: Test API execution (calculator example)
print("3. Testing API execution...")
exec_result = await desktop.api.execute("calculator", "add", {"a": 15, "b": 27})
print(f"   Calculator execution result: {exec_result}")
print()

# Test 4: Test system API call
print("4. Testing system API call...")
system_result = await desktop.api.execute("launcher", "notify", {
    "message": "Python API test notification",
    "type": "sonner"
})
print(f"   System notification result: {system_result}")
print()

# Test 5: Test error handling
print("5. Testing error handling...")
try:
    error_result = await desktop.api.execute("nonexistent", "fakeAction", {})
    print(f"   Error test result: {error_result}")
except Exception as e:
    print(f"   Caught exception: {e}")
print()

print("=== Desktop API Bridge Test Complete ===")
"Success: All API bridge tests executed!"`
      },
      {
        id: 'event-subscription',
        name: 'Event Subscription',
        description: 'Test Python event handling',
        type: 'code',
        code: `# Test Event Subscription
print("Testing event subscription...")

# Define event handler
def handle_test_event(data):
    print(f"Received event: {data}")

# Subscribe to events
unsubscribe = desktop.events.subscribe("python_test_event", handle_test_event)
print("Subscribed to python_test_event")

# Emit a test event
desktop.events.emit("python_test_event", {"timestamp": "2025-05-27", "source": "Python"})

print("Event subscription test completed")`
      }
    ]
  },
  {
    id: 'documentation',
    name: 'Documentation',
    icon: BookOpen,
    expanded: false,
    cases: [
      {
        id: 'getting-started',
        name: 'Getting Started',
        description: 'Introduction to the Python Notebook',
        type: 'markdown',
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

Try the API tests in the sidebar to see what's available!`
      }
    ]
  }
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
  onTestSelect 
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
            ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100' 
            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
        onClick={handleClick}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        <FileText size={14} className={`mr-2 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`} />
        <div className="flex-1 min-w-0">
          <div className="text-sm truncate">{testCase.name}</div>
          <div className="text-xs text-gray-500 truncate">{testCase.description}</div>
        </div>
      </div>
    );
  }

  return null;
};

export const PythonNotebook: React.FC = () => {
  const [categories, setCategories] = useState(testCategories);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initProgress, setInitProgress] = useState("Not started");
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [initialCells, setInitialCells] = useState([
    {
      id: 'welcome',
      type: 'markdown' as const,
      content: `# Welcome to Python Notebook

This is a Jupyter-style Python notebook powered by Pyodide. You can run Python code directly in your browser!

**First steps:**
1. Initialize Pyodide (if not already done)
2. Try running some Python code
3. Explore the test cases in the sidebar

Use the sidebar to load pre-built test cases and examples.`
    },
    {
      id: 'init-cell',
      type: 'code' as const,
      content: `# Initialize Pyodide
print("Initializing Pyodide...")
# This will be handled by the notebook's execution system`
    }
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
        console.error('Error checking Pyodide status:', error);
        setInitProgress("Status check failed");
      }
    };

    checkStatus();
    
    // Check status periodically (every 2 seconds) to keep it updated
    const interval = setInterval(checkStatus, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const handleCategoryToggle = (categoryId: string) => {
    setCategories(prev => 
      prev.map(cat => 
        cat.id === categoryId 
          ? { ...cat, expanded: !cat.expanded }
          : cat
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
        content: testCase.code
      }
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
        <PyodideNotebook 
          className="h-full"
          initialCells={initialCells}
        />
      </div>
    </div>
  );
};
