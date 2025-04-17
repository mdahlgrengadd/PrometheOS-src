/**
 * Represents a single step in a macro
 */
export interface IMacroStep {
  /** ID of the component that the action was performed on */
  componentId: string;

  /** ID of the action that was performed */
  actionId: string;

  /** Parameters passed to the action */
  parameters?: Record<string, unknown>;

  /** Timestamp when the step was recorded */
  timestamp: number;
}

/**
 * Represents a recorded macro sequence
 */
export interface IMacro {
  /** Unique identifier for the macro */
  id: string;

  /** Human-readable name for the macro */
  name: string;

  /** Description of what the macro does */
  description?: string;

  /** Sequence of steps in the macro */
  steps: IMacroStep[];

  /** Timestamp when the macro was created */
  createdAt: number;

  /** Timestamp when the macro was last updated */
  updatedAt: number;

  /** Tags for categorizing macros */
  tags?: string[];
}

/**
 * Context value for the MacroContext
 */
export interface IMacroContextValue {
  /** Start recording a new macro */
  startRecording: () => void;

  /** Stop recording and save the macro */
  stopRecording: (name: string, description?: string) => IMacro;

  /** Cancel the current recording */
  cancelRecording: () => void;

  /** Execute a macro */
  executeMacro: (id: string) => Promise<unknown[]>;

  /** Get all saved macros */
  getAllMacros: () => IMacro[];

  /** Get a specific macro by ID */
  getMacro: (id: string) => IMacro | undefined;

  /** Delete a macro */
  deleteMacro: (id: string) => void;

  /** Check if currently recording */
  isRecording: () => boolean;

  /** The currently recording macro steps (if recording) */
  currentRecording: IMacroStep[];
}

/**
 * Results of a macro execution
 */
export interface IMacroExecutionResult {
  /** The executed macro */
  macro: IMacro;

  /** Results from each step */
  results: unknown[];

  /** Any errors that occurred */
  error?: Error;

  /** Whether the execution completed successfully */
  success: boolean;
}
