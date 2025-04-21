import { useCallback } from "react";

import { toast } from "./use-toast";

export function useClipboard() {
  // Robust copy function: tries Clipboard API, falls back to execCommand
  const copyToClipboard = useCallback((text: string) => {
    // first try the asynchronous Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          toast({
            title: "Copied",
            description: "Text copied to clipboard!",
          });
        })
        .catch((err) => {
          console.warn("Clipboard API failed, falling back:", err);
          fallbackCopy(text);
        });
    } else {
      // fallback for older browsers / non‑secure contexts
      fallbackCopy(text);
    }
  }, []);

  // Fallback copy using a hidden textarea + execCommand
  const fallbackCopy = (text: string) => {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      // keep it out of layout flow
      textarea.style.position = "fixed";
      textarea.style.top = "-9999px";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textarea);

      if (successful) {
        toast({
          title: "Copied",
          description: "Text copied to clipboard!",
        });
      } else {
        toast({
          title: "Copy failed",
          description: "Please copy the text manually.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Fallback copy failed:", err);
      toast({
        title: "Copy failed",
        description: "Please copy the text manually.",
        variant: "destructive",
      });
    }
  };

  return { copyToClipboard };
}
