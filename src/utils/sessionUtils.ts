import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";

const pinCodeConnectionMap = new Map<string, string>();

// Generate a shorter version of the connection data by LZ‑compressing it
export function generateShortCode(jsonData: string): string {
  try {
    return compressToEncodedURIComponent(jsonData);
  } catch (e) {
    console.error("Failed to generate short code:", e);
    return "";
  }
}

// Decompress the short code back into JSON
export function decodeShortCode(shortCode: string): string {
  try {
    return decompressFromEncodedURIComponent(shortCode) || "";
  } catch (e) {
    console.error("Failed to decode short code:", e);
    return "";
  }
}

// Generate a 6‑digit numeric PIN code from the shortCode (not cryptographically secure)
export function generatePinCode(shortCode: string): string {
  try {
    let numericValue = 0;
    for (let i = 0; i < shortCode.length; i++) {
      numericValue += shortCode.charCodeAt(i);
    }
    const pin = (numericValue % 1_000_000).toString().padStart(6, "0");
    pinCodeConnectionMap.set(pin, shortCode);
    return pin;
  } catch (e) {
    console.error("Failed to generate pin code:", e);
    return "000000";
  }
}

// Generate a URL for QR‑scanning the handshake data
export function generateHandshakeUrl(
  shortCode: string,
  action: "join" | "answer"
): string {
  try {
    const baseUrl = "http://192.168.0.192:8080";
    const fullUrl = `${baseUrl}/?open=session&handshake=${encodeURIComponent(
      shortCode
    )}&action=${action}`;
    console.log("Generated QR URL:", fullUrl);
    return fullUrl;
  } catch (e) {
    console.error("Error generating handshake URL:", e);
    return "http://192.168.0.192:8080/?open=session&error=true";
  }
}

// For lookup when someone enters a PIN
export function lookupShortCodeByPin(pin: string): string | undefined {
  return pinCodeConnectionMap.get(pin);
}
