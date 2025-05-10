import React, { useState } from 'react';

import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/franky-ui-kit/AlertDialog';
import { WindowsButton } from '@/components/franky-ui-kit/Button';

import { usePlugins } from '../plugins/PluginContext';

const InstalledPluginsList: React.FC = () => {
  const { getDynamicPlugins, uninstallPlugin } = usePlugins();
  const dynamicPlugins = getDynamicPlugins();
  const [isUninstallDialogOpen, setIsUninstallDialogOpen] = useState(false);
  const [pluginToUninstall, setPluginToUninstall] = useState<string | null>(
    null
  );
  const [isUninstalling, setIsUninstalling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // No plugins message
  if (dynamicPlugins.length === 0) {
    return (
      <div className="border rounded-md p-4 mb-4">
        <h4 className="font-medium mb-2">Installed Plugins</h4>
        <p className="text-sm text-muted-foreground">
          No third-party plugins are currently installed.
        </p>
      </div>
    );
  }

  const handleUninstallClick = (pluginId: string) => {
    setPluginToUninstall(pluginId);
    setIsUninstallDialogOpen(true);
    setError(null);
  };

  const confirmUninstall = async () => {
    if (!pluginToUninstall) return;

    setIsUninstalling(true);
    try {
      await uninstallPlugin(pluginToUninstall);
      setIsUninstallDialogOpen(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to uninstall plugin"
      );
    } finally {
      setIsUninstalling(false);
    }
  };

  return (
    <>
      <div className="border rounded-md p-4 mb-4">
        <h4 className="font-medium mb-2">Installed Plugins</h4>

        {error && (
          <div className="bg-red-100 text-red-800 p-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="divide-y">
          {dynamicPlugins.map((plugin) => (
            <div
              key={plugin.id}
              className="py-3 flex items-center justify-between"
            >
              <div className="flex items-center">
                <div className="h-10 w-10 mr-3 flex-shrink-0">
                  {plugin.manifest.icon}
                </div>
                <div>
                  <h5 className="font-medium">{plugin.manifest.name}</h5>
                  <p className="text-sm text-muted-foreground">
                    v{plugin.manifest.version} • {plugin.manifest.author}
                  </p>
                </div>
              </div>{" "}
              <WindowsButton
                variant="outline"
                size="sm"
                onClick={() => handleUninstallClick(plugin.id)}
              >
                Uninstall
              </WindowsButton>
            </div>
          ))}
        </div>
      </div>

      <AlertDialog
        open={isUninstallDialogOpen}
        onOpenChange={setIsUninstallDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Uninstall Plugin</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to uninstall this plugin? This will remove
              it completely from your system.
              {error && (
                <div className="bg-red-100 text-red-800 p-2 rounded mt-4 text-sm">
                  {error}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUninstalling}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmUninstall}
              disabled={isUninstalling}
              className={isUninstalling ? "opacity-50 cursor-not-allowed" : ""}
            >
              {isUninstalling ? "Uninstalling..." : "Uninstall"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default InstalledPluginsList;
