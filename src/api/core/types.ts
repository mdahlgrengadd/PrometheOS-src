/**
 * API Component Documentation
 * Describes a UI component that can be interacted with by an AI agent
 */
export interface IApiComponent {
  /** Unique identifier for the component */
  id: string;

  /** Type of component (Button, Input, etc.) */
  type: string;

  /** Optional display name for the component */
  name?: string;

  /** Human-readable description of what the component does */
  description: string;
  /** Current state of the component (enabled, disabled, etc.) */
  state?: {
    enabled: boolean;
    visible: boolean;
    [key: string]: unknown;
  };

  /** Available actions that can be performed on this component */
  actions: IApiAction[];
  /** Path to the component in the application (e.g., /calculator/display) */
  path: string;

  /** Additional metadata about the component */
  metadata?: {
    /** Optional name for display in UI */
    name?: string;
    [key: string]: unknown;
  };
}

/**
 * Props for components that can be registered with the API system
 */
export interface ApiComponentProps {
  /** Unique identifier for the component in the API system */
  apiId?: string;

  /** Optional API configuration to override defaults */
  api?: Partial<Omit<IApiComponent, "id">>;
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
 *
 * These props can be passed directly to any API-enabled component to set its API characteristics.
 * For example:
 * ```tsx
 * <Button
 *   apiId="my-button"
 *   apiName="Submit Button"
 *   apiDescription="Submits the form data"
 * >
 *   Submit
 * </Button>
 * ```
 */
export interface ApiComponentProps {
  /**
   * Legacy API description for the component - use the more specific props below instead
   * @deprecated Use specific api* props instead
   */
  api?: Partial<Omit<IApiComponent, "id">>;

  /**
   * Unique identifier for the component - required for all API-enabled components
   * This ID must be unique across the entire application
   * Example: "calculator-clear-button" or "audio-player-play-button"
   */
  apiId?: string;

  /**
   * Component type (e.g., "Button", "Input", etc.)
   * This helps categorize the component in the API explorer and documentation
   * Example: "Button", "TextField", "Slider", "Toggle"
   */
  apiType?: string;

  /**
   * Human-readable name for the component
   * This should be concise and descriptive
   * Example: "Play Button", "Volume Slider", "Search Input"
   */
  apiName?: string;

  /**
   * Human-readable description of what the component does
   * This should explain the component's purpose and behavior
   * Example: "Plays or pauses the current audio track"
   */
  apiDescription?: string;

  /**
   * Path to the component in the application structure
   * This helps organize components in a logical hierarchy
   * Example: "/audio-player/controls" or "/calculator/digits"
   */
  apiPath?: string;

  /**
   * Custom API actions to merge with default actions
   * Define additional actions that can be performed on this component
   */
  apiActions?: IApiAction[];
  /**
   * Initial state for the component
   * Set custom state properties beyond the default enabled/visible
   * Example: { enabled: true, visible: true, mode: "edit", isValid: false }
   */
  apiState?: Record<string, unknown>;

  /**
   * Additional metadata about the component
   * Can include any extra information needed by the API consumer
   * Example: { version: "1.0", author: "John Doe", category: "input" }
   */
  apiMetadata?: Record<string, unknown>;
}

/**
 * Action execution result
 */
export interface IActionResult {
  success: boolean;
  data?: unknown;
  error?: string;
}
