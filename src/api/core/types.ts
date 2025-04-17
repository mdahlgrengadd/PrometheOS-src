/**
 * API Component Documentation
 * Describes a UI component that can be interacted with by an AI agent
 */
export interface IApiComponent {
  /** Unique identifier for the component */
  id: string;

  /** Type of component (Button, Input, etc.) */
  type: string;

  /** Human-readable description of what the component does */
  description: string;

  /** Current state of the component (enabled, disabled, etc.) */
  state?: {
    enabled: boolean;
    visible: boolean;
    [key: string]: any;
  };

  /** Available actions that can be performed on this component */
  actions: IApiAction[];

  /** Path to the component in the application (e.g., /calculator/display) */
  path: string;

  /** Additional metadata about the component */
  metadata?: Record<string, any>;
}

/**
 * API Action
 * Represents an action that can be performed on a component
 */
export interface IApiAction {
  /** Unique identifier for the action */
  id: string;

  /** Human-readable name for the action */
  name: string;

  /** Description of what the action does */
  description: string;

  /** Parameters that can be passed to the action */
  parameters?: IApiParameter[];

  /** Whether the action is currently available */
  available: boolean;
}

/**
 * API Parameter
 * Represents a parameter that can be passed to an action
 */
export interface IApiParameter {
  /** Name of the parameter */
  name: string;

  /** Type of the parameter (string, number, boolean, etc.) */
  type: string;

  /** Description of the parameter */
  description: string;

  /** Whether the parameter is required */
  required: boolean;

  /** Default value for the parameter */
  defaultValue?: any;
}

/**
 * API Context Value
 * The shape of the context provided by ApiProvider
 */
export interface IApiContextValue {
  /** Register a new component in the API */
  registerComponent: (component: IApiComponent) => void;

  /** Unregister a component from the API */
  unregisterComponent: (id: string) => void;

  /** Update a component's state in the API */
  updateComponentState: (
    id: string,
    state: Partial<IApiComponent["state"]>
  ) => void;

  /** Execute an action on a component */
  executeAction: (
    componentId: string,
    actionId: string,
    parameters?: Record<string, any>
  ) => Promise<any>;

  /** Get all registered components */
  getComponents: () => IApiComponent[];

  /** Get OpenAPI documentation */
  getOpenApiSpec: () => IOpenApiSpec;
}

/**
 * OpenAPI Documentation
 * OpenAPI-compatible documentation structure
 */
export interface IOpenApiSpec {
  openapi: string;
  info: {
    title: string;
    description: string;
    version: string;
  };
  paths: Record<string, any>;
  components: {
    schemas: Record<string, any>;
  };
}

/**
 * Props for ApiAware HOC
 */
export interface ApiComponentProps {
  /** API description for the component */
  api?: Omit<IApiComponent, "id">;

  /** Unique identifier for the component */
  apiId?: string;
}

/**
 * Action execution result
 */
export interface IActionResult {
  success: boolean;
  data?: any;
  error?: string;
}
