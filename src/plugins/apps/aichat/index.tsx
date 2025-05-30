import React from "react";

import { Plugin } from "../../types";
import { manifest } from "./manifest";
import AIChatContent from "./ui";

/**
 * AI Chat plugin
 */
const AIChatPlugin: Plugin = {
  id: manifest.id,
  manifest,
  init: async () => {
    console.log("AI Chat plugin initialized");
  },
  render: () => {
    return <AIChatContent />;
  },
};

export default AIChatPlugin;
