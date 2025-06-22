import { createContext } from 'react';

import type { WasmKernelState, WasmKernelAPI } from "./types";

export interface WasmKernelContextType {
  state: WasmKernelState;
  api: WasmKernelAPI | null;
  initialize: () => Promise<void>;
}

export const WasmKernelContext = createContext<WasmKernelContextType | null>(
  null
);
