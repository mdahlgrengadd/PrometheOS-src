/**
 * BetterCustomExplorer.jsx
 *
 * A simplified custom API explorer that does not use Swagger UI.
 * It lists available API components in a flat, searchable view,
 * displays component details and actions, and allows executing actions
 * directly via the JavaScript API provided by useApi().
 *
 * JS API Interface:
 *   const { getComponents, executeAction } = useApi();
 *   // Get all API components
 *   const components = getComponents();
 *   // Execute an action on a component
 *   const result = await executeAction(componentId, actionId, params);
 *   // result: { success: boolean, data: any, error?: string }
 */

import React, { useState, useEffect } from 'react';
import { useApi } from '@/api/hooks/useApi';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import GettingStarted from './GettingStarted';
import { eventBus } from '@/plugins/EventBus';

/**
 * Helper to provide default placeholder values based on parameter type
 */
const getPlaceholderValue = (param) => {
  switch (param.type) {
    case 'number':
      return 1234;
    case 'string':
      return '<replace this string>';
    case 'text':
      return '<replace this text>';
    case 'boolean':
      return false;
    default:
      return '<replace this value>';
  }
};

/**
 * Renders an input for a single API action parameter based on its type.
 */
const ActionParameterInput = ({ parameter, value, onChange }) => {
  const handleChange = (e) => onChange(parameter.name, convertValue(e.target.value));
  const handleSelectChange = (e) => onChange(parameter.name, convertValue(e.target.value));

  const convertValue = (val) => {
    if (parameter.enum) {
      return val;
    }
    switch (parameter.type) {
      case 'number':
        return val === '' ? '' : Number(val);
      case 'boolean':
        return val === 'true';
      default:
        return val;
    }
  };

  return (
    <div className="mb-4">
      <Label htmlFor={parameter.name} className="flex items-center gap-2">
        {parameter.name}
        {parameter.required && <Badge variant="outline" className="text-xs">Required</Badge>}
      </Label>
      <div className="text-xs text-gray-500 mb-1">{parameter.description || ''}</div>

      {parameter.enum ? (
        <select
          id={parameter.name}
          value={value != null ? value.toString() : ''}
          onChange={handleSelectChange}
          className="mt-1 border rounded px-2 py-1"
        >
          <option value="">Select</option>
          {parameter.enum.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : parameter.type === 'number' ? (
        <Input
          id={parameter.name}
          type="number"
          value={value != null ? value.toString() : ''}
          onChange={handleChange}
          placeholder="1234"
          className="mt-1"
        />
      ) : parameter.type === 'boolean' ? (
        <select
          id={parameter.name}
          value={value != null ? value.toString() : ''}
          onChange={handleSelectChange}
          className="mt-1 border rounded px-2 py-1"
        >
          <option value="">Select</option>
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      ) : parameter.type === 'text' ? (
        <Textarea
          id={parameter.name}
          value={value != null ? value.toString() : ''}
          onChange={(e) => onChange(parameter.name, e.target.value)}
          placeholder="<replace this text>"
          className="mt-1"
        />
      ) : parameter.type === 'string' ? (
        <Input
          id={parameter.name}
          type="text"
          value={value != null ? value.toString() : ''}
          onChange={handleChange}
          placeholder="<replace this string>"
          className="mt-1"
        />
      ) : (
        <Input
          id={parameter.name}
          type="text"
          value={value != null ? value.toString() : ''}
          onChange={handleChange}
          placeholder={`Enter ${parameter.name}`}
          className="mt-1"
        />
      )}
    </div>
  );
};

/**
 * A flat, searchable API explorer that shows all API components and their actions.
 */
const BetterFrontendExplorer = () => {
  const { getComponents, executeAction } = useApi();
  const [components, setComponents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [paramValues, setParamValues] = useState({});
  const [results, setResults] = useState({});
  const [executingActions, setExecutingActions] = useState({});
  const [exampleTabs, setExampleTabs] = useState({});

  // Poll API components every 2 seconds
  useEffect(() => {
    const fetchComponents = () => {
      const all = getComponents().filter((c) => c.actions && c.actions.length > 0);
      // Dynamically update onEvent.waitForEvent parameter enum
      all.forEach((comp) => {
        if (comp.id === 'onEvent') {
          const waitAction = comp.actions.find((a) => a.id === 'waitForEvent');
          if (waitAction?.parameters) {
            const eventParam = waitAction.parameters.find((p) => p.name === 'eventId');
            if (eventParam) {
              eventParam.enum = eventBus.getEventNames();
            }
          }
        }
      });
      setComponents(all);
      // refresh selected component details
      if (selectedComponent) {
        const updated = all.find((c) => c.id === selectedComponent.id);
        if (updated) setSelectedComponent(updated);
      }
    };

    fetchComponents();
    const interval = setInterval(fetchComponents, 2000);
    return () => clearInterval(interval);
  }, [getComponents, selectedComponent]);

  // Update parameter values for inputs
  const updateParamValue = (name, value) => {
    setParamValues((prev) => ({ ...prev, [name]: value }));
  };

  // Execute an action and display the result
  const handleExecute = async (action) => {
    // mark this action as executing and clear its previous result
    setExecutingActions(prev => ({ ...prev, [action.id]: true }));
    setResults(prev => ({ ...prev, [action.id]: null }));
    try {
      // only include params with values
      const filtered = Object.entries(paramValues)
        .filter(([_, v]) => v !== undefined && v !== '')
        .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});
      const res = await executeAction(selectedComponent.id, action.id, filtered);
      setResults(prev => ({ ...prev, [action.id]: res }));
    } catch (err) {
      setResults(prev => ({
        ...prev,
        [action.id]: { success: false, error: err instanceof Error ? err.message : String(err) }
      }));
    } finally {
      setExecutingActions(prev => ({ ...prev, [action.id]: false }));
    }
  };

  // Filter components by search term
  const filteredComponents = components.filter((c) => {
    const term = searchTerm.toLowerCase();
    return [c.id, c.name, c.type, c.path]
      .filter(Boolean)
      .some((f) => f.toLowerCase().includes(term));
  });

  return (
    <div className="h-full flex bg-background text-foreground">
      {/* Left pane: Search + list */}
      <div className="w-1/3 border-r p-4 flex flex-col">
        <Input
          placeholder="Search components..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />
        <ScrollArea className="flex-1">
          {filteredComponents.map((comp) => (
            <Card
              key={comp.id}
              className={`mb-2 cursor-pointer hover:bg-gray-50 ${
                selectedComponent && selectedComponent.id === comp.id
                  ? 'border-primary'
                  : ''
              }`}
              onClick={() => {
                setSelectedComponent(comp);
                setParamValues({});
                setResults({});
                setExecutingActions({});
                setExampleTabs({});
              }}
            >
              <CardHeader className="py-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm">
                    {comp.name || comp.id}
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {comp.actions.length} actions
                  </Badge>
                </div>
                <CardDescription className="text-xs text-gray-500">
                  {comp.type}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
          {filteredComponents.length === 0 && (
            <div className="text-center text-gray-500">
              No components found
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Right pane: Component details */}
      <div className="flex-1 p-4 flex flex-col">
        {!selectedComponent && <GettingStarted />}
        {selectedComponent && (
          <>  
            <div className="mb-4">
              <h2 className="text-xl font-bold">
                {selectedComponent.name || selectedComponent.id}
              </h2>
              <div className="flex gap-2 mt-2">
                <Badge>{selectedComponent.type}</Badge>
                <Badge variant="outline">{selectedComponent.path}</Badge>
              </div>
              {selectedComponent.description && (
                <p className="mt-2 text-sm text-gray-500">
                  {selectedComponent.description}
                </p>
              )}
            </div>
            <ScrollArea className="flex-1">
              <Accordion type="multiple" className="space-y-2">
                {selectedComponent.actions.map((action) => {
                  // dynamic params for code snippet: use entered values or placeholder defaults
                  const snippetParams = action.parameters?.reduce((acc, param) => {
                    const hasValue = paramValues[param.name] !== undefined && paramValues[param.name] !== '';
                    const val = hasValue ? paramValues[param.name] : getPlaceholderValue(param);
                    return { ...acc, [param.name]: val };
                  }, {}) || {};
                  const currentTab = exampleTabs[action.id] || 'js';

                  return (
                    <AccordionItem key={action.id} value={action.id} className="border rounded-md">
                      <AccordionTrigger className="flex justify-between items-center p-4">
                        <div>
                          <span className="font-medium">{action.name}</span>
                          <span className="ml-2 text-xs text-gray-500">{action.id}</span>
                        </div>
                      </AccordionTrigger>

                      <AccordionContent className="p-4 border-t flex flex-col">
                        {/* Code examples at top */}
                        <div className="mb-4">
                          <Tabs value={currentTab} onValueChange={(val) => setExampleTabs(prev => ({ ...prev, [action.id]: val }))}>
                            <TabsList className="flex justify-end space-x-2">
                              <TabsTrigger value="js">JavaScript</TabsTrigger>
                              <TabsTrigger value="react">React</TabsTrigger>
                            </TabsList>
                            <TabsContent value="js">
                              <pre className="language-js bg-gray-100 p-2 rounded overflow-auto text-left whitespace-pre">
                                <code>{`// JavaScript example
const result = await executeAction('${selectedComponent.id}', '${action.id}', ${JSON.stringify(snippetParams, null, 2)});
console.log(result);`}</code>
                              </pre>
                            </TabsContent>
                            <TabsContent value="react">
                              <pre className="language-tsx bg-gray-100 p-2 rounded overflow-auto text-left whitespace-pre">
                                <code>{`// React example
import React from 'react';
import { useApi } from '@/api/hooks/useApi';

function MyComponent() {
  const { executeAction } = useApi();

  React.useEffect(() => {
    (async () => {
      const result = await executeAction('${selectedComponent.id}', '${action.id}', ${JSON.stringify(snippetParams, null, 2)});
      console.log(result);
    })();
  }, [executeAction]);

  return null;
}`}</code>
                              </pre>
                            </TabsContent>
                          </Tabs>
                        </div>
                        {/* Action description */}
                        <p className="text-sm text-gray-500 mb-4">{action.description}</p>

                        {action.parameters && action.parameters.length > 0 && (
                          <div className="mb-4">
                            {action.parameters.map((param) => (
                              <ActionParameterInput
                                key={param.name}
                                parameter={param}
                                value={paramValues[param.name]}
                                onChange={updateParamValue}
                              />
                            ))}
                          </div>
                        )}

                        <Button
                          onClick={() => handleExecute(action)}
                          disabled={
                            executingActions[action.id] ||
                            (action.parameters && action.parameters.some((p) => p.required && (paramValues[p.name] === undefined || paramValues[p.name] === '')))
                          }
                        >
                          {executingActions[action.id] ? 'Executing...' : 'Execute'}
                        </Button>
                        {/* Per-action result */}
                        {results[action.id] != null && (
                          <div className={`mt-4 p-4 rounded-md ${results[action.id].success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'} text-left`}>
                            <div className="font-medium">
                              {results[action.id].success ? 'Success' : 'Error'}
                            </div>
                            {results[action.id].error && (
                              <div className="text-red-600 mt-1">{results[action.id].error}</div>
                            )}
                            <pre className="mt-3 text-xs bg-gray-100 p-2 rounded overflow-auto text-left whitespace-pre">
                              {JSON.stringify(results[action.id], null, 2)}
                            </pre>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </ScrollArea>
          </>
        )}
      </div>
    </div>
  );
};

export default BetterFrontendExplorer; 