import { AlertTriangle, X } from "lucide-react";
import React, { useEffect, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useFileSystemStore } from "@/store/fileSystem";

import useIdeStore from "../store/ide-store";

interface PublishDialogProps {
  open: boolean;
  onClose: () => void;
  currentFileName?: string;
  previewTabId?: string;
}

interface PublishData {
  name: string;
  description: string;
  version: string;
  author: string;
  category: string;
}

const PublishDialog: React.FC<PublishDialogProps> = ({
  open,
  onClose,
  currentFileName,
  previewTabId,
}) => {
  const { publishAppWithData, isBuilding } = useIdeStore();
  const fileSystem = useFileSystemStore((state) => state.fs);

  const [publishData, setPublishData] = useState<PublishData>({
    name: "",
    description: "",
    version: "1.0.0",
    author: "",
    category: "Utility",
  });

  const [existingApp, setExistingApp] = useState<string | null>(null);
  const [confirmOverwrite, setConfirmOverwrite] = useState(false);

  // Initialize form with current file name
  useEffect(() => {
    if (open && currentFileName) {
      const appName = currentFileName.replace(/\.[^/.]+$/, ""); // Remove extension
      setPublishData((prev) => ({
        ...prev,
        name: appName,
      }));
    }
  }, [open, currentFileName]);

  // Check if app already exists when name changes
  useEffect(() => {
    if (!publishData.name) {
      setExistingApp(null);
      setConfirmOverwrite(false);
      return;
    }

    const publishedAppsFolder = fileSystem.children?.find(
      (child) => child.id === "published-apps"
    );

    if (publishedAppsFolder?.children) {
      const existingAppFolder = publishedAppsFolder.children.find(
        (child) => child.name === `${publishData.name}.exe`
      );
      if (existingAppFolder) {
        setExistingApp(existingAppFolder.name);
        setConfirmOverwrite(false);
      } else {
        setExistingApp(null);
        setConfirmOverwrite(false);
      }
    }
  }, [publishData.name, fileSystem]);

  const handleInputChange = (field: keyof PublishData, value: string) => {
    setPublishData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePublish = async () => {
    if (!publishData.name.trim()) {
      return;
    }

    // If app exists and user hasn't confirmed overwrite, require confirmation
    if (existingApp && !confirmOverwrite) {
      setConfirmOverwrite(true);
      return;
    }

    try {
      await publishAppWithData(publishData, previewTabId);
      onClose();
      // Reset form
      setPublishData({
        name: "",
        description: "",
        version: "1.0.0",
        author: "",
        category: "Utility",
      });
      setConfirmOverwrite(false);
    } catch (error) {
      console.error("Publish failed:", error);
    }
  };

  const handleClose = () => {
    setConfirmOverwrite(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Publish App
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 p-0"
            >
              <X size={16} />
            </Button>
          </DialogTitle>
          <DialogDescription>
            Publish your app to the Published Apps folder for easy access.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">App Name</Label>
            <Input
              id="name"
              value={publishData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter app name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={publishData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Brief description of your app"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                value={publishData.version}
                onChange={(e) => handleInputChange("version", e.target.value)}
                placeholder="1.0.0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={publishData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                placeholder="Utility"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="author">Author</Label>
            <Input
              id="author"
              value={publishData.author}
              onChange={(e) => handleInputChange("author", e.target.value)}
              placeholder="Your name"
            />
          </div>

          {existingApp && !confirmOverwrite && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                An app named "{existingApp}" already exists. Click Publish again
                to overwrite it.
              </AlertDescription>
            </Alert>
          )}

          {existingApp && confirmOverwrite && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Warning: This will overwrite the existing app "{existingApp}".
                This action cannot be undone.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handlePublish}
            disabled={isBuilding || !publishData.name.trim()}
          >
            {isBuilding
              ? "Publishing..."
              : confirmOverwrite
              ? "Confirm Overwrite"
              : "Publish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PublishDialog;
