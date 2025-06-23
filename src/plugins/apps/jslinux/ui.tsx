import React, { useEffect, useRef } from "react";

import { Plugin, PluginInitData } from "../../types";
import { manifest } from "./manifest";

// Create a React component for JSLinux
const JSLinuxComponent: React.FC<{ initData?: PluginInitData }> = ({
  initData,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // The iframe will load the JSLinux HTML file
    // All the JSLinux files are already in the jslinux directory
  }, []);
  return (
    <div className="w-full h-full flex flex-col">
      <iframe
        ref={iframeRef}
        src={`${import.meta.env.BASE_URL}jslinux/index.html`}
        className="w-full h-full border-0"
        title="JSLinux"
        allow="cross-origin-isolated"
        sandbox="allow-scripts allow-same-origin allow-downloads"
      />
    </div>
  );
};

// Create the plugin object with proper initData handling
let currentInitData: PluginInitData | undefined;

const JSLinuxPlugin: Plugin = {
  id: manifest.id,
  manifest,
  init: async (initData?: PluginInitData) => {
    currentInitData = initData;
  },
  render: () => <JSLinuxComponent initData={currentInitData} />,
  onOpen: (initData?: PluginInitData) => {
    currentInitData = initData;
    console.log("[JSLinux] Plugin opened", initData);
  },
  onClose: () => {
    console.log("[JSLinux] Plugin closed");
  },
};

export default JSLinuxPlugin;
