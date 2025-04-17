import React, { createContext, useContext, useEffect, useState } from 'react';

import { useApi } from '@/api/hooks/useApi';
import { eventBus } from '@/plugins/EventBus';

import { IMacro, IMacroContextValue, IMacroStep } from '../core/types';
import { macroService } from '../services/MacroService';

// Create the Macro context with default values
const MacroContext = createContext<IMacroContextValue>({
  startRecording: () => {},
  stopRecording: () => {
    throw new Error("MacroContext not initialized");
  },
  cancelRecording: () => {},
  executeMacro: async () => [],
  getAllMacros: () => [],
  getMacro: () => undefined,
  deleteMacro: () => {},
  isRecording: () => false,
  currentRecording: [],
});

/**
 * Macro Provider component
 * Provides macro recording and execution functionality to the application
 */
export const MacroProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { executeAction } = useApi();
  const [currentRecording, setCurrentRecording] = useState<IMacroStep[]>([]);
  const [recording, setRecording] = useState(false);

  // Stay in sync with MacroService
  useEffect(() => {
    const handleRecordingStarted = () => {
      setRecording(true);
      setCurrentRecording([]);
    };

    const handleRecordingStopped = () => {
      setRecording(false);
      setCurrentRecording([]);
    };

    const handleRecordingCancelled = () => {
      setRecording(false);
      setCurrentRecording([]);
    };

    const handleStepRecorded = (step: IMacroStep) => {
      setCurrentRecording((prev) => [...prev, step]);
    };

    // Subscribe to macro events
    const unsubscribeStarted = eventBus.subscribe(
      "macro:recording:started",
      handleRecordingStarted
    );
    const unsubscribeStopped = eventBus.subscribe(
      "macro:recording:stopped",
      handleRecordingStopped
    );
    const unsubscribeCancelled = eventBus.subscribe(
      "macro:recording:cancelled",
      handleRecordingCancelled
    );
    const unsubscribeStepRecorded = eventBus.subscribe(
      "macro:step:recorded",
      handleStepRecorded
    );

    return () => {
      unsubscribeStarted();
      unsubscribeStopped();
      unsubscribeCancelled();
      unsubscribeStepRecorded();
    };
  }, []);

  /**
   * Start recording a new macro
   */
  const startRecording = () => {
    macroService.startRecording();
  };

  /**
   * Stop recording and save the macro
   * @param name Name for the macro
   * @param description Optional description
   * @returns The saved macro
   */
  const stopRecording = (name: string, description?: string) => {
    return macroService.stopRecording(name, description);
  };

  /**
   * Cancel the current recording
   */
  const cancelRecording = () => {
    macroService.cancelRecording();
  };

  /**
   * Execute a macro
   * @param id ID of the macro to execute
   * @returns Results of the execution
   */
  const executeMacro = async (id: string) => {
    const result = await macroService.executeMacro(id, executeAction);
    return result.results;
  };

  /**
   * Get all saved macros
   * @returns Array of all macros
   */
  const getAllMacros = () => {
    return macroService.getAllMacros();
  };

  /**
   * Get a specific macro by ID
   * @param id ID of the macro to retrieve
   * @returns The macro with the specified ID, or undefined if not found
   */
  const getMacro = (id: string) => {
    return macroService.getMacro(id);
  };

  /**
   * Delete a macro
   * @param id ID of the macro to delete
   */
  const deleteMacro = (id: string) => {
    macroService.deleteMacro(id);
  };

  /**
   * Check if currently recording
   * @returns Whether recording is in progress
   */
  const isRecording = () => {
    return recording;
  };

  // Context value
  const contextValue: IMacroContextValue = {
    startRecording,
    stopRecording,
    cancelRecording,
    executeMacro,
    getAllMacros,
    getMacro,
    deleteMacro,
    isRecording,
    currentRecording,
  };

  return (
    <MacroContext.Provider value={contextValue}>
      {children}
    </MacroContext.Provider>
  );
};

/**
 * Hook to use the Macro context
 * @returns The Macro context value
 */
export const useMacros = () => {
  const context = useContext(MacroContext);
  if (!context) {
    throw new Error("useMacros must be used within a MacroProvider");
  }
  return context;
};
