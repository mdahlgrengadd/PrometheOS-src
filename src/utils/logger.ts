/**
 * Production-safe logging utility
 * Automatically disables logging in production builds
 */

const isDevelopment = import.meta.env.DEV;

export const logger = {
  log: (...args: unknown[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  error: (...args: unknown[]) => {
    if (isDevelopment) {
      console.error(...args);
    }
  },
  info: (...args: unknown[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
  debug: (...args: unknown[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  }, // Always log errors in production for debugging - uses DOM injection to always work
  forceError: (...args: unknown[]) => {
    // Fallback to DOM injection if console is stripped
    try {
      const logFn = window.console && window.console.error;
      if (logFn) {
        logFn.apply(window.console, args);
      } else {
        // Create a hidden element to show the message in DevTools
        const el = document.createElement("div");
        el.style.display = "none";
        el.setAttribute("data-force-error", args.join(" "));
        document.body.appendChild(el);
      }
    } catch {
      // Last resort: set a global variable
      (window as any).forceErrorLogs = (window as any).forceErrorLogs || [];
      (window as any).forceErrorLogs.push(args.join(" "));
    }
  },
  // Always log important info in production - uses DOM injection to always work
  forceInfo: (...args: unknown[]) => {
    // Multiple approaches to ensure the message gets through
    try {
      // Try console first
      const logFn = window.console && window.console.info;
      if (logFn) {
        logFn.apply(window.console, args);
      }
      // Also add to DOM as backup
      const el = document.createElement("div");
      el.style.display = "none";
      el.setAttribute("data-force-info", args.join(" "));
      document.body.appendChild(el);
      // And set a global variable as final backup
      (window as any).forceInfoLogs = (window as any).forceInfoLogs || [];
      (window as any).forceInfoLogs.push(args.join(" "));
    } catch {
      // Absolutely final fallback
      console.log(...args);
    }
  },
  // Always log general messages in production - uses DOM injection to always work
  forceLog: (...args: unknown[]) => {
    try {
      const logFn = window.console && window.console.log;
      if (logFn) {
        logFn.apply(window.console, args);
      } else {
        const el = document.createElement("div");
        el.style.display = "none";
        el.setAttribute("data-force-log", args.join(" "));
        document.body.appendChild(el);
      }
    } catch {
      (window as any).forceLogs = (window as any).forceLogs || [];
      (window as any).forceLogs.push(args.join(" "));
    }
  },
  // Always log warnings in production - uses DOM injection to always work
  forceWarn: (...args: unknown[]) => {
    try {
      const logFn = window.console && window.console.warn;
      if (logFn) {
        logFn.apply(window.console, args);
      } else {
        const el = document.createElement("div");
        el.style.display = "none";
        el.setAttribute("data-force-warn", args.join(" "));
        document.body.appendChild(el);
      }
    } catch {
      (window as any).forceWarnLogs = (window as any).forceWarnLogs || [];
      (window as any).forceWarnLogs.push(args.join(" "));
    }
  },
};

export default logger;
