import React, { useState } from "react";

import { ThemeInstallResult } from "@/lib/theme-types";
import { useTheme } from "@/lib/ThemeProvider";

interface ThemeInstallerProps {
  onInstall?: () => void;
  onCancel?: () => void;
}

const ThemeInstaller: React.FC<ThemeInstallerProps> = ({
  onInstall,
  onCancel,
}) => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { installTheme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!url.trim()) {
        throw new Error("Please enter a valid URL");
      }

      const result = await installTheme(url);

      if (result.success) {
        setSuccess("Theme installed successfully!");
        setUrl("");

        // Auto close after success
        setTimeout(() => {
          onInstall?.();
        }, 1500);
      } else {
        setError(
          result.error ||
            "Failed to install theme. The manifest may be invalid."
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to install theme");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="theme-installer bg-background p-4 rounded-lg shadow-lg w-full max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4 pb-2 border-b">
        <h2 className="text-xl font-semibold text-foreground">Install Theme</h2>
        <button
          onClick={onCancel}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="theme-url"
            className="block text-sm font-medium text-foreground mb-1"
          >
            Theme Manifest URL:
          </label>
          <input
            type="url"
            id="theme-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/theme-manifest.json"
            disabled={isLoading}
            className="w-full p-2 bg-background border border-border rounded-md text-foreground"
          />
        </div>

        {error && (
          <div className="p-2 mb-4 bg-destructive/10 text-destructive rounded-md text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="p-2 mb-4 bg-green-100 text-green-800 rounded-md text-sm">
            {success}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-3 py-1.5 border border-border rounded-md text-foreground"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md disabled:opacity-50"
          >
            {isLoading ? "Installing..." : "Install Theme"}
          </button>
        </div>
      </form>

      <div className="mt-4 p-2 text-xs text-muted-foreground bg-muted rounded-md">
        <p>
          <strong>Note:</strong> Only install themes from trusted sources.
          External themes might include JavaScript that runs in your browser.
        </p>
      </div>
    </div>
  );
};

export default ThemeInstaller;
