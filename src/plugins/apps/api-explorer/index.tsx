import { RefreshCw } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { IApiAction, IApiComponent, IApiParameter } from '@/api/core/types';
import { useApi } from '@/api/hooks/useApi';
import {
    Accordion, AccordionContent, AccordionItem, AccordionTrigger
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

import { Plugin, PluginManifest } from '../../types';

export const manifest: PluginManifest = {
  id: "api-explorer",
  name: "API Explorer",
  version: "1.0.0",
  description: "Explore and interact with available API components",
  author: "Desktop System",
  icon: (
    <img
      src="/icons/34728_code_coding_brackets_code_coding_brackets.png"
      className="h-8 w-8"
      alt="API Explorer"
    />
  ),
  entry: "apps/api-explorer",
  preferredSize: {
    width: 800,
    height: 600,
  },
};

/**
 * Component to display API parameters and capture input values
 */
const ActionParameterInput: React.FC<{
  parameter: IApiParameter;
  onChange: (name: string, value: string | number | boolean) => void;
  value: string | number | boolean | undefined;
}> = ({ parameter, onChange, value }) => {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    onChange(parameter.name, convertValue(e.target.value));
  };

  // Convert input based on parameter type
  const convertValue = (value: string): string | number | boolean => {
    switch (parameter.type) {
      case "number":
        return value === "" ? "" : Number(value);
      case "boolean":
        return value === "true";
      default:
        return value;
    }
  };

  return (
    <div className="mb-4">
      <Label htmlFor={parameter.name} className="flex gap-2 items-center">
        {parameter.name}
        {parameter.required && (
          <Badge variant="outline" className="text-xs py-0">
            Required
          </Badge>
        )}
      </Label>
      <div className="text-xs text-gray-500 mb-1">{parameter.description}</div>

      {parameter.type === "string" &&
      parameter.name.toLowerCase().includes("text") ? (
        <Textarea
          id={parameter.name}
          value={value?.toString() || ""}
          onChange={handleChange}
          placeholder={`Enter ${parameter.name}`}
          className="mt-1"
        />
      ) : (
        <Input
          id={parameter.name}
          type={parameter.type === "number" ? "number" : "text"}
          value={value?.toString() || ""}
          onChange={handleChange}
          placeholder={`Enter ${parameter.name}`}
          className="mt-1"
        />
      )}
    </div>
  );
};

/**
 * Component to execute an action
 */
const ActionExecutor: React.FC<{
  componentId: string;
  action: IApiAction;
}> = ({ componentId, action }) => {
  const { executeAction } = useApi();
  const [paramValues, setParamValues] = useState<
    Record<string, string | number | boolean>
  >({});
  const [result, setResult] = useState<{
    success?: boolean;
    data?: unknown;
    error?: string;
  } | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const updateParamValue = (name: string, value: string | number | boolean) => {
    setParamValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    setResult(null);

    try {
      // Only include parameters that have a value
      const filteredParams = Object.entries(paramValues)
        .filter(([_, value]) => value !== undefined && value !== "")
        .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

      const actionResult = await executeAction(
        componentId,
        action.id,
        filteredParams
      );
      setResult(actionResult);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="border rounded-md p-4 mb-4">
      <h3 className="text-lg font-medium mb-2">{action.name}</h3>
      <p className="text-sm text-gray-500 mb-4">{action.description}</p>

      {action.parameters && action.parameters.length > 0 ? (
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Parameters</h4>
          {action.parameters.map((param) => (
            <ActionParameterInput
              key={param.name}
              parameter={param}
              value={paramValues[param.name]}
              onChange={updateParamValue}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 mb-4">No parameters required</p>
      )}

      <Button
        onClick={handleExecute}
        disabled={
          isExecuting ||
          action.parameters?.some((p) => p.required && !paramValues[p.name])
        }
      >
        {isExecuting ? "Executing..." : "Execute Action"}
      </Button>

      {result && (
        <div
          className={`mt-4 p-3 rounded-md ${
            result.success
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <div className="font-medium">
            {result.success ? "Success" : "Error"}
          </div>
          {result.error && (
            <div className="text-red-600 mt-1">{result.error}</div>
          )}
          <div className="mt-3">
            <div className="text-xs font-medium text-gray-500">Response:</div>
            <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
          {result.data &&
            typeof result.data === "object" &&
            JSON.stringify(result.data) !== JSON.stringify(result) && (
              <div className="mt-3">
                <div className="text-xs font-medium text-gray-500">Data:</div>
                <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            )}
        </div>
      )}
    </div>
  );
};

/**
 * Component for displaying component details
 */
const ComponentDetails: React.FC<{ component: IApiComponent }> = ({
  component,
}) => {
  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-medium">State</h3>
        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
          {JSON.stringify(component.state, null, 2)}
        </pre>
      </div>

      <h3 className="text-lg font-medium mb-2">Actions</h3>
      {component.actions.length > 0 ? (
        <Accordion type="single" collapsible className="w-full">
          {component.actions.map((action) => (
            <AccordionItem key={action.id} value={action.id}>
              <AccordionTrigger className="text-left">
                <div>
                  <span className="font-medium">{action.name}</span>
                  <span className="ml-2 text-xs text-gray-500">
                    {action.id}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ActionExecutor componentId={component.id} action={action} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <p className="text-gray-500">No actions available</p>
      )}
    </div>
  );
};

/**
 * Component for displaying a list of API components
 */
const ComponentsList: React.FC<{
  components: IApiComponent[];
  onSelectComponent: (component: IApiComponent) => void;
  selectedComponentId?: string;
  getComponents: () => IApiComponent[];
  setComponents: (components: IApiComponent[]) => void;
}> = ({
  components,
  onSelectComponent,
  selectedComponentId,
  getComponents,
  setComponents,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredComponents = components.filter(
    (comp) =>
      comp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comp.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comp.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <Input
          placeholder="Search components..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 mr-2"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            // Force refresh components from the API
            const apiComponents = getComponents();
            setComponents(apiComponents);
          }}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-2">
          {filteredComponents.length > 0 ? (
            filteredComponents.map((component) => (
              <Card
                key={component.id}
                className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                  component.id === selectedComponentId ? "border-primary" : ""
                }`}
                onClick={() => onSelectComponent(component)}
              >
                <CardHeader className="py-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-sm">{component.id}</CardTitle>
                      <CardDescription className="text-xs">
                        {component.type}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {component.actions.length} action
                      {component.actions.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No components found matching "{searchTerm}"
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

/**
 * API Explorer component
 */
const ApiExplorerComponent: React.FC = () => {
  const { getComponents } = useApi();
  const [components, setComponents] = useState<IApiComponent[]>([]);
  const [selectedComponent, setSelectedComponent] =
    useState<IApiComponent | null>(null);
  const [activeTab, setActiveTab] = useState<string>("components");

  // Fetch components on mount and periodically refresh
  useEffect(() => {
    const fetchComponents = () => {
      const apiComponents = getComponents();
      setComponents(apiComponents);

      // If there's a selected component, update it
      if (selectedComponent) {
        const updated = apiComponents.find(
          (c) => c.id === selectedComponent.id
        );
        if (updated) {
          setSelectedComponent(updated);
        }
      }
    };

    // Initial fetch
    fetchComponents();

    // Set up polling
    const interval = setInterval(fetchComponents, 2000);

    return () => clearInterval(interval);
  }, [getComponents, selectedComponent]);

  return (
    <div className="h-full flex flex-col bg-white text-black p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">API Explorer</h1>
        <div className="text-sm text-gray-500">
          {components.length} component{components.length !== 1 ? "s" : ""}{" "}
          available
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <TabsList>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>

        <TabsContent value="components" className="flex-1 flex flex-col mt-4">
          <div className="flex-1 grid grid-cols-3 gap-4">
            <div className="col-span-1 border rounded-md p-4">
              <ComponentsList
                components={components}
                onSelectComponent={setSelectedComponent}
                selectedComponentId={selectedComponent?.id}
                getComponents={getComponents}
                setComponents={setComponents}
              />
            </div>

            <div className="col-span-2 border rounded-md p-4">
              {selectedComponent ? (
                <div className="h-full flex flex-col">
                  <div className="mb-4">
                    <h2 className="text-xl font-bold">
                      {selectedComponent.id}
                    </h2>
                    <div className="flex gap-2 mt-1">
                      <Badge>{selectedComponent.type}</Badge>
                      <Badge variant="outline">{selectedComponent.path}</Badge>
                    </div>
                    <p className="mt-2 text-gray-600">
                      {selectedComponent.description}
                    </p>
                  </div>

                  <ScrollArea className="flex-1">
                    <ComponentDetails component={selectedComponent} />
                  </ScrollArea>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  Select a component to view details
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="flex-1 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>
                Recent API activity (coming soon)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-center py-8">
                The activity log feature is under development
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const ApiExplorerPlugin: Plugin = {
  id: manifest.id,
  manifest,
  init: async () => {
    console.log("API Explorer plugin initialized");
  },
  render: () => {
    return <ApiExplorerComponent />;
  },
};

export default ApiExplorerPlugin;
