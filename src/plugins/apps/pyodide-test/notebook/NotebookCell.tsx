import { Code, MoreVertical, Play, Trash2, Type } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

import { Cell, CellType } from './types';

interface NotebookCellProps {
  cell: Cell;
  onUpdate: (id: string, content: string) => void;
  onExecute: (id: string) => void;
  onDelete: (id: string) => void;
  onTypeChange: (id: string, type: CellType) => void;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const NotebookCell: React.FC<NotebookCellProps> = ({
  cell,
  onUpdate,
  onExecute,
  onDelete,
  onTypeChange,
  isSelected,
  onSelect,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      );
    }
  }, [isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onExecute(cell.id);
      setIsEditing(false);
    }
    if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  const autoResize = (textarea: HTMLTextAreaElement) => {
    // Calculate the proper height based on content
    const lines = textarea.value.split("\n").length;
    const minLines = 3;
    const maxLines = 20;
    const calculatedLines = Math.max(minLines, Math.min(maxLines, lines));

    textarea.style.height = "auto";
    textarea.style.height = Math.max(80, calculatedLines * 20) + "px";
  };

  const renderContent = () => {
    if (isEditing) {
      return (
        <textarea
          ref={textareaRef}
          value={cell.content}
          onChange={(e) => {
            onUpdate(cell.id, e.target.value);
            autoResize(e.target);
          }}
          onKeyDown={handleKeyDown}
          onBlur={() => setIsEditing(false)}
          className="w-full resize-none border-none outline-none bg-transparent font-mono text-sm leading-relaxed"
          style={{ minHeight: "80px", height: "auto" }}
          placeholder={
            cell.type === "code" ? "Enter Python code..." : "Enter markdown..."
          }
          rows={Math.max(3, cell.content.split("\n").length)}
        />
      );
    }

    if (cell.type === "code") {
      return (
        <div className="w-full min-h-[80px]">
          <pre className="font-mono text-sm whitespace-pre-wrap overflow-x-auto p-2 bg-gray-50 dark:bg-gray-900 rounded border">
            <code className="text-blue-600 dark:text-blue-400">
              {cell.content || "Click to edit..."}
            </code>
          </pre>
        </div>
      );
    }

    return (
      <div className="prose prose-sm max-w-none">
        {cell.content ? (
          <div
            dangerouslySetInnerHTML={{
              __html: cell.content.replace(/\n/g, "<br/>"),
            }}
          />
        ) : (
          <span className="text-muted-foreground italic">Click to edit...</span>
        )}
      </div>
    );
  };

  return (
    <Card
      className={`notebook-cell group relative mb-2 transition-all duration-200 ${
        isSelected ? "ring-2 ring-blue-500" : "hover:shadow-md"
      }`}
      onClick={() => onSelect(cell.id)}
    >
      <div className="flex">
        {/* Execution Count / Cell Type Indicator */}
        <div className="notebook-cell-indicator flex flex-col items-center justify-start pt-4 pl-4 pr-2 min-w-[60px]">
          {cell.type === "code" ? (
            <div className="flex flex-col items-center space-y-2">
              <Badge variant="outline" className="text-xs">
                [{cell.executionCount || " "}]
              </Badge>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onExecute(cell.id);
                }}
                disabled={cell.isExecuting}
                className="w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Play className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Badge variant="secondary" className="text-xs">
              MD
            </Badge>
          )}
        </div>

        {/* Cell Content */}
        <div className="notebook-cell-content flex-1 p-4 pl-2">
          <div
            className="min-h-[80px] cursor-text"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
          >
            {renderContent()}
          </div>

          {/* Output */}
          {cell.output && cell.type === "code" && (
            <div
              className={`notebook-cell-output mt-4 p-3 rounded-md border-l-4 ${
                cell.hasError
                  ? "bg-red-50 dark:bg-red-900/20 border-red-500"
                  : "bg-gray-50 dark:bg-gray-900 border-green-500"
              }`}
            >
              <pre
                className={`text-sm whitespace-pre-wrap overflow-x-auto ${
                  cell.hasError ? "text-red-700 dark:text-red-300" : ""
                }`}
              >
                {cell.output}
              </pre>
            </div>
          )}

          {/* Loading indicator */}
          {cell.isExecuting && (
            <div className="notebook-cell-loading mt-2 flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Executing...</span>
            </div>
          )}
        </div>

        {/* Cell Actions */}
        <div className="notebook-cell-actions flex items-start justify-end pt-4 pr-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-white dark:bg-gray-800 border shadow-lg"
            >
              <DropdownMenuItem
                onClick={() =>
                  onTypeChange(
                    cell.id,
                    cell.type === "code" ? "markdown" : "code"
                  )
                }
              >
                {cell.type === "code" ? (
                  <>
                    <Type className="w-4 h-4 mr-2" />
                    To Markdown
                  </>
                ) : (
                  <>
                    <Code className="w-4 h-4 mr-2" />
                    To Code
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(cell.id)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Cell
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
};
