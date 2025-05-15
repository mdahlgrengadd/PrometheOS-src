import { useCallback, useEffect, useRef, useState } from "react";

export interface WebRTCSession {
  localOffer: string | null;
  localAnswer: string | null;
  connected: boolean;
  messages: string[];
  // Host calls this first:
  createOffer: () => Promise<void>;
  // Joiner calls this after scanning host's QR:
  acceptOffer: (offerJson: string) => Promise<void>;
  // Host calls this after scanning joiner's QR:
  acceptAnswer: (answerJson: string) => Promise<void>;
  // Both can send messages:
  sendMessage: (msg: string) => void;
  // Set a custom message handler
  setMessageHandler: (handler: (data: string) => void) => void;
}

type ConnectionData = {
  sdp: RTCSessionDescriptionInit | null;
  ice: RTCIceCandidateInit[];
};

// Singleton RTCPeerConnection instance to prevent recreating it on component re-renders
let peerConnectionInstance: RTCPeerConnection | null = null;
let dataChannelInstance: RTCDataChannel | null = null;

export function useWebRTCSession(
  iceServers: RTCIceServer[] = [{ urls: "stun:stun.l.google.com:19302" }]
): WebRTCSession {
  const iceCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const customHandlerRef = useRef<((data: string) => void) | null>(null);
  const [localOffer, setLocalOffer] = useState<string | null>(null);
  const [localAnswer, setLocalAnswer] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const initRef = useRef(false);

  // Setup data channel event handlers
  const setupDataChannel = useCallback((dc: RTCDataChannel) => {
    console.log("Setting up data channel");

    dc.onopen = () => {
      console.log("WebRTC data channel opened - CONNECTION SUCCESSFUL");
      setConnected(true);
    };

    dc.onclose = () => {
      console.log("WebRTC data channel closed - CONNECTION LOST");
      setConnected(false);
    };

    dc.onmessage = (e) => {
      console.log("Received message:", e.data);
      setMessages((m) => [...m, `peer: ${e.data}`]);

      // Call custom handler if set
      if (customHandlerRef.current) {
        customHandlerRef.current(e.data);
      }
    };

    dc.onerror = (e) => {
      console.error("Data channel error:", e);
    };
  }, []);

  // Initialize peer connection just once
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    try {
      console.log("Creating RTCPeerConnection with servers:", iceServers);

      // Only create a new connection if one doesn't exist
      if (!peerConnectionInstance) {
        peerConnectionInstance = new RTCPeerConnection({
          iceServers,
          iceCandidatePoolSize: 10,
        });

        console.log("New RTCPeerConnection created:", peerConnectionInstance);

        // gather ICE candidates
        peerConnectionInstance.onicecandidate = (evt) => {
          console.log("ICE candidate:", evt.candidate);
          if (evt.candidate) {
            iceCandidatesRef.current.push(evt.candidate.toJSON());
          }
        };

        peerConnectionInstance.onicegatheringstatechange = () => {
          console.log(
            "ICE gathering state:",
            peerConnectionInstance?.iceGatheringState
          );
        };

        peerConnectionInstance.oniceconnectionstatechange = () => {
          console.log(
            "ICE connection state changed:",
            peerConnectionInstance?.iceConnectionState
          );

          // If the connection is established, log it
          if (
            peerConnectionInstance?.iceConnectionState === "connected" ||
            peerConnectionInstance?.iceConnectionState === "completed"
          ) {
            console.log("WebRTC ICE connection established successfully");
          }

          // If the connection is disconnected or failed, we can try to recreate it
          if (
            peerConnectionInstance?.iceConnectionState === "disconnected" ||
            peerConnectionInstance?.iceConnectionState === "failed"
          ) {
            console.log("Connection lost, cleanup for potential reconnection");
            // Don't close immediately, but allow for potential recovery
          }
        };

        // Add connection state change handler
        peerConnectionInstance.onconnectionstatechange = () => {
          console.log(
            "Connection state changed:",
            peerConnectionInstance?.connectionState
          );

          if (peerConnectionInstance?.connectionState === "connected") {
            console.log("WebRTC connection is now fully connected");
          }
        };

        // open your dataChannel when created by host
        peerConnectionInstance.ondatachannel = (evt) => {
          console.log("Received data channel from peer:", evt.channel.label);
          dataChannelInstance = evt.channel;
          setupDataChannel(evt.channel);
        };
      } else {
        console.log("Using existing RTCPeerConnection");
      }
    } catch (error) {
      console.error("Error setting up WebRTC:", error);
    }

    // Cleanup on component unmount - but don't destroy the singleton connection
    // unless it's in a failed state
    return () => {
      console.log("Component unmounting, but keeping PeerConnection alive");
      // Only clean up if the connection is in a failed state
      if (peerConnectionInstance?.iceConnectionState === "failed") {
        console.log("Cleaning up failed PeerConnection");
        peerConnectionInstance.close();
        peerConnectionInstance = null;
        dataChannelInstance = null;
        setConnected(false);
      }
    };
  }, [iceServers, setupDataChannel]);

  const createOffer = useCallback(async () => {
    try {
      if (!peerConnectionInstance) {
        console.error("No RTCPeerConnection available");
        return;
      }

      // Reset ice candidates collection
      iceCandidatesRef.current = [];

      // Only create a data channel if one doesn't exist
      if (!dataChannelInstance || dataChannelInstance.readyState === "closed") {
        console.log("Creating data channel");
        try {
          dataChannelInstance = peerConnectionInstance.createDataChannel(
            "sync",
            {
              ordered: true,
            }
          );
          console.log(
            "Data channel created successfully:",
            dataChannelInstance.label
          );
          setupDataChannel(dataChannelInstance);
        } catch (error) {
          console.error("Error creating data channel:", error);
        }
      } else {
        console.log(
          "Using existing data channel, state:",
          dataChannelInstance.readyState
        );
      }

      console.log("Creating offer");
      const offer = await peerConnectionInstance.createOffer();
      console.log("Created offer:", offer);

      await peerConnectionInstance.setLocalDescription(offer);
      console.log(
        "Set local description:",
        peerConnectionInstance.localDescription
      );

      // Wait for ICE gathering to complete or timeout after 5 seconds
      await new Promise<void>((resolve) => {
        console.log("Waiting for ICE gathering to complete");

        const checkState = () => {
          console.log(
            "Current ICE gathering state:",
            peerConnectionInstance?.iceGatheringState
          );
          if (peerConnectionInstance?.iceGatheringState === "complete") {
            console.log("ICE gathering complete");
            resolve();
          }
        };

        // First check if already complete
        checkState();

        // Set up listener for state changes
        const stateChangeHandler = () => checkState();
        peerConnectionInstance?.addEventListener(
          "icegatheringstatechange",
          stateChangeHandler
        );

        // Set up timeout fallback
        const timeout = setTimeout(() => {
          console.log(
            "ICE gathering timed out, proceeding with available candidates"
          );
          peerConnectionInstance?.removeEventListener(
            "icegatheringstatechange",
            stateChangeHandler
          );
          resolve();
        }, 5000);

        // Cleanup on resolution
        const cleanup = () => {
          clearTimeout(timeout);
          peerConnectionInstance?.removeEventListener(
            "icegatheringstatechange",
            stateChangeHandler
          );
        };

        // Set up cleanup on complete
        peerConnectionInstance?.addEventListener(
          "icegatheringstatechange",
          () => {
            if (peerConnectionInstance?.iceGatheringState === "complete") {
              cleanup();
              resolve();
            }
          }
        );
      });

      // bundle SDP + ICE into one JSON
      const connectionData: ConnectionData = {
        sdp: peerConnectionInstance.localDescription,
        ice: [...iceCandidatesRef.current],
      };

      console.log(
        "Connection data ready:",
        `SDP: ${connectionData.sdp?.type}`,
        `ICE candidates: ${connectionData.ice.length}`
      );

      setLocalOffer(JSON.stringify(connectionData));
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  }, [setupDataChannel]);

  const acceptOffer = useCallback(async (offerJson: string) => {
    try {
      if (!peerConnectionInstance) {
        console.error("No RTCPeerConnection available");
        return;
      }

      console.log("Accepting offer");

      try {
        console.log("Parsing offer JSON, length:", offerJson.length);
        console.log("First 100 chars of offer:", offerJson.substring(0, 100));

        const { sdp, ice } = JSON.parse(offerJson) as ConnectionData;
        console.log(
          "Parsed offer data:",
          `SDP: ${sdp?.type}`,
          `ICE candidates: ${ice?.length || 0}`
        );

        // Reset ice candidates collection
        iceCandidatesRef.current = [];

        if (sdp) {
          console.log("Setting remote description");
          await peerConnectionInstance.setRemoteDescription(
            new RTCSessionDescription(sdp)
          );
          console.log("Remote description set");
        } else {
          console.error("No SDP in offer");
          return;
        }

        if (Array.isArray(ice) && ice.length > 0) {
          console.log(`Adding ${ice.length} ICE candidates`);
          for (const candidate of ice) {
            try {
              await peerConnectionInstance.addIceCandidate(
                new RTCIceCandidate(candidate)
              );
            } catch (e) {
              console.warn("Failed to add ICE candidate:", e);
            }
          }
        } else {
          console.warn("No ICE candidates in offer");
        }

        // now create answer
        console.log("Creating answer");
        const answer = await peerConnectionInstance.createAnswer();
        console.log("Created answer:", answer);

        await peerConnectionInstance.setLocalDescription(answer);
        console.log(
          "Set local description for answer:",
          peerConnectionInstance.localDescription
        );

        // Wait for ICE gathering to complete or timeout after 5 seconds
        await new Promise<void>((resolve) => {
          console.log("Waiting for ICE gathering for answer");

          const checkState = () => {
            if (peerConnectionInstance?.iceGatheringState === "complete") {
              resolve();
            }
          };

          // First check if already complete
          checkState();

          // Set up listener for state changes
          const stateChangeHandler = () => checkState();
          peerConnectionInstance?.addEventListener(
            "icegatheringstatechange",
            stateChangeHandler
          );

          // Set up timeout fallback
          const timeout = setTimeout(() => {
            console.log(
              "ICE gathering for answer timed out, proceeding with available candidates"
            );
            peerConnectionInstance?.removeEventListener(
              "icegatheringstatechange",
              stateChangeHandler
            );
            resolve();
          }, 5000);

          // Cleanup on resolution
          const cleanup = () => {
            clearTimeout(timeout);
            peerConnectionInstance?.removeEventListener(
              "icegatheringstatechange",
              stateChangeHandler
            );
          };

          // Set up cleanup on complete
          peerConnectionInstance?.addEventListener(
            "icegatheringstatechange",
            () => {
              if (peerConnectionInstance?.iceGatheringState === "complete") {
                cleanup();
                resolve();
              }
            }
          );
        });

        const answerData: ConnectionData = {
          sdp: peerConnectionInstance.localDescription,
          ice: [...iceCandidatesRef.current],
        };

        console.log(
          "Answer data ready:",
          `SDP: ${answerData.sdp?.type}`,
          `ICE candidates: ${answerData.ice.length}`
        );

        setLocalAnswer(JSON.stringify(answerData));
      } catch (error) {
        console.error("Error parsing offer JSON:", error);
      }
    } catch (error) {
      console.error("Error accepting offer:", error);
    }
  }, []);

  const acceptAnswer = useCallback(async (answerJson: string) => {
    try {
      if (!peerConnectionInstance) {
        console.error("No RTCPeerConnection available");
        return;
      }

      console.log("Accepting answer");

      try {
        console.log("Parsing answer JSON, length:", answerJson.length);
        console.log("First 100 chars of answer:", answerJson.substring(0, 100));

        const { sdp, ice } = JSON.parse(answerJson) as ConnectionData;
        console.log(
          "Parsed answer data:",
          `SDP: ${sdp?.type}`,
          `ICE candidates: ${ice?.length || 0}`
        );

        if (sdp) {
          console.log("Setting remote description for answer");
          await peerConnectionInstance.setRemoteDescription(
            new RTCSessionDescription(sdp)
          );
          console.log("Remote description for answer set");
        } else {
          console.error("No SDP in answer");
          return;
        }

        if (Array.isArray(ice) && ice.length > 0) {
          console.log(`Adding ${ice.length} ICE candidates from answer`);
          for (const candidate of ice) {
            try {
              await peerConnectionInstance.addIceCandidate(
                new RTCIceCandidate(candidate)
              );
            } catch (e) {
              console.warn("Failed to add ICE candidate from answer:", e);
            }
          }
        } else {
          console.warn("No ICE candidates in answer");
        }
      } catch (error) {
        console.error("Error parsing answer JSON:", error);
      }
    } catch (error) {
      console.error("Error accepting answer:", error);
    }
  }, []);

  const sendMessage = useCallback((msg: string) => {
    try {
      if (dataChannelInstance?.readyState === "open") {
        dataChannelInstance.send(msg);
        setMessages((m) => [...m, `you: ${msg}`]);
      } else {
        console.warn(
          "Data channel not ready for sending. State:",
          dataChannelInstance?.readyState
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }, []);

  const setMessageHandler = useCallback((handler: (data: string) => void) => {
    customHandlerRef.current = handler;
  }, []);

  return {
    localOffer,
    localAnswer,
    connected,
    messages,
    createOffer,
    acceptOffer,
    acceptAnswer,
    sendMessage,
    setMessageHandler,
  };
}
