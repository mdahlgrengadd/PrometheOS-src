export type CellType = "code" | "markdown";

export interface Cell {
  id: string;
  type: CellType;
  content: string;
  output?: string;
  isExecuting?: boolean;
  executionCount?: number;
  hasError?: boolean;
}

export type KernelStatus = "idle" | "busy" | "disconnected" | "restarting";

export interface NotebookState {
  cells: Cell[];
  selectedCellId: string | null;
  kernelStatus: KernelStatus;
  executionCount: number;
}

export interface NotebookActions {
  addCell: (type: CellType, afterId?: string) => void;
  updateCell: (id: string, content: string) => void;
  deleteCell: (id: string) => void;
  changeCellType: (id: string, type: CellType) => void;
  executeCell: (id: string) => void;
  runAllCells: () => void;
  stopAllExecution: () => void;
  restartKernel: () => void;
  saveNotebook: () => void;
  exportNotebook: () => void;
  selectCell: (id: string) => void;
}
