import { Edge, Node } from '@xyflow/react';

// Define the initial nodes for the flow editor
export const initialNodes: Node[] = [
  {
    id: "node-1",
    type: "apiNode",
    position: { x: 100, y: 100 },
    data: {
      label: "API Node 1",
      endpoint: "getData",
      description: "Retrieves data from API",
      executionInputs: [],
      executionOutputs: [
        { id: "exec-out-1", type: "execution", label: "Next" },
      ],
      inputs: [],
      outputs: [
        { id: "output-1", type: "output", label: "Result", dataType: "object" },
      ],
    },
  },
  {
    id: "node-2",
    type: "apiNode",
    position: { x: 400, y: 200 },
    data: {
      label: "API Node 2",
      endpoint: "processData",
      description: "Process the retrieved data",
      executionInputs: [{ id: "exec-in-1", type: "execution", label: "Start" }],
      executionOutputs: [
        { id: "exec-out-1", type: "execution", label: "Next" },
      ],
      inputs: [
        { id: "input-1", type: "input", label: "Data", dataType: "object" },
      ],
      outputs: [
        {
          id: "output-1",
          type: "output",
          label: "Processed",
          dataType: "object",
        },
      ],
    },
  },
];

// Define the initial edges connecting the nodes
export const initialEdges: Edge[] = [
  {
    id: "edge-1",
    source: "node-1",
    sourceHandle: "exec-out-1",
    target: "node-2",
    targetHandle: "exec-in-1",
    type: "custom",
  },
  {
    id: "edge-2",
    source: "node-1",
    sourceHandle: "output-1",
    target: "node-2",
    targetHandle: "input-1",
    type: "custom",
  },
];
