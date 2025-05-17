import React, { useState } from "react";

import { Plugin, PluginManifest } from "../../types";
import WorkerChatWindow from "./components/WorkerChatWindow";

// Create manifest for the plugin
import { manifest } from './manifest';

// Create the plugin
const WebLLMChatPlugin: Plugin = {
  id: manifest.id,
  manifest,
  init: async () => {
    console.log("Worker WebLLM Chat plugin initialized");
  },
  render: () => {
    return <WorkerChatWindow />;
  },
};

export default WebLLMChatPlugin;

