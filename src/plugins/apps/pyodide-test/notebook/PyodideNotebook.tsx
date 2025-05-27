import React from 'react';

import { usePyodideNotebook } from './hooks/usePyodideNotebook';
import { NotebookCell } from './NotebookCell';
import { NotebookToolbar } from './NotebookToolbar';

interface PyodideNotebookProps {
  className?: string;
  initialCells?: Array<{
    id?: string;
    type: "code" | "markdown";
    content: string;
  }>;
}

export const PyodideNotebook: React.FC<PyodideNotebookProps> = ({
  className = "",
  initialCells,
}) => {
  const {
    cells,
    selectedCellId,
    kernelStatus,
    isExecuting,
    isInitialized,
    addCell,
    updateCell,
    deleteCell,
    changeCellType,
    executeCell,
    runAllCells,
    stopAllExecution,
    restartKernel,
    saveNotebook,
    exportNotebook,
    selectCell,
  } = usePyodideNotebook(initialCells);

  return (
    <div
      className={`notebook-container h-full flex flex-col bg-gray-50 dark:bg-gray-950 ${className}`}
    >
      <NotebookToolbar
        onAddCell={addCell}
        onSave={saveNotebook}
        onRunAll={runAllCells}
        onStopAll={stopAllExecution}
        onRestart={restartKernel}
        onExport={exportNotebook}
        kernelStatus={kernelStatus}
        isExecuting={isExecuting}
      />

      <div className="notebook-content flex-1 overflow-y-auto max-w-6xl mx-auto p-4 md:p-6 lg:p-8 w-full">
        {!isInitialized && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-3 animate-pulse" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Pyodide Initialization Required
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Run a code cell to initialize the Python kernel. This may take
                  a moment on first load.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="notebook-cells space-y-1">
          {cells.map((cell) => (
            <NotebookCell
              key={cell.id}
              cell={cell}
              onUpdate={updateCell}
              onExecute={executeCell}
              onDelete={deleteCell}
              onTypeChange={changeCellType}
              isSelected={selectedCellId === cell.id}
              onSelect={selectCell}
            />
          ))}
        </div>

        <div className="notebook-add-cell mt-6 flex justify-center">
          <button
            onClick={() => addCell("code")}
            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
          >
            <span>+ Add cell</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PyodideNotebook;
