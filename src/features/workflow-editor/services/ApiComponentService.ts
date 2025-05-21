import { IActionResult, IApiAction, IApiComponent, IApiParameter } from '../../../api/core/types';
import { useApi } from '../../../api/hooks/useApi';

/**
 * Service to retrieve and interact with API components from registered apps
 */
export class ApiComponentService {
  private static instance: ApiComponentService;
  private apiContext: ReturnType<typeof useApi> | null = null;

  // Private constructor for singleton pattern
  private constructor() {}

  // Get singleton instance
  public static getInstance(): ApiComponentService {
    if (!ApiComponentService.instance) {
      ApiComponentService.instance = new ApiComponentService();
    }
    return ApiComponentService.instance;
  }

  // Set the API context
  public setApiContext(apiContext: ReturnType<typeof useApi>): void {
    this.apiContext = apiContext;
  }

  // Get all registered API components
  public getApiComponents(): IApiComponent[] {
    if (!this.apiContext) {
      console.error("API context not initialized");
      return [];
    }

    return this.apiContext.getComponents();
  }

  // Get API components by app ID
  public getApiComponentsByApp(appId: string): IApiComponent[] {
    const components = this.getApiComponents();

    // First try to find components directly associated with this app ID
    const directMatches = components.filter(
      (component) =>
        component.path.includes(`/apps/${appId}/`) || // Standard app path format
        component.id === appId // Direct ID match
    );

    // If we have direct matches, return them
    if (directMatches.length > 0) {
      return directMatches;
    }

    // If no direct matches, look for components registered by the app
    // but with different path structures (like the textarea components)
    return components.filter((component) => {
      // Check if this component was registered by our app
      // This works when the component ID matches the app ID (like "notepad")
      // or when component ID is derived from app ID with a suffix
      return (
        component.id === appId ||
        component.id.startsWith(`${appId}-`) ||
        component.id.startsWith(`${appId}_`) ||
        // Also check metadata for app attribution
        component.metadata?.appId === appId ||
        // If none of the above, check if the component is directly referenced
        // in the app's manifest (like textareas in notepad)
        (component.path === "/components/textareas" && appId === "notepad")
      );
    });
  }

  // Get actions for a specific component
  public getActionsForComponent(componentId: string): IApiAction[] {
    const components = this.getApiComponents();
    const component = components.find((comp) => comp.id === componentId);
    return component?.actions || [];
  }

  // Execute an action on a component
  public async executeAction(
    componentId: string,
    actionId: string,
    parameters?: Record<string, unknown>
  ): Promise<IActionResult> {
    if (!this.apiContext) {
      console.error("API context not initialized");
      return { success: false, error: "API context not initialized" };
    }

    try {
      return await this.apiContext.executeAction(
        componentId,
        actionId,
        parameters
      );
    } catch (error) {
      console.error("Error executing action:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // Get all available apps that have API components
  public getAvailableApps(): { id: string; name: string }[] {
    const components = this.getApiComponents();

    // Extract unique app IDs from component paths
    const appMap = new Map<string, string>();

    components.forEach((component) => {
      const pathParts = component.path.split("/");
      // System APIs: /api/{componentId}
      if (pathParts.length >= 3 && pathParts[1] === "api") {
        const appId = pathParts[2];
        const appName = component.name || appId;
        appMap.set(appId, appName);
      }
      // Top-level apps: /apps/{appId}/...
      if (pathParts.length >= 3 && pathParts[1] === "apps") {
        const appId = pathParts[2];
        const appName = component.name || appId;
        appMap.set(appId, appName);
      }
      // Plugin-based apps: /plugins/apps/{appId}/...
      if (pathParts.length >= 4 && pathParts[2] === "apps") {
        const appId = pathParts[3];
        const appName = component.name || appId;
        appMap.set(appId, appName);
      }
      // Handle special cases like the textarea component used by notepad
      if (component.path === "/components/textareas") {
        appMap.set("notepad", "Notepad");
      }
    });

    // Convert to array of objects
    return Array.from(appMap.entries()).map(([id, name]) => ({
      id,
      name:
        typeof name === "string"
          ? name.charAt(0).toUpperCase() + name.slice(1)
          : String(name),
    }));
  }
}
