
import React from 'react';
import { Plus, Save, Play, Square, RotateCcw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CellType, KernelStatus } from './types';

interface NotebookToolbarProps {
  onAddCell: (type: CellType) => void;
  onSave: () => void;
  onRunAll: () => void;
  onStopAll: () => void;
  onRestart: () => void;
  onExport: () => void;
  kernelStatus: KernelStatus;
  isExecuting: boolean;
}

export const NotebookToolbar: React.FC<NotebookToolbarProps> = ({
  onAddCell,
  onSave,
  onRunAll,
  onStopAll,
  onRestart,
  onExport,
  kernelStatus,
  isExecuting,
}) => {
  const getKernelStatusColor = () => {
    switch (kernelStatus) {
      case 'idle':
        return 'bg-green-500';
      case 'busy':
        return 'bg-yellow-500';
      case 'disconnected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="notebook-toolbar border-b bg-white dark:bg-gray-900 px-4 py-3 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="notebook-toolbar-title flex items-center space-x-2">
          <h1 className="text-xl font-semibold">Notebook</h1>
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${getKernelStatusColor()}`}></div>
            <Badge variant="outline" className="text-xs">
              Python 3
            </Badge>
          </div>
        </div>

        <div className="notebook-toolbar-actions flex items-center space-x-2">
          {/* Add Cell Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                Cell
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white dark:bg-gray-800 border shadow-lg">
              <DropdownMenuItem onClick={() => onAddCell('code')}>
                Code Cell
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddCell('markdown')}>
                Markdown Cell
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="h-6" />

          {/* Execution Controls */}
          <Button
            size="sm"
            variant="outline"
            onClick={onRunAll}
            disabled={isExecuting}
          >
            <Play className="w-4 h-4 mr-1" />
            Run All
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={onStopAll}
            disabled={!isExecuting}
          >
            <Square className="w-4 h-4 mr-1" />
            Stop
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={onRestart}
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Restart
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* File Operations */}
          <Button
            size="sm"
            variant="outline"
            onClick={onSave}
          >
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={onExport}
          >
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
        </div>
      </div>
    </div>
  );
};
