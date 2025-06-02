
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, FileX } from "lucide-react";

interface MissingFilesDialogProps {
  open: boolean;
  missingFiles: string[];
  onContinue: () => void;
  onAbort: () => void;
}

const MissingFilesDialog: React.FC<MissingFilesDialogProps> = ({
  open,
  missingFiles,
  onContinue,
  onAbort
}) => {
  return (
    <Dialog open={open} onOpenChange={() => onAbort()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Missing Files Detected
          </DialogTitle>
          <DialogDescription>
            The Python script references files that are not available in the browser environment.
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive">
          <FileX className="h-4 w-4" />
          <AlertTitle>Missing Files:</AlertTitle>
          <AlertDescription>
            <ul className="mt-2 space-y-1">
              {missingFiles.map((file, index) => (
                <li key={index} className="text-sm font-mono bg-muted px-2 py-1 rounded">
                  {file}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>

        <div className="text-sm text-muted-foreground">
          <p className="mb-2">You can:</p>
          <ul className="space-y-1 ml-4">
            <li>• <strong>Continue:</strong> Mock file operations and proceed with analysis</li>
            <li>• <strong>Abort:</strong> Cancel processing and upload the required files</li>
          </ul>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onAbort}>
            Abort
          </Button>
          <Button onClick={onContinue}>
            Continue with Mocks
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MissingFilesDialog;
