import React from "react";

import { Plugin, PluginInitData } from "../../types";
import { manifest } from "./manifest";

// Global state for init data
let globalInitData: PluginInitData | undefined;

const UrlTestComponent: React.FC<{ initData?: PluginInitData }> = ({
  initData,
}) => {
  const [currentData, setCurrentData] = React.useState(initData);

  // Update when initData changes
  React.useEffect(() => {
    setCurrentData(initData);
  }, [initData]);

  return (
    <div className="p-4 h-full flex flex-col space-y-4">
      <h2 className="text-xl font-bold">URL Scheme Test Plugin</h2>

      {currentData ? (
        <div className="flex-1 space-y-4">
          <div className="bg-gray-100 p-3 rounded">
            <h3 className="font-semibold text-lg mb-2">Initialization Data:</h3>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Original URL:</strong>{" "}
                <code className="bg-white px-1 rounded">
                  {currentData.initFromUrl}
                </code>
              </div>
              <div>
                <strong>Detected Scheme:</strong>{" "}
                <span className="font-mono bg-blue-100 px-2 py-1 rounded">
                  {currentData.scheme}
                </span>
              </div>
              {currentData.error && (
                <div className="text-red-600">
                  <strong>Error:</strong> {currentData.error}
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded flex-1">
            <h3 className="font-semibold mb-2">Content:</h3>
            <div className="bg-white p-2 rounded border h-full overflow-auto">
              <pre className="text-sm whitespace-pre-wrap">
                {currentData.content}
              </pre>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="text-gray-500">No initialization data provided</div>
            <div className="text-sm text-gray-400">
              <p>Try opening this plugin with URL parameters:</p>
              <ul className="mt-2 space-y-1 text-left">
                <li>
                  <code>
                    ?plugin=url-test&initFromUrl=https://api.github.com/zen
                  </code>
                </li>
                <li>
                  <code>
                    ?plugin=url-test&initFromUrl=data://base64,SGVsbG8gV29ybGQh
                  </code>
                </li>
                <li>
                  <code>
                    ?plugin=url-test&initFromUrl=vfs://documents/readme.txt
                  </code>
                </li>
                <li>
                  <code>?plugin=url-test&initFromUrl=Plain text content</code>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const UrlTestPlugin: Plugin = {
  id: manifest.id,
  manifest,

  init: async (initData?: PluginInitData) => {
    console.log(
      "[UrlTestPlugin] Initialized",
      initData ? "with init data" : "without init data"
    );
    globalInitData = initData;
  },

  onOpen: (initData?: PluginInitData) => {
    console.log(
      "[UrlTestPlugin] Opened",
      initData ? "with init data" : "without init data"
    );
    if (initData) {
      globalInitData = initData;
    }
  },

  render: () => {
    return <UrlTestComponent initData={globalInitData} />;
  },
};

export default UrlTestPlugin;
