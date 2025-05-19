import React from "react";

import { Plugin } from "../../types";
import { manifest } from "./manifest";
import WorkerChatWindow from "./ui";

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
