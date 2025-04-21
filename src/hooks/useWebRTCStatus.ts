import { useEffect, useState } from "react";

import { webRTCStore } from "../store/webrtcStatus";

export function useWebRTCStatus() {
  const [isConnected, setIsConnected] = useState(
    webRTCStore.getConnectionState()
  );

  useEffect(() => {
    // Subscribe to connection state changes
    const unsubscribe = webRTCStore.subscribe((connected) => {
      setIsConnected(connected);
    });

    // Clean up subscription on unmount
    return unsubscribe;
  }, []);

  return {
    isConnected,
    setConnected: webRTCStore.setConnectionState,
  };
}
