import { Circle, Pause, Save, X } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { useMacros } from '../context/MacroContext';

/**
 * MacroRecorder component
 * Provides UI for recording and saving macros
 */
export const MacroRecorder: React.FC = () => {
  const {
    startRecording,
    stopRecording,
    cancelRecording,
    isRecording,
    currentRecording,
  } = useMacros();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [macroName, setMacroName] = useState("");
  const [macroDescription, setMacroDescription] = useState("");

  const recording = isRecording();

  /**
   * Handle starting a new recording
   */
  const handleStartRecording = () => {
    startRecording();
  };

  /**
   * Handle stopping the current recording
   */
  const handleStopRecording = () => {
    setSaveDialogOpen(true);
  };

  /**
   * Handle cancelling the current recording
   */
  const handleCancelRecording = () => {
    cancelRecording();
  };

  /**
   * Handle saving the recorded macro
   */
  const handleSaveMacro = () => {
    if (!macroName.trim()) return;

    stopRecording(macroName.trim(), macroDescription.trim() || undefined);
    setSaveDialogOpen(false);
    setMacroName("");
    setMacroDescription("");
  };

  return (
    <>
      <div className="fixed bottom-4 right-4 flex gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg z-50">
        {!recording ? (
          <Button
            variant="outline"
            onClick={handleStartRecording}
            className="flex items-center gap-1"
            data-testid="start-recording-btn"
          >
            <Circle className="h-4 w-4 fill-red-500 text-red-500" />
            Record Actions
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={handleStopRecording}
              className="flex items-center gap-1"
              data-testid="stop-recording-btn"
            >
              <Pause className="h-4 w-4" />
              Stop ({currentRecording.length}{" "}
              {currentRecording.length === 1 ? "step" : "steps"})
            </Button>
            <Button
              variant="outline"
              onClick={handleCancelRecording}
              className="flex items-center gap-1"
              data-testid="cancel-recording-btn"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </>
        )}
      </div>

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Macro</DialogTitle>
            <DialogDescription>
              Give your recorded actions a name and description for later use.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="macro-name">Macro Name</Label>
              <Input
                id="macro-name"
                value={macroName}
                onChange={(e) => setMacroName(e.target.value)}
                placeholder="Enter a name for this macro"
                data-testid="macro-name-input"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="macro-description">Description (optional)</Label>
              <Textarea
                id="macro-description"
                value={macroDescription}
                onChange={(e) => setMacroDescription(e.target.value)}
                placeholder="Describe what this macro does"
                data-testid="macro-description-input"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSaveDialogOpen(false)}
              data-testid="cancel-save-btn"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveMacro}
              disabled={!macroName.trim()}
              data-testid="save-macro-btn"
            >
              <Save className="h-4 w-4 mr-1" />
              Save Macro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
