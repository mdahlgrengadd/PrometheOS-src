import { Info, Play, Trash } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from '@/components/ui/card';
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { useMacros } from '../context/MacroContext';
import { Macro } from '../types';

/**
 * MacrosList component
 * Displays a list of saved macros with play and delete functionality
 */
export const MacrosList: React.FC = () => {
  const { macros, playMacro, deleteMacro } = useMacros();
  const [macroDetails, setMacroDetails] = useState<Macro | null>(null);

  /**
   * Handle playing a macro
   */
  const handlePlayMacro = (macroId: string) => {
    playMacro(macroId);
  };

  /**
   * Handle deleting a macro
   */
  const handleDeleteMacro = (macroId: string) => {
    deleteMacro(macroId);
  };

  /**
   * Show macro details
   */
  const showMacroDetails = (macro: Macro) => {
    setMacroDetails(macro);
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Saved Macros</CardTitle>
          <CardDescription>Your recorded automation sequences</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-80">
            {macros.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No macros saved yet. Record some actions to create macros.
              </div>
            ) : (
              <div className="space-y-3">
                {macros.map((macro) => (
                  <div
                    key={macro.id}
                    className="flex items-center justify-between gap-2 border p-3 rounded-md"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{macro.name}</div>
                      {macro.description && (
                        <div className="text-sm text-gray-500 truncate">
                          {macro.description}
                        </div>
                      )}
                      <div className="text-xs text-gray-400">
                        {macro.steps.length}{" "}
                        {macro.steps.length === 1 ? "step" : "steps"}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => showMacroDetails(macro)}
                              data-testid={`info-macro-${macro.id}`}
                            >
                              <Info className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>View details</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handlePlayMacro(macro.id)}
                              data-testid={`play-macro-${macro.id}`}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Play macro</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteMacro(macro.id)}
                              data-testid={`delete-macro-${macro.id}`}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete macro</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
        <CardFooter className="flex justify-between text-xs text-gray-500">
          {macros.length} {macros.length === 1 ? "macro" : "macros"} saved
        </CardFooter>
      </Card>

      <Dialog
        open={!!macroDetails}
        onOpenChange={(open) => !open && setMacroDetails(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{macroDetails?.name}</DialogTitle>
            <DialogDescription>
              {macroDetails?.description || "No description provided"}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <h4 className="font-medium mb-2">Macro Steps:</h4>
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {macroDetails?.steps.map((step, index) => (
                  <div key={index} className="border p-2 rounded-md text-sm">
                    <div className="font-medium">{step.actionType}</div>
                    {step.parameters &&
                      Object.keys(step.parameters).length > 0 && (
                        <pre className="text-xs mt-1 p-1 bg-gray-100 dark:bg-gray-800 rounded overflow-x-auto">
                          {JSON.stringify(step.parameters, null, 2)}
                        </pre>
                      )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setMacroDetails(null)}>
              Close
            </Button>
            {macroDetails && (
              <Button onClick={() => handlePlayMacro(macroDetails.id)}>
                <Play className="h-4 w-4 mr-1" />
                Play Macro
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
