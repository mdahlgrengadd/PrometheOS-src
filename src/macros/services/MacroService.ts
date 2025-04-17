import { v4 as uuidv4 } from 'uuid';

import { IActionResult } from '@/api/core/types';
import { eventBus } from '@/plugins/EventBus';

import { IMacro, IMacroExecutionResult, IMacroStep } from '../core/types';

/**
 * Service for recording, storing, and executing macros
 */
export class MacroService {
  private isRecording = false;
  private macros: Record<string, IMacro> = {};
  private currentRecording: IMacroStep[] = [];
  private startTime = 0;

  constructor() {
    // Load saved macros from localStorage
    this.loadFromLocalStorage();

    // Listen for API action events
    eventBus.subscribe("api:action:executed", this.handleActionExecuted);
  }

  /**
   * Start recording a new macro
   */
  startRecording(): void {
    if (this.isRecording) {
      console.warn("Already recording a macro. Stop current recording first.");
      return;
    }

    this.isRecording = true;
    this.currentRecording = [];
    this.startTime = Date.now();

    console.log("Macro recording started");
    eventBus.emit("macro:recording:started");
  }

  /**
   * Stop recording and save the macro
   * @param name Human-readable name for the macro
   * @param description Optional description of what the macro does
   * @returns The saved macro
   */
  stopRecording(name: string, description: string = ""): IMacro {
    if (!this.isRecording) {
      throw new Error("Not currently recording a macro");
    }

    if (!name) {
      throw new Error("Macro name is required");
    }

    if (this.currentRecording.length === 0) {
      throw new Error("Cannot save an empty macro");
    }

    const macro: IMacro = {
      id: uuidv4(),
      name,
      description,
      steps: [...this.currentRecording],
      createdAt: this.startTime,
      updatedAt: Date.now(),
      tags: [],
    };

    this.macros[macro.id] = macro;
    this.isRecording = false;
    const recordedSteps = [...this.currentRecording];
    this.currentRecording = [];

    // Save macros to localStorage
    this.saveToLocalStorage();

    console.log(
      "Macro recording stopped and saved:",
      macro.name,
      "with",
      recordedSteps.length,
      "steps"
    );
    eventBus.emit("macro:recording:stopped", macro);

    return macro;
  }

  /**
   * Cancel the current recording
   */
  cancelRecording(): void {
    if (!this.isRecording) {
      throw new Error("Not currently recording a macro");
    }

    this.isRecording = false;
    this.currentRecording = [];

    console.log("Macro recording cancelled");
    eventBus.emit("macro:recording:cancelled");
  }

  /**
   * Get all saved macros
   * @returns Array of all macros
   */
  getAllMacros(): IMacro[] {
    return Object.values(this.macros);
  }

  /**
   * Get a specific macro by ID
   * @param id ID of the macro to retrieve
   * @returns The macro with the specified ID, or undefined if not found
   */
  getMacro(id: string): IMacro | undefined {
    return this.macros[id];
  }

  /**
   * Delete a macro
   * @param id ID of the macro to delete
   */
  deleteMacro(id: string): void {
    if (!this.macros[id]) {
      console.warn(`Macro with ID ${id} not found`);
      return;
    }

    const macroName = this.macros[id].name;
    delete this.macros[id];

    // Save changes to localStorage
    this.saveToLocalStorage();

    console.log("Macro deleted:", macroName, "(", id, ")");
    eventBus.emit("macro:deleted", id);
  }

  /**
   * Execute a macro
   * @param id ID of the macro to execute
   * @param executeAction Function to execute an action (from ApiContext)
   * @returns Results of executing each step
   */
  async executeMacro(
    id: string,
    executeAction: (
      componentId: string,
      actionId: string,
      parameters?: Record<string, unknown>
    ) => Promise<IActionResult>
  ): Promise<IMacroExecutionResult> {
    const macro = this.getMacro(id);

    if (!macro) {
      const error = new Error(`Macro with ID ${id} not found`);
      return {
        macro: null as unknown as IMacro,
        results: [],
        error,
        success: false,
      };
    }

    console.log(
      "Executing macro:",
      macro.name,
      "with",
      macro.steps.length,
      "steps"
    );
    eventBus.emit("macro:execution:started", macro);

    const results: IActionResult[] = [];
    let success = true;
    let error: Error | undefined;

    try {
      for (let i = 0; i < macro.steps.length; i++) {
        const step = macro.steps[i];
        console.log(
          `Executing step ${i + 1}/${macro.steps.length}:`,
          step.componentId,
          ".",
          step.actionId
        );

        try {
          const result = await executeAction(
            step.componentId,
            step.actionId,
            step.parameters
          );

          results.push(result);

          if (!result.success) {
            console.warn(`Step ${i + 1} returned error:`, result.error);
            eventBus.emit("macro:step:warning", { step, result, index: i });
          }
        } catch (stepError) {
          const errorMessage =
            stepError instanceof Error ? stepError.message : String(stepError);
          console.error(`Error executing step ${i + 1}:`, errorMessage);

          const failedResult: IActionResult = {
            success: false,
            error: errorMessage,
          };

          results.push(failedResult);
          eventBus.emit("macro:step:error", {
            step,
            error: stepError,
            index: i,
          });

          // Continue to the next step even if this one failed
        }
      }
    } catch (executionError) {
      success = false;
      error =
        executionError instanceof Error
          ? executionError
          : new Error(String(executionError));
      console.error("Macro execution failed:", error.message);
      eventBus.emit("macro:execution:error", { macro, error });
    }

    const executionResult: IMacroExecutionResult = {
      macro,
      results,
      error,
      success,
    };

    eventBus.emit("macro:execution:completed", executionResult);
    console.log("Macro execution completed:", macro.name, "success:", success);

    return executionResult;
  }

  /**
   * Handle executed actions to record them
   */
  private handleActionExecuted = (data: {
    componentId: string;
    actionId: string;
    parameters?: Record<string, unknown>;
  }) => {
    if (!this.isRecording) return;

    const step: IMacroStep = {
      componentId: data.componentId,
      actionId: data.actionId,
      parameters: data.parameters,
      timestamp: Date.now(),
    };

    this.currentRecording.push(step);
    console.log("Recorded step:", step.componentId, ".", step.actionId);
    eventBus.emit("macro:step:recorded", step);
  };

  /**
   * Save macros to localStorage
   */
  saveToLocalStorage(): void {
    try {
      localStorage.setItem("dreamscape-macros", JSON.stringify(this.macros));
      console.log("Macros saved to localStorage");
    } catch (error) {
      console.error("Failed to save macros to localStorage:", error);
    }
  }

  /**
   * Load macros from localStorage
   */
  loadFromLocalStorage(): void {
    try {
      const savedMacros = localStorage.getItem("dreamscape-macros");
      if (savedMacros) {
        this.macros = JSON.parse(savedMacros);
        console.log(
          "Loaded",
          Object.keys(this.macros).length,
          "macros from localStorage"
        );
      }
    } catch (error) {
      console.error("Failed to load macros from localStorage:", error);
    }
  }

  /**
   * Check if currently recording
   * @returns Whether recording is in progress
   */
  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  /**
   * Get the current recording steps
   * @returns Current recording steps
   */
  getCurrentRecording(): IMacroStep[] {
    return [...this.currentRecording];
  }
}

// Export a singleton instance
export const macroService = new MacroService();
