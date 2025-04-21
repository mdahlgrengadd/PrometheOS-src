import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";
import { useCallback, useEffect, useState } from "react";
import QRCode from "react-qr-code";

import { toast } from "../hooks/use-toast";
import { useWebRTCSession } from "../hooks/useWebRTCSession";
import { useWebRTCStatus } from "../hooks/useWebRTCStatus";
import { eventBus } from "../plugins/EventBus";

export interface SessionDialogProps {
  onClose: () => void;
}

// Generate a shorter version of the connection data by LZ‑compressing it
function generateShortCode(jsonData: string): string {
  try {
    return compressToEncodedURIComponent(jsonData);
  } catch (e) {
    console.error("Failed to generate short code:", e);
    return "";
  }
}

// Map to store connection data by PIN code for lookup
const pinCodeConnectionMap = new Map<string, string>();

// Generate a 6-digit numeric pin code from the shortCode
// This isn't cryptographically secure but provides a simple way to share connection info
function generatePinCode(shortCode: string): string {
  try {
    // Use a simple hash of the shortCode to generate a 6-digit number
    let numericValue = 0;
    for (let i = 0; i < shortCode.length; i++) {
      numericValue += shortCode.charCodeAt(i);
    }
    // Ensure it's exactly 6 digits by using modulo and padding
    const pinCode = (numericValue % 1000000).toString().padStart(6, "0");

    // Store the connection data with the PIN for later lookup
    pinCodeConnectionMap.set(pinCode, shortCode);

    return pinCode;
  } catch (e) {
    console.error("Failed to generate pin code:", e);
    return "000000"; // Fallback
  }
}

// Decompress the short code back into JSON
function decodeShortCode(shortCode: string): string {
  try {
    return decompressFromEncodedURIComponent(shortCode) || "";
  } catch (e) {
    console.error("Failed to decode short code:", e);
    return "";
  }
}

// Generate a URL with the handshake data as a query parameter
function generateHandshakeUrl(
  shortCode: string,
  action: "join" | "answer"
): string {
  try {
    // Use the device's actual IP address
    // This needs to be the IP address accessible from other devices on the network
    const baseUrl = "http://192.168.0.192:8080";

    // Create the full URL with all parameters
    const fullUrl = `${baseUrl}/?open=session&handshake=${encodeURIComponent(
      shortCode
    )}&action=${action}`;

    // Debug log the URL - remove in production
    console.log("Generated QR URL:", fullUrl);
    console.log("URL Length:", fullUrl.length);

    return fullUrl;
  } catch (e) {
    console.error("Error generating handshake URL:", e);
    return "http://192.168.0.192:8080/?open=session&error=true";
  }
}

export function SessionDialog({ onClose }: SessionDialogProps) {
  const {
    localOffer,
    localAnswer,
    connected,
    messages,
    createOffer,
    acceptOffer,
    acceptAnswer,
    sendMessage,
    setMessageHandler,
  } = useWebRTCSession();

  const { setConnected: setGlobalConnected } = useWebRTCStatus();

  const [step, setStep] = useState<
    "choose" | "host" | "join" | "join:answer" | "done"
  >("choose");
  const [scannedText, setScannedText] = useState("");
  const [testMessage, setTestMessage] = useState("");
  const [isCreatingOffer, setIsCreatingOffer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayMode, setDisplayMode] = useState<"qr" | "text" | "pin">("text"); // Added pin option
  const [shortCode, setShortCode] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [hostMode, setHostMode] = useState<
    "scanning" | "creating" | "connecting"
  >("creating");

  // Test toast when component mounts
  useEffect(() => {
    // Wait a moment to ensure DOM is ready
    const timer = setTimeout(() => {
      try {
        console.log("Testing toast notification...");
        toast({
          title: "Session Dialog Ready",
          description: "Toast notification system is working.",
        });
        console.log("Test toast notification triggered");
      } catch (error) {
        console.error("Error showing test toast:", error);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Generate short code and pin code when offer or answer is available
  useEffect(() => {
    if (localOffer) {
      const code = generateShortCode(localOffer);
      setShortCode(code);
      setPinCode(generatePinCode(code));
    } else if (localAnswer) {
      const code = generateShortCode(localAnswer);
      setShortCode(code);
      setPinCode(generatePinCode(code));
    }
  }, [localOffer, localAnswer]);

  // Process incoming short code if pasted
  useEffect(() => {
    if (scannedText.startsWith("$")) {
      // Likely a compressed LZ-string format
      try {
        const decoded = decodeShortCode(scannedText);
        // Verify it's valid JSON before replacing
        JSON.parse(decoded);
        setScannedText(decoded);
      } catch (e) {
        // Not valid compressed string or JSON, keep as is
        console.log("Not a valid short code, treating as raw JSON");
      }
    }
  }, [scannedText]);

  // Start offer creation when the host step is selected
  useEffect(() => {
    if (step === "host" && !localOffer && !isCreatingOffer) {
      setIsCreatingOffer(true);
      setError(null);

      console.log("Starting offer creation...");
      createOffer()
        .catch((err) => {
          console.error("Failed to create offer:", err);
          setError("Failed to create connection offer. Please try again.");
        })
        .finally(() => {
          setIsCreatingOffer(false);
        });
    }
  }, [step, localOffer, isCreatingOffer, createOffer]);

  // When connected, set up event bus listeners and syncing
  useEffect(() => {
    if (!connected) return;

    console.log(
      "WebRTC connection established in SessionDialog - setting up toast and syncing"
    );

    // IMPORTANT: We don't clear the URL parameters until we're fully connected
    // This ensures the handshake parameters remain available throughout the entire
    // WebRTC connection process (both offer and answer exchange)

    // NOTE: For a successful WebRTC connection:
    // 1. Host creates offer with createOffer()
    // 2. Joiner accepts offer with acceptOffer() and creates answer
    // 3. Host must accept answer with acceptAnswer() to complete the handshake
    // If using QR codes or URLs, ensure the host scans/opens the joiner's answer

    // notify user that peer connection is up
    try {
      toast({
        title: "Connected",
        description: "Session connected successfully.",
        duration: 5000, // Show for 5 seconds
      });
      console.log("Toast notification triggered for connection");
    } catch (error) {
      console.error("Error showing toast notification:", error);
    }

    // Update global connection status
    try {
      setGlobalConnected(true);
      console.log("Global connection status updated to:", true);
    } catch (error) {
      console.error("Error updating global connection status:", error);
    }

    console.log("WebRTC connection established, setting up syncing");

    // Set up message handler to handle incoming messages
    setMessageHandler((data) => {
      try {
        const parsedData = JSON.parse(data);
        console.log("Received WebRTC message:", parsedData);

        // Handle different message types
        if (parsedData.type === "SYNC_STATE") {
          // Apply full state sync
          if (parsedData.windows && Array.isArray(parsedData.windows)) {
            eventBus.emit("sync:windows", parsedData.windows);
          }

          if (parsedData.theme) {
            // Only apply theme if it's a simple string value, not a nested object
            const themeValue =
              typeof parsedData.theme === "string" ? parsedData.theme : "light";
            eventBus.emit("theme:changed", themeValue);
          }
        } else if (parsedData.type === "theme:changed") {
          // For theme events, extract the actual theme value to prevent nesting
          const themeValue =
            typeof parsedData.theme === "string"
              ? parsedData.theme
              : parsedData.theme && typeof parsedData.theme.theme === "string"
              ? parsedData.theme.theme
              : "light";

          // Set theme directly in localStorage to prevent feedback loop
          localStorage.setItem("theme", themeValue);

          // Only emit locally, not back over WebRTC
          document.documentElement.classList.remove(
            "theme-light",
            "theme-dark",
            "theme-beos"
          );
          document.documentElement.classList.add(`theme-${themeValue}`);
        } else {
          // Forward other events to the eventBus
          eventBus.emit(parsedData.type, parsedData.id || parsedData);
        }
      } catch (error) {
        console.error("Error handling WebRTC message:", error);
      }
    });

    // Set up initial sync - send current state to peer
    const syncState = () => {
      // Get all window states and send to peer
      const syncData = {
        type: "SYNC_STATE",
        windows:
          (window as unknown as { __DESKTOP_STATE?: { windows: unknown[] } })
            .__DESKTOP_STATE?.windows || [],
        theme: localStorage.getItem("theme") || "light",
      };

      console.log("Sending initial sync data");
      sendMessage(JSON.stringify(syncData));
    };

    // Delay initial sync to ensure connection is stable
    const syncTimeout = setTimeout(() => {
      syncState();
    }, 1000);

    // Listen for window events and forward them
    const subscriptions = [
      // Window events
      eventBus.subscribe("window:opened", (id) => {
        sendMessage(JSON.stringify({ type: "window:opened", id }));
      }),

      eventBus.subscribe("window:closed", (id) => {
        sendMessage(JSON.stringify({ type: "window:closed", id }));
      }),

      eventBus.subscribe("window:minimized", (id) => {
        sendMessage(JSON.stringify({ type: "window:minimized", id }));
      }),

      eventBus.subscribe("window:maximized", (id) => {
        sendMessage(JSON.stringify({ type: "window:maximized", id }));
      }),

      eventBus.subscribe("window:position:changed", (data) => {
        sendMessage(
          JSON.stringify({
            type: "window:position:changed",
            id: data.id,
            position: data.position,
          })
        );
      }),

      // Theme changes
      eventBus.subscribe("theme:changed", (theme) => {
        // Only sync theme changes that originated locally, not those received from peer
        // Check if this is a local change by looking at the event source
        if (typeof theme === "string") {
          console.log("Syncing theme change to peer:", theme);
          sendMessage(JSON.stringify({ type: "theme:changed", theme }));
        } else {
          console.log("Ignoring remote theme change to prevent loop");
        }
      }),
    ];

    // Clean up all subscriptions
    return () => {
      clearTimeout(syncTimeout);
      subscriptions.forEach((unsubscribe) => unsubscribe());
      // Reset global connection status on cleanup
      setGlobalConnected(false);
    };
  }, [connected, sendMessage, setMessageHandler, setGlobalConnected]);

  // Handle offer acceptance
  const handleAcceptOffer = useCallback(
    async (connectionData?: string) => {
      setError(null);
      try {
        let dataToProcess = connectionData || scannedText;

        // Check if input is a 6-digit PIN code
        if (/^\d{6}$/.test(dataToProcess.trim())) {
          console.log("PIN code detected, looking up connection data");
          const pin = dataToProcess.trim();

          // Look up the connection data using the PIN
          const storedData = pinCodeConnectionMap.get(pin);
          if (storedData) {
            console.log("Found connection data for PIN");
            dataToProcess = decodeShortCode(storedData);
          } else {
            throw new Error("Invalid PIN code. Please check and try again.");
          }
        } else if (dataToProcess.startsWith("$")) {
          // Likely a compressed string, decode it
          console.log("Compressed code detected, decoding");
          dataToProcess = decodeShortCode(dataToProcess);
        }

        console.log("Accepting offer with connection data");
        await acceptOffer(dataToProcess);
        console.log("Offer accepted, moving to answer step");
        setStep("join:answer");
      } catch (err) {
        console.error("Failed to accept offer:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to process the connection data. Please check and try again."
        );
      }
    },
    [scannedText, acceptOffer]
  );

  // Handle answer acceptance
  const handleAcceptAnswer = useCallback(
    async (connectionData?: string) => {
      setError(null);
      try {
        let dataToProcess = connectionData || scannedText;

        // Check if this is a compressed string (starts with N4Ig)
        if (dataToProcess.trim().startsWith("N4Ig")) {
          console.log("Compressed answer data detected, decoding first");
          try {
            // Decompress the data
            dataToProcess = decodeShortCode(dataToProcess);
            console.log("Successfully decoded compressed data");
          } catch (decodeErr) {
            console.error("Failed to decode compressed data:", decodeErr);
            throw new Error(
              "Failed to decode the connection code. The format may be invalid."
            );
          }
        }

        // Now proceed with the decompressed data
        await acceptAnswer(dataToProcess);
        setStep("done");
      } catch (err) {
        console.error("Failed to accept answer:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to establish connection. Please try again."
        );
      }
    },
    [scannedText, acceptAnswer]
  );

  // Check URL for handshake parameter on component mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const handshakeData = params.get("handshake");
    const action = params.get("action");

    if (handshakeData) {
      try {
        console.log("Found handshake data in URL, processing...");
        // Decode the handshake data
        const decodedData = decodeShortCode(handshakeData);
        setScannedText(decodedData);

        if (action === "join") {
          // If action is join, automatically process the offer
          console.log("Auto-processing join action from URL");
          setStep("join");
          handleAcceptOffer(decodedData);

          // Don't clean up URL here - we'll do it after connection establishes
        } else if (action === "answer") {
          // If action is answer, automatically process the answer
          console.log("Auto-processing answer action from URL");
          setStep("host");
          handleAcceptAnswer(decodedData);

          // Don't clean up URL here - we'll do it after connection establishes
        }

        // We'll clean up the URL after successful connection to prevent
        // losing the handshake data during the connection process
      } catch (error) {
        console.error("Failed to process handshake data from URL", error);
      }
    }
  }, [handleAcceptOffer, handleAcceptAnswer]);

  // Function to copy short code to clipboard
  const copyToClipboard = (text: string) => {
    // First try using the Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          toast({
            title: "Copied",
            description: "Connection code copied to clipboard!",
          });
        })
        .catch((err) => {
          console.error("Failed to copy with Clipboard API:", err);
          fallbackCopy(text);
        });
    } else {
      // Fallback method if Clipboard API is not available
      fallbackCopy(text);
    }
  };

  // Fallback copy method using a temporary textarea element
  const fallbackCopy = (text: string) => {
    try {
      // Create temporary element
      const textArea = document.createElement("textarea");
      textArea.value = text;

      // Make it invisible but part of the document
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);

      // Select and copy
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");

      // Clean up
      document.body.removeChild(textArea);

      if (successful) {
        toast({
          title: "Copied",
          description: "Connection code copied to clipboard!",
        });
      } else {
        toast({
          title: "Copy failed",
          description: "Please select and copy the text manually.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Fallback copy failed:", err);
      toast({
        title: "Copy failed",
        description: "Please select and copy the text manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4 rounded-lg bg-white border shadow-lg w-[500px] max-w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Session Connection</h2>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-gray-100"
          aria-label="Close"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 4L4 12M4 4L12 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
          {error}
        </div>
      )}

      {step === "choose" && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Choose whether you want to host a session or join an existing one.
          </p>
          <div className="flex gap-4">
            <button
              className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              onClick={() => setStep("host")}
            >
              Host a Session
            </button>
            <button
              className="flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
              onClick={() => setStep("join")}
            >
              Join a Session
            </button>
          </div>
        </div>
      )}

      {step === "host" && (
        <div className="space-y-4">
          {/* Display Method Toggle */}
          {localOffer && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setDisplayMode("qr")}
                className={`px-3 py-1 text-xs font-medium rounded ${
                  displayMode === "qr"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                QR Code
              </button>
              <button
                onClick={() => setDisplayMode("text")}
                className={`px-3 py-1 text-xs font-medium rounded ${
                  displayMode === "text"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                Text Code
              </button>
              <button
                onClick={() => setDisplayMode("pin")}
                className={`px-3 py-1 text-xs font-medium rounded ${
                  displayMode === "pin"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                PIN Code
              </button>
            </div>
          )}

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Step 1:{" "}
              {displayMode === "qr"
                ? "Have peer scan this QR code"
                : displayMode === "pin"
                ? "Share this PIN code with peer"
                : "Share this connection code with peer"}
            </p>

            {/* Testing Note */}
            <div className="p-2 mb-3 bg-yellow-50 border border-yellow-200 rounded-md text-xs text-yellow-700">
              <strong>Testing Note:</strong> For proper connection, use two
              separate browser tabs/windows or different devices. The complete
              handshake requires both offer and answer exchange.
            </div>

            {/* PIN Code Display */}
            {localOffer && displayMode === "pin" && (
              <div className="p-4 bg-gray-50 rounded-md">
                <div className="font-mono text-4xl text-center tracking-widest my-4 user-select-all">
                  {pinCode}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  This PIN is tied to your connection data. Have your peer enter
                  this PIN to connect.
                </p>
                <button
                  onClick={() => copyToClipboard(pinCode)}
                  className="mt-3 px-3 py-1 bg-blue-600 text-white rounded text-sm"
                >
                  Copy PIN
                </button>
              </div>
            )}

            {/* Loading indicator */}
            {!localOffer && (
              <div className="h-64 w-64 mx-auto flex flex-col items-center justify-center">
                <svg
                  className="animate-spin h-8 w-8 text-blue-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <p className="mt-3 text-sm text-gray-600">
                  Creating connection offer...
                </p>
              </div>
            )}

            {/* QR Code Display */}
            {localOffer && displayMode === "qr" && (
              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-md">
                <QRCode
                  value={generateHandshakeUrl(shortCode, "join")}
                  size={300}
                  level="M"
                />
                <p className="mt-3 text-sm text-gray-600">
                  Scan with phone to open connection page directly
                </p>
                {/* Add a direct link for debugging */}
                <div className="mt-2">
                  <a
                    href={generateHandshakeUrl(shortCode, "join")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 underline"
                  >
                    Test link directly
                  </a>
                </div>
              </div>
            )}

            {/* Text Code Display */}
            {localOffer && displayMode === "text" && (
              <div className="p-4 bg-gray-50 rounded-md">
                <div className="border border-gray-300 rounded p-3 bg-white">
                  <div className="font-mono text-xs overflow-x-auto max-h-40 overflow-y-auto break-all user-select-all">
                    {shortCode}
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(shortCode)}
                  className="mt-3 px-3 py-1 bg-blue-600 text-white rounded text-sm"
                >
                  Copy to Clipboard
                </button>
              </div>
            )}
          </div>

          {localOffer && (
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Step 2: Paste peer's response here:
              </p>
              <textarea
                rows={5}
                className="w-full border border-gray-300 rounded-md p-2 text-sm font-mono resize-none"
                value={scannedText}
                onChange={(e) => setScannedText(e.target.value)}
                placeholder="Paste the response code here..."
              />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              className="py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
              onClick={() => setStep("choose")}
            >
              Back
            </button>
            {localOffer && (
              <button
                className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:bg-blue-300"
                disabled={!scannedText}
                onClick={() => handleAcceptAnswer()}
              >
                Connect
              </button>
            )}
          </div>
        </div>
      )}

      {step === "join" && (
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Enter host's connection code or PIN:
            </p>
            <textarea
              rows={5}
              className="w-full border border-gray-300 rounded-md p-2 text-sm font-mono resize-none"
              value={scannedText}
              onChange={(e) => setScannedText(e.target.value)}
              placeholder="Paste the connection code or enter 6-digit PIN..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              className="py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
              onClick={() => setStep("choose")}
            >
              Back
            </button>
            <button
              className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:bg-blue-300"
              disabled={!scannedText}
              onClick={() => handleAcceptOffer()}
            >
              Create Answer
            </button>
          </div>
        </div>
      )}

      {step === "join:answer" && (
        <div className="space-y-4">
          {/* Display Method Toggle */}
          {localAnswer && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setDisplayMode("qr")}
                className={`px-3 py-1 text-xs font-medium rounded ${
                  displayMode === "qr"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                QR Code
              </button>
              <button
                onClick={() => setDisplayMode("text")}
                className={`px-3 py-1 text-xs font-medium rounded ${
                  displayMode === "text"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                Text Code
              </button>
            </div>
          )}

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Step 2:{" "}
              {displayMode === "qr"
                ? "Show this QR to host"
                : "Share this connection code with host"}
            </p>

            {/* Important Connection Reminder */}
            <div className="p-2 mb-3 bg-yellow-50 border border-yellow-200 rounded-md text-xs text-yellow-700">
              <strong>Important:</strong> The connection will NOT be established
              until the host scans this QR code or enters this answer code. Make
              sure the host completes this step.
            </div>

            {/* Loading indicator */}
            {!localAnswer && (
              <div className="h-64 w-64 mx-auto flex flex-col items-center justify-center">
                <svg
                  className="animate-spin h-8 w-8 text-blue-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <p className="mt-3 text-sm text-gray-600">Creating answer...</p>
              </div>
            )}

            {/* QR Code Display */}
            {localAnswer && displayMode === "qr" && (
              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-md">
                <QRCode
                  value={generateHandshakeUrl(shortCode, "answer")}
                  size={300}
                  level="M"
                />
                <p className="mt-3 text-sm text-gray-600">
                  Scan with phone to open connection page directly
                </p>
                {/* Add a direct link for debugging */}
                <div className="mt-2">
                  <a
                    href={generateHandshakeUrl(shortCode, "answer")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 underline"
                  >
                    Test link directly
                  </a>
                </div>
              </div>
            )}

            {/* Text Code Display */}
            {localAnswer && displayMode === "text" && (
              <div className="p-4 bg-gray-50 rounded-md">
                <div className="border border-gray-300 rounded p-3 bg-white">
                  <div className="font-mono text-xs overflow-x-auto max-h-40 overflow-y-auto break-all user-select-all">
                    {shortCode}
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(shortCode)}
                  className="mt-3 px-3 py-1 bg-blue-600 text-white rounded text-sm"
                >
                  Copy to Clipboard
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              onClick={() => setStep("done")}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="space-y-4">
          <div className="p-4 rounded-md bg-gray-50">
            <div className="flex items-center gap-2 mb-4">
              <div
                className={`h-3 w-3 rounded-full ${
                  connected ? "bg-green-500" : "bg-yellow-500"
                }`}
              ></div>
              <p className="font-medium">
                {connected ? "Connected to peer" : "Waiting for connection..."}
              </p>
            </div>

            {connected && (
              <p className="text-sm text-gray-600">
                Your desktop is now being synchronized with the connected peer.
                Any window actions will be mirrored between both devices.
              </p>
            )}
          </div>

          {/* Test message area */}
          {connected && (
            <div className="border-t pt-4">
              <div className="mb-2">
                <p className="text-sm font-medium mb-2">Test Message</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                    placeholder="Type a test message..."
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && testMessage) {
                        sendMessage(testMessage);
                        setTestMessage("");
                      }
                    }}
                  />
                  <button
                    className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                    onClick={() => {
                      if (testMessage) {
                        sendMessage(testMessage);
                        setTestMessage("");
                      }
                    }}
                  >
                    Send
                  </button>
                </div>
              </div>

              {messages.length > 0 && (
                <div className="mt-4 border rounded-md overflow-hidden">
                  <div className="bg-gray-50 px-3 py-2 text-xs font-medium border-b">
                    Message Log
                  </div>
                  <div className="p-3 max-h-40 overflow-y-auto text-sm">
                    {messages.map((msg, i) => (
                      <div key={i} className="mb-1 last:mb-0">
                        {msg}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end">
            <button
              className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-md"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
