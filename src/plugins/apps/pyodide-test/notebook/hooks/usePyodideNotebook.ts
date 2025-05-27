import { useState, useCallback, useEffect } from 'react';
import { Cell, CellType, KernelStatus } from '../types';
import { workerPluginManager } from '../../../../WorkerPluginManagerClient';

interface UsePyodideNotebookProps {
  initialCells?: Array<{
    id?: string;
    type: CellType;
    content: string;
  }>;
}

export const usePyodideNotebook = (initialCells?: UsePyodideNotebookProps['initialCells']) => {
  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

  const createDefaultCells = (): Cell[] => {
    if (initialCells && initialCells.length > 0) {
      return initialCells.map(cell => ({
        id: cell.id || generateId(),
        type: cell.type,
        content: cell.content,
        output: '',
        executionCount: 0,
      }));
    }
    
    return [{
      id: generateId(),
      type: 'code' as CellType,
      content: '# Welcome to your Python notebook!\nprint("Hello, World!")',
      output: '',
      executionCount: 0,
    }];
  };

  const [cells, setCells] = useState<Cell[]>(createDefaultCells());
  const [selectedCellId, setSelectedCellId] = useState<string>(() => {
    const defaultCells = createDefaultCells();
    return defaultCells.length > 0 ? defaultCells[0].id : '';
  });
  const [kernelStatus, setKernelStatus] = useState<KernelStatus>('idle');
  const [executionCount, setExecutionCount] = useState(1);
  const [isInitialized, setIsInitialized] = useState(false);

  // Check Pyodide initialization status
  useEffect(() => {
    const checkInitialization = async () => {
      try {
        const ready = await workerPluginManager.isPyodideReady();
        setIsInitialized(ready);
        if (ready) {
          setKernelStatus('idle');
        } else {
          setKernelStatus('disconnected');
        }
      } catch (error) {
        console.error('Error checking Pyodide status:', error);
        setKernelStatus('disconnected');
      }
    };

    checkInitialization();
  }, []);

  // Re-create cells when initialCells prop changes
  useEffect(() => {
    if (initialCells && initialCells.length > 0) {
      const newCells = initialCells.map(cell => ({
        id: cell.id || generateId(),
        type: cell.type,
        content: cell.content,
        output: '',
        executionCount: 0,
      }));
      setCells(newCells);
      if (newCells.length > 0) {
        setSelectedCellId(newCells[newCells.length - 1].id);
      }
    }
  }, [initialCells]);

  const addCell = useCallback((type: CellType, afterId?: string) => {
    const newCell: Cell = {
      id: generateId(),
      type,
      content: '',
      output: '',
      executionCount: 0,
    };

    setCells(prevCells => {
      if (afterId) {
        const index = prevCells.findIndex(cell => cell.id === afterId);
        const newCells = [...prevCells];
        newCells.splice(index + 1, 0, newCell);
        return newCells;
      }
      return [...prevCells, newCell];
    });

    setSelectedCellId(newCell.id);
  }, []);

  const updateCell = useCallback((id: string, content: string) => {
    setCells(prevCells =>
      prevCells.map(cell =>
        cell.id === id ? { ...cell, content } : cell
      )
    );
  }, []);

  const deleteCell = useCallback((id: string) => {
    setCells(prevCells => {
      const newCells = prevCells.filter(cell => cell.id !== id);
      if (newCells.length === 0) {
        return [{
          id: generateId(),
          type: 'code',
          content: '',
          output: '',
          executionCount: 0,
        }];
      }
      return newCells;
    });
    
    if (selectedCellId === id) {
      setCells(prevCells => {
        const remainingCells = prevCells.filter(cell => cell.id !== id);
        if (remainingCells.length > 0) {
          setSelectedCellId(remainingCells[0].id);
        }
        return remainingCells;
      });
    }
  }, [selectedCellId]);

  const changeCellType = useCallback((id: string, type: CellType) => {
    setCells(prevCells =>
      prevCells.map(cell =>
        cell.id === id ? { ...cell, type, output: '' } : cell
      )
    );
  }, []);

  const executeCell = useCallback(async (id: string) => {
    const cell = cells.find(c => c.id === id);
    if (!cell) return;

    // Handle markdown cells
    if (cell.type === 'markdown') {
      setCells(prevCells =>
        prevCells.map(c =>
          c.id === id 
            ? { 
                ...c, 
                output: cell.content, // For markdown, output is the rendered content
                executionCount: executionCount 
              } 
            : c
        )
      );
      setExecutionCount(prev => prev + 1);
      return;
    }

    // Handle code cells
    if (!cell.content.trim()) return;

    setCells(prevCells =>
      prevCells.map(c =>
        c.id === id ? { ...c, isExecuting: true, output: '' } : c
      )
    );

    setKernelStatus('busy');

    try {
      // Check if Pyodide needs initialization
      if (!isInitialized) {
        const initResult = await workerPluginManager.initPyodide();
        if (initResult.status === 'success') {
          setIsInitialized(true);
          setKernelStatus('idle');
        } else {
          throw new Error(`Pyodide initialization failed: ${initResult.message}`);
        }
      }

      // Execute the Python code
      const result = await workerPluginManager.executePython(cell.content, true);
      
      let output = '';
      if (result.success) {
        if (result.stdout) {
          output += result.stdout;
        }
        if (result.result !== undefined && result.result !== null) {
          if (output) output += '\n';
          output += String(result.result);
        }
        if (!output) {
          output = '(execution completed successfully)';
        }
      } else {
        output = `Error: ${result.error || 'Unknown error occurred'}`;
      }
      
      setCells(prevCells =>
        prevCells.map(c =>
          c.id === id 
            ? { 
                ...c, 
                isExecuting: false, 
                output, 
                executionCount: executionCount,
                hasError: !result.success
              } 
            : c
        )
      );
      
      setExecutionCount(prev => prev + 1);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setCells(prevCells =>
        prevCells.map(c =>
          c.id === id 
            ? { 
                ...c, 
                isExecuting: false, 
                output: `Error: ${errorMessage}`,
                hasError: true
              } 
            : c
        )
      );
    } finally {
      setKernelStatus('idle');
    }
  }, [cells, executionCount, isInitialized]);

  const runAllCells = useCallback(async () => {
    const codeCells = cells.filter(cell => cell.content.trim());
    
    for (const cell of codeCells) {
      await executeCell(cell.id);
    }
  }, [cells, executeCell]);

  const stopAllExecution = useCallback(() => {
    setCells(prevCells =>
      prevCells.map(cell => ({ ...cell, isExecuting: false }))
    );
    setKernelStatus('idle');
  }, []);

  const restartKernel = useCallback(async () => {
    try {
      setKernelStatus('restarting');
      
      // Reinitialize Pyodide
      const initResult = await workerPluginManager.initPyodide();
      if (initResult.status === 'success') {
        setIsInitialized(true);
        setKernelStatus('idle');
      } else {
        setKernelStatus('disconnected');
        throw new Error(`Kernel restart failed: ${initResult.message}`);
      }

      // Clear all cell outputs
      setCells(prevCells =>
        prevCells.map(cell => ({ 
          ...cell, 
          isExecuting: false, 
          output: '', 
          executionCount: 0,
          hasError: false
        }))
      );
      setExecutionCount(1);
    } catch (error) {
      console.error('Error restarting kernel:', error);
      setKernelStatus('disconnected');
    }
  }, []);

  const saveNotebook = useCallback(() => {
    const notebookData = {
      cells: cells.map(({ isExecuting, hasError, ...cell }) => ({
        ...cell,
        cell_type: cell.type === 'code' ? 'code' : 'markdown',
        source: cell.content.split('\n'),
        outputs: cell.type === 'code' && cell.output ? [{
          output_type: hasError ? 'error' : 'execute_result',
          data: hasError ? undefined : { 'text/plain': cell.output },
          traceback: hasError ? [cell.output] : undefined,
          execution_count: cell.executionCount
        }] : [],
        execution_count: cell.type === 'code' ? cell.executionCount : null
      })),
      metadata: {
        kernelspec: {
          display_name: 'Python 3 (Pyodide)',
          language: 'python',
          name: 'python3'
        },
        language_info: {
          name: 'python',
          version: '3.11.0'
        }
      },
      nbformat: 4,
      nbformat_minor: 4
    };
    
    const dataStr = JSON.stringify(notebookData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'python-notebook.ipynb';
    link.click();
    URL.revokeObjectURL(url);
  }, [cells]);

  const exportNotebook = useCallback(() => {
    saveNotebook();
  }, [saveNotebook]);

  const isExecuting = cells.some(cell => cell.isExecuting);

  return {
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
    selectCell: setSelectedCellId,
  };
};
