import React from "react";

import FlowCanvas from "./components/FlowCanvas";

export { default as ApiNode } from "./components/ApiNode";
export { default as CustomEdge } from "./components/CustomEdge";
export { default as ExecutionPin } from "./components/ExecutionPin";
export { default as InputPin } from "./components/InputPin";
export { default as OutputPin } from "./components/OutputPin";
export { default as NodeCreationMenu } from "./components/NodeCreationMenu";
export { default as DataTypeConversionNode } from "./components/DataTypeConversionNode";

export * from "./types/flowTypes";

const FlowEditor: React.FC = () => {
  return (
    <div className="h-full w-full overflow-hidden">
      <FlowCanvas />
    </div>
  );
};

export default FlowEditor;
