import { AlertTriangle, Database, RefreshCw } from "lucide-react";
import React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useFileSystemStore } from "@/store/fileSystem";
import { virtualFs } from "@/utils/virtual-fs";

interface VFSDebugPanelProps {
  className?: string;
}

const VFSDebugPanel: React.FC<VFSDebugPanelProps> = ({ className }) => {
  const { forceReload } = useFileSystemStore();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleForceReload = async () => {
    if (
      confirm(
        "⚠️ Force reload will destroy all runtime-created files (like published apps). Continue?"
      )
    ) {
      setIsLoading(true);
      try {
        await forceReload();
        console.log("[VFSDebugPanel] Force reload completed");
      } catch (error) {
        console.error("[VFSDebugPanel] Force reload failed:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const isInitialized = virtualFs.isInitialized();
  const rootItems = virtualFs.getRootFileSystemItem().children || [];
  const publishedAppsFolder = rootItems.find(
    (item) => item.id === "published-apps"
  );

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Database className="w-4 h-4" />
          Virtual File System Debug
        </CardTitle>
        <CardDescription className="text-xs">
          Global VFS singleton status and controls
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status:</span>
          <Badge variant={isInitialized ? "default" : "secondary"}>
            {isInitialized ? "Initialized" : "Not Initialized"}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Root Items:</span>
          <span className="text-sm font-mono">{rootItems.length} items</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Published Apps:</span>
          <Badge variant={publishedAppsFolder ? "default" : "secondary"}>
            {publishedAppsFolder
              ? `${publishedAppsFolder.children?.length || 0} apps`
              : "Not Found"}
          </Badge>
        </div>

        {publishedAppsFolder &&
          publishedAppsFolder.children &&
          publishedAppsFolder.children.length > 0 && (
            <div className="border-t pt-2">
              <span className="text-xs text-muted-foreground">
                Published Apps:
              </span>
              <div className="mt-1 space-y-1">
                {publishedAppsFolder.children.map((app) => (
                  <div
                    key={app.id}
                    className="text-xs font-mono bg-muted px-2 py-1 rounded"
                  >
                    {app.name}
                  </div>
                ))}
              </div>
            </div>
          )}

        <div className="border-t pt-3">
          <Button
            onClick={handleForceReload}
            disabled={isLoading}
            variant="destructive"
            size="sm"
            className="w-full"
          >
            {isLoading ? (
              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
            ) : (
              <AlertTriangle className="w-3 h-3 mr-1" />
            )}
            Force Reload from Shadow
          </Button>
          <p className="text-xs text-muted-foreground mt-1">
            ⚠️ Destroys published apps and user-created files
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VFSDebugPanel;
