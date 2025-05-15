// A simple global store for WebRTC connection status
let isConnected = false;

// Event name for connection state changes
const CONNECTION_STATE_CHANGE = "webrtc:connectionchange";

// Custom event setup for notifying components of changes
const notifyConnectionChange = (connected: boolean) => {
  console.log("WebRTC store: Notifying connection change to:", connected);

  // Dispatch a custom event that components can listen for
  window.dispatchEvent(
    new CustomEvent(CONNECTION_STATE_CHANGE, { detail: { connected } })
  );
};

export const webRTCStore = {
  // Get the current connection state
  getConnectionState: () => isConnected,

  // Update the connection state
  setConnectionState: (connected: boolean) => {
    console.log("WebRTC store: Setting connection state to:", connected);
    isConnected = connected;
    notifyConnectionChange(connected);
  },

  // Subscribe to connection state changes
  subscribe: (callback: (connected: boolean) => void) => {
    console.log("WebRTC store: New subscription registered");

    const handler = (e: Event) => {
      const customEvent = e as CustomEvent;
      console.log(
        "WebRTC store: Event received, notifying subscriber with state:",
        customEvent.detail.connected
      );
      callback(customEvent.detail.connected);
    };

    window.addEventListener(CONNECTION_STATE_CHANGE, handler);

    // Return an unsubscribe function
    return () => {
      console.log("WebRTC store: Unsubscribing listener");
      window.removeEventListener(CONNECTION_STATE_CHANGE, handler);
    };
  },
};
