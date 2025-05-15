import React from "react";

export type AlertType = "error" | "warning" | "info";

export interface AlertProps {
  type: AlertType;
  children: React.ReactNode;
}

export function Alert({ type, children }: AlertProps) {
  const styles = {
    error: "bg-red-100 border-red-300 text-red-700",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-700",
    info: "bg-blue-50 border-blue-200 text-blue-700",
  };

  return (
    <div className={`p-3 border rounded-md ${styles[type]}`}>
      {type === "error" && <strong>Error: </strong>}
      {type === "warning" && <strong>Important: </strong>}
      {type === "info" && <strong>Note: </strong>}
      {children}
    </div>
  );
}
