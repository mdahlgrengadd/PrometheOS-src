import { EdgeTypes, NodeTypes } from '@xyflow/react';

import ApiAppNode from '../features/workflow-editor/components/ApiAppNode';
import ApiNode from '../features/workflow-editor/components/ApiNode';
import BeginWorkflowNode from '../features/workflow-editor/components/BeginWorkflowNode';
import CustomEdge from '../features/workflow-editor/components/CustomEdge';
import DataTypeConversionNode from '../features/workflow-editor/components/DataTypeConversionNode';
import NumberPrimitiveNode from '../features/workflow-editor/components/NumberPrimitiveNode';
import StringPrimitiveNode from '../features/workflow-editor/components/StringPrimitiveNode';
import { validateConnection } from '../utils/validateConnection';

/**
 * Registry of all node types available in the flow editor
 */
export const nodeTypes: NodeTypes = {
  apiNode: ApiNode,
  apiAppNode: ApiAppNode,
  beginWorkflow: BeginWorkflowNode,
  stringPrimitive: StringPrimitiveNode,
  numberPrimitive: NumberPrimitiveNode,
  dataTypeConversion: DataTypeConversionNode,
};

/**
 * Registry of all edge types available in the flow editor
 */
export const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
};

/**
 * Export utility functions for use in FlowCanvas
 */
export { validateConnection };

/**
 * Export parameter mapping utilities
 */
export { mapSetValueAction, mapGeneralAction } from "../utils/parameterMapping";

/**
 * Export PIN creation hooks
 */
export { useDataPin, useExecPin } from "../hooks/usePin";
