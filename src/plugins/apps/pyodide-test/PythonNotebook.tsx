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
        id: 'api-component-listing',
        name: 'Component Listing Test',
        description: 'Test listing available desktop components',
        type: 'code',
        code: `# Test 1: List Available Components
print("=== Component Listing Test ===")
print()

try:
    components = await desktop.api.list_components()
    comp_count = len(components) if hasattr(components, '__len__') else "unknown"
    print(f"✓ Found {comp_count} components")
    print(f"Components: {components}")
    print("✓ Component listing test passed")
except Exception as e:
    print(f"✗ Component listing failed: {e}")

print("=== Test Complete ===")
"Component listing test completed"`
      },
      {
        id: 'api-event-emission',
        name: 'Event Emission Test',
        description: 'Test desktop event emission functionality',
        type: 'code',
        code: `# Test 2: Event Emission
print("=== Event Emission Test ===")
print()

try:
    events_result = await desktop.events.emit("python_test_event", {
        "message": "Hello from Python!",
        "timestamp": "2025-05-27", 
        "test": True,
        "source": "event_emission_test"
    })
    print(f"✓ Event emission successful")
    print(f"Result: {events_result}")
    print("✓ Event emission test passed")
except Exception as e:
    print(f"✗ Event emission failed: {e}")

print("=== Test Complete ===")
"Event emission test completed"`
      },
      {
        id: 'api-calculator-test',
        name: 'Calculator API Test',
        description: 'Test calculator component execution',
        type: 'code',
        code: `# Test 3: Calculator API Execution
print("=== Calculator API Test ===")
print()

def check_calculator_response(result, operation, a, b):
    """Helper function to validate calculator API responses"""
    if isinstance(result, dict):
        # Check for success: false (lowercase)
        if result.get("success") is False:
            error_msg = result.get("error", "Unknown error")
            raise Exception(f"Calculator API returned failure: {error_msg}")
        # Check for Success: False (uppercase - legacy)
        elif result.get("Success") is False:
            error_msg = result.get("Error", "Unknown error")
            raise Exception(f"Calculator API returned failure: {error_msg}")
        # Extract the actual result value
        elif "data" in result:
            return result["data"]
        elif "Result" in result:
            return result["Result"]
        elif "result" in result:
            return result["result"]
        else:
            # If it's a dict but no clear result field, return the whole dict
            return result
    else:
        # If it's not a dict, assume it's the direct result
        return result

try:
    # Test addition
    print("Testing addition: 15 + 27...")
    add_result = await desktop.api.execute("calculator", "add", {"a": 15, "b": 27})
    print(f"Raw response: {add_result}")
    
    validated_add = check_calculator_response(add_result, "add", 15, 27)
    print(f"✓ Addition: 15 + 27 = {validated_add}")
    
    # Verify the result is correct
    if validated_add == 42:
        print("✓ Addition result is mathematically correct")
    else:
        print(f"⚠️  Addition result unexpected: got {validated_add}, expected 42")
    
    print()
    print("✓ Calculator API test passed - app is running and responsive")
    print("ℹ️  Note: Only addition is currently implemented in the calculator")
    
except Exception as e:
    print(f"✗ Calculator API test failed: {e}")
    print()
    print("Possible causes:")
    print("1. Calculator app is not currently running")
    print("2. Calculator plugin is not available")
    print("3. API communication error")
    print("4. Invalid operation or parameters")
    print()
    print("To fix: Try opening the Calculator app first, then run this test again")

print("=== Test Complete ===")
"Calculator API test completed"`
      },
      {
        id: 'api-notification-test',
        name: 'Notification System Test',
        description: 'Test system notification functionality',
        type: 'code',
        code: `# Test 4: System Notification
print("=== Notification System Test ===")
print()

try:
    system_result = await desktop.api.execute("launcher", "notify", {
        "message": "Python API test notification from notification test",
        "type": "sonner"
    })
    print(f"✓ Notification sent successfully")
    print(f"Result: {system_result}")
    print("✓ Check your screen for the notification!")
    print("✓ Notification system test passed")
except Exception as e:
    print(f"✗ Notification system test failed: {e}")

print("=== Test Complete ===")
"Notification system test completed"`
      },
      {
        id: 'api-error-handling',
        name: 'Error Handling Test',
        description: 'Test API error handling and recovery',
        type: 'code',
        code: `# Test 5: Error Handling
print("=== Error Handling Test ===")
print()

# Test with non-existent component
try:
    error_result = await desktop.api.execute("nonexistent_component", "fakeAction", {})
    print(f"Unexpected success: {error_result}")
    print("✗ Error handling test failed - should have thrown an error")
except Exception as e:
    print(f"✓ Correctly caught expected error: {e}")
    print("✓ Error handling working as expected")

# Test with invalid action
try:
    error_result = await desktop.api.execute("calculator", "invalid_operation", {"a": 1, "b": 2})
    print(f"Unexpected success: {error_result}")
    print("✗ Error handling test failed - should have thrown an error")
except Exception as e:
    print(f"✓ Correctly caught invalid action error: {e}")
    print("✓ Error handling working as expected")

print("=== Test Complete ===")
"Error handling test completed"`
      },
      {
        id: 'api-comprehensive-suite',
        name: 'Run All API Tests',
        description: 'Execute all API tests in sequence',
        type: 'code',
        code: `# Comprehensive API Bridge Test Suite
print("=== Running All Desktop API Tests ===")
print()

test_results = []

# Test 1: Component Listing
print("1. Testing component listing...")
try:
    components = await desktop.api.list_components()
    comp_count = len(components) if hasattr(components, '__len__') else "unknown"
    print(f"   ✓ Found {comp_count} components")
    test_results.append("Component Listing: PASS")
except Exception as e:
    print(f"   ✗ Failed: {e}")
    test_results.append("Component Listing: FAIL")
print()

# Test 2: Event Emission
print("2. Testing event emission...")
try:
    events_result = await desktop.events.emit("python_comprehensive_test", {
        "message": "Comprehensive test event",
        "timestamp": "2025-05-27",
        "test_suite": "comprehensive"
    })
    print(f"   ✓ Event emission successful")
    test_results.append("Event Emission: PASS")
except Exception as e:
    print(f"   ✗ Failed: {e}")
    test_results.append("Event Emission: FAIL")
print()

# Test 3: Calculator API
print("3. Testing calculator API...")
try:
    calc_result = await desktop.api.execute("calculator", "add", {"a": 25, "b": 17})
    print(f"   Raw response: {calc_result}")
    
    # Check for Success: False response
    if isinstance(calc_result, dict) and calc_result.get("Success") is False:
        error_msg = calc_result.get("Error", "Unknown error")
        raise Exception(f"Calculator not available: {error_msg}")
    
    # Extract the actual result
    if isinstance(calc_result, dict):
        actual_result = calc_result.get("Result") or calc_result.get("result") or calc_result
    else:
        actual_result = calc_result
    
    print(f"   ✓ Calculator: 25 + 17 = {actual_result}")
    if actual_result == 42:
        print(f"   ✓ Result is mathematically correct")
    test_results.append("Calculator API: PASS")
except Exception as e:
    print(f"   ✗ Failed: {e}")
    print(f"   (Calculator app may not be running)")
    test_results.append("Calculator API: FAIL")
print()

# Test 4: Notification System
print("4. Testing notification system...")
try:
    notif_result = await desktop.api.execute("launcher", "notify", {
        "message": "Comprehensive API test completed!",
        "type": "sonner"
    })
    print(f"   ✓ Notification sent successfully")
    test_results.append("Notification System: PASS")
except Exception as e:
    print(f"   ✗ Failed: {e}")
    test_results.append("Notification System: FAIL")
print()

# Test 5: Error Handling
print("5. Testing error handling...")
try:
    await desktop.api.execute("nonexistent", "fakeAction", {})
    print(f"   ✗ Error handling failed - should have thrown error")
    test_results.append("Error Handling: FAIL")
except Exception as e:
    print(f"   ✓ Correctly caught error: {type(e).__name__}")
    test_results.append("Error Handling: PASS")
print()

# Summary
print("=== Test Suite Summary ===")
for result in test_results:
    print(f"  {result}")

passed = len([r for r in test_results if "PASS" in r])
total = len(test_results)
print(f"\\nOverall: {passed}/{total} tests passed")

if passed == total:
    print("🎉 All tests passed! Desktop API is working correctly.")
else:
    print(f"⚠️  {total - passed} test(s) failed. Check individual results above.")

"Comprehensive API test suite completed"`
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
