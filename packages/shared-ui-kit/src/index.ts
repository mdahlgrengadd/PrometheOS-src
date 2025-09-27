// Simplified Shared UI Kit - Essential Components Only
// Focused on components that work without complex dependencies

// Import global styles
import './globals.css';

// Base utilities
export { cn } from './lib/utils';

// Essential components that the notepad needs
export { Button } from './button';
export { Input } from './input';
export { Label } from './label';

//export { Textarea } from './textarea';
// API-enabled components (federated)
export { Textarea } from './api/textarea';

// Federated API HOC and utilities
export { withApi, useApiComponent } from './lib/withApi';
export type { ApiComponentProps } from './lib/withApi';