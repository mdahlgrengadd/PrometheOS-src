import React from 'react';

import { WorkingWasmTerminal } from './components/WorkingWasmTerminal';

export default function TerminalApp() {
  return (
    <div className="w-full h-full">
      <WorkingWasmTerminal className="w-full h-full" />
    </div>
  );
}
