import { PluginManifest } from "../../types";

export const manifest: PluginManifest = {
  id: "pyodide-test",
  name: "Pyodide Test",
  description: "Test Python execution with Pyodide worker integration",
  version: "1.0.0",
  author: "Desktop Dreamscape",
  category: "Development",
  permissions: ["worker"],
  // Use relative path; loader will prepend base path automatically
  workerEntrypoint: "worker/pyodide.js",
  tags: ["python", "testing", "development"],
  iconUrl: import.meta.env.BASE_URL + "icons/python-icon.png", // Use base for icon as well
};
