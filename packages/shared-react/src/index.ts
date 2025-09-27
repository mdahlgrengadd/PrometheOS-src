// Federated React runtime - singleton across all apps
export { default as React } from 'react';
export * from 'react';
export { default as ReactDOM } from 'react-dom/client';
export * from 'react-dom/client';

// Re-export common React types for TypeScript
export type {
  ComponentType,
  FC,
  ReactNode,
  ReactElement,
  PropsWithChildren,
  CSSProperties,
  HTMLProps,
  RefObject,
  MutableRefObject,
} from 'react';