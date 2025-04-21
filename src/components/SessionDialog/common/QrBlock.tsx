import React from "react";
import QRCode from "react-qr-code";

export interface QrBlockProps {
  value: string;
  linkHref?: string;
  linkLabel?: string;
  description?: string;
}

export function QrBlock({
  value,
  linkHref,
  linkLabel = "Test link",
  description = "Scan with phone to open connection page",
}: QrBlockProps) {
  return (
    <div className="flex flex-col items-center p-4 bg-gray-50 rounded-md">
      <QRCode value={value} size={300} />
      <p className="mt-3 text-sm text-gray-600">{description}</p>
      {linkHref && (
        <a
          href={linkHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 text-xs text-blue-500 underline"
        >
          {linkLabel}
        </a>
      )}
    </div>
  );
}
