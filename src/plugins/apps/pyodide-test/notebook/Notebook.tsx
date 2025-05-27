
import React from 'react';
import { NotebookCell } from './NotebookCell';
import { NotebookToolbar } from './NotebookToolbar';
import { useNotebook } from './hooks/useNotebook';

interface NotebookProps {
  className?: string;
  initialCells?: Array<{
    id?: string;
    type: 'code' | 'markdown';
    content: string;
  }>;
}

export const Notebook: React.FC<NotebookProps> = ({ 
  className = '',
  initialCells
}) => {
  const {
    cells,
    selectedCellId,
    kernelStatus,
    isExecuting,
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
  } = useNotebook(initialCells);

  return (
    <div className={`notebook-container min-h-screen bg-gray-50 dark:bg-gray-950 ${className}`}>
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
      
      <div className="notebook-content max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
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
            onClick={() => addCell('code')}
            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
          >
            <span>+ Add cell</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notebook;
