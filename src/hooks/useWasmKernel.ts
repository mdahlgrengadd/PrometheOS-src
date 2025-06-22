import { useContext } from 'react';

import { WasmKernelContext } from '@/lib/wasm/context';

export const useWasmKernel = () => {
  const context = useContext(WasmKernelContext);
  if (!context) {
    throw new Error("useWasmKernel must be used within a WasmKernelProvider");
  }
  return context;
};
