import "../styles/PluginInstaller.css";

import React, { useState } from "react";

import { usePlugins } from "../plugins/PluginContext";

interface PluginInstallerProps {
  onClose: () => void;
}

const PluginInstaller: React.FC<PluginInstallerProps> = ({ onClose }) => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { installRemoteApp } = usePlugins();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!url.trim()) {
        throw new Error("Please enter a valid URL");
      }

      await installRemoteApp(url);
      setSuccess("Plugin installed successfully!");
      setUrl("");

      // Auto close after success
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to install plugin");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="plugin-installer">
      <div className="plugin-installer-header">
        <h2>Install Remote Plugin</h2>
        <button onClick={onClose} className="close-button">
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="plugin-url">Plugin Manifest URL:</label>
          <input
            type="url"
            id="plugin-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/plugin-manifest.json"
            disabled={isLoading}
            className="url-input"
          />
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="form-actions">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="cancel-button"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="install-button"
          >
            {isLoading ? "Installing..." : "Install Plugin"}
          </button>
        </div>
      </form>

      <div className="plugin-installer-info">
        <p>
          <strong>Note:</strong> Only install plugins from trusted sources.
          Third-party plugins have full access to the app and may contain
          malicious code.
        </p>
      </div>
    </div>
  );
};

export default PluginInstaller;
