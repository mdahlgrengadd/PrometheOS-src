
import { useState, useCallback } from 'react';
import { Cell, CellType, KernelStatus, NotebookState } from '../types';
import { mockExecute } from '../utils/mockExecution';

interface UseNotebookProps {
  initialCells?: Array<{
    id?: string;
    type: CellType;
    content: string;
  }>;
}

export const useNotebook = (initialCells?: UseNotebookProps['initialCells']) => {
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
      content: '# Welcome to your Jupyter-style notebook!\nprint("Hello, World!")',
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
    if (!cell || cell.type !== 'code' || !cell.content.trim()) return;

    setCells(prevCells =>
      prevCells.map(c =>
        c.id === id ? { ...c, isExecuting: true } : c
      )
    );

    setKernelStatus('busy');

    try {
      const output = await mockExecute(cell.content);
      
      setCells(prevCells =>
        prevCells.map(c =>
          c.id === id 
            ? { 
                ...c, 
                isExecuting: false, 
                output, 
                executionCount: executionCount 
              } 
            : c
        )
      );
      
      setExecutionCount(prev => prev + 1);
    } catch (error) {
      setCells(prevCells =>
        prevCells.map(c =>
          c.id === id 
            ? { 
                ...c, 
                isExecuting: false, 
                output: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` 
              } 
            : c
        )
      );
    } finally {
      setKernelStatus('idle');
    }
  }, [cells, executionCount]);

  const runAllCells = useCallback(async () => {
    const codeCells = cells.filter(cell => cell.type === 'code' && cell.content.trim());
    
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

  const restartKernel = useCallback(() => {
    setCells(prevCells =>
      prevCells.map(cell => ({ 
        ...cell, 
        isExecuting: false, 
        output: '', 
        executionCount: 0 
      }))
    );
    setExecutionCount(1);
    setKernelStatus('idle');
  }, []);

  const saveNotebook = useCallback(() => {
    const notebookData = {
      cells: cells.map(({ isExecuting, ...cell }) => cell),
      metadata: {
        kernelspec: {
          display_name: 'Python 3',
          language: 'python',
          name: 'python3'
        }
      }
    };
    
    const dataStr = JSON.stringify(notebookData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'notebook.ipynb';
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
