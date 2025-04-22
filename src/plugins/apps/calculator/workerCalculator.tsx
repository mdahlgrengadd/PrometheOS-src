import React from "react";

import { Plugin, PluginManifest } from "../../types";
import WorkerCalculatorContent from "./WorkerCalculatorContent";

export const manifest: PluginManifest = {
  id: "worker-calculator",
  name: "Worker Calculator",
  version: "1.0.0",
  description: "A calculator that runs in a Web Worker",
  author: "Desktop System",
  icon: (
    <img
      src="/icons/34689_beos_blocks_cubos_serv_app_beos_blocks_cubos_serv_app.png"
      className="h-8 w-8"
      alt="Worker Calculator"
    />
  ),
  entry: "apps/calculator/worker",
  preferredSize: {
    width: 320,
    height: 420, // Slightly taller to accommodate the "Worker Calculator" label
  },
};

const WorkerCalculatorPlugin: Plugin = {
  id: manifest.id,
  manifest,
  init: async () => {
    console.log("Worker Calculator plugin initialized");
  },
  render: () => {
    return <WorkerCalculatorContent />;
  },
};

export default WorkerCalculatorPlugin;
