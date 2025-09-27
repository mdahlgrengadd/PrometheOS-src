# API Refactor Plan: Dual-Pattern Support for Module Federation

## 🎯 Objective

Refactor the current API integration to support **both** the Bridge Pattern and React Context Pattern, allowing remotes to choose the most appropriate approach for their use case.

## 📊 Current State Analysis

### ✅ What Works Well
- **Bridge Pattern**: `window.__HOST_API_BRIDGE__` provides cross-remote communication
- **API Registration**: Components register successfully across federated boundaries
- **Handler System**: Event bus enables action handler registration
- **Testing Interface**: Global `__PROMETHEOS_API__` for browser console testing
- **Sophisticated Integration**: 7-layer architecture preserved

### ⚠️ Current Issues
- **Misleading Terminology**: "fallback" implies degraded mode when it's actually primary
- **Single Pattern**: Only bridge pattern supported, missing React Context option
- **Over-engineered**: Complex global bridge when React Context would be simpler
- **Type Safety**: Less TypeScript support compared to React Context
- **Developer Experience**: Not idiomatic React patterns

## 🏗️ Proposed Architecture: Dual-Pattern Support

### Pattern 1: Bridge Pattern (Current)
```javascript
// Remote uses global bridge directly
const apiClient = useApiClient(); // Uses window.__HOST_API_BRIDGE__
```

**Advantages:**
- ✅ Framework agnostic (works with non-React remotes)
- ✅ Explicit control and debugging
- ✅ Independence from host Context lifecycle
- ✅ Legacy compatibility

### Pattern 2: React Context Pattern (New)
```javascript
// Host wraps remote with Context
<ApiClientProvider>
  <RemoteComponent />
</ApiClientProvider>

// Remote uses normal React Context
const apiClient = useApiClient(); // Uses React Context
```

**Advantages:**
- ✅ Idiomatic React patterns
- ✅ Better TypeScript integration
- ✅ React DevTools support
- ✅ Cleaner, more maintainable code

## 📋 Implementation Plan

### Phase 1: Improve Bridge Pattern (Week 1)

#### 1.1 Fix Terminology and Logging
```javascript
// packages/shared-api-client/src/hooks.tsx
export function useApiClient(): IApiClient {
  const context = useContext(ApiClientContext);

  // First: Try React Context Provider
  if (context) {
    console.log('[API Client] Using React Context Provider');
    return context;
  }

  // Second: Try Module Federation Host Bridge
  if (typeof window !== 'undefined' && window.__HOST_API_BRIDGE__) {
    console.log('[API Client] Using Module Federation Host Bridge');
    return getApiClient();
  }

  throw new Error('useApiClient requires ApiClientProvider or Module Federation Host Bridge');
}
```

#### 1.2 Enhance Bridge Documentation
- Add clear JSDoc comments explaining when to use bridge pattern
- Update console messages to be more descriptive
- Create usage examples for both patterns

#### 1.3 Improve Type Safety for Bridge Pattern
```typescript
// Add global type declarations
declare global {
  interface Window {
    __HOST_API_BRIDGE__: IHostApiBridge;
    __REMOTE_ID__: string;
    eventBus: IEventBus;
    __PROMETHEOS_API__: ITestingAPI;
  }
}
```

### Phase 2: Add React Context Support (Week 2)

#### 2.1 Export ApiProvider from Host
```javascript
// apps/desktop-host/webpack.config.js
exposes: {
  './ApiProvider': './src/api/ApiProvider.tsx',
  './ApiClientProvider': './src/api/ApiClientProvider.tsx', // New clean provider
  './HostApiBridge': './src/api/HostApiBridge.tsx',
}
```

#### 2.2 Create Clean ApiClientProvider
```javascript
// apps/desktop-host/src/api/ApiClientProvider.tsx
export const ApiClientProvider: React.FC<{
  children: React.ReactNode;
  remoteId?: string;
}> = ({ children, remoteId }) => {
  const { executeAction, registerComponent, /* ... */ } = useApi();

  const apiClient = useMemo(() => new DirectApiClient({
    executeAction,
    registerComponent,
    remoteId,
  }), [executeAction, registerComponent, remoteId]);

  return (
    <ApiClientContext.Provider value={apiClient}>
      {children}
    </ApiClientContext.Provider>
  );
};
```

#### 2.3 Update RemoteWindowRenderer with Context Option
```javascript
// apps/desktop-host/src/shell/RemoteWindowRenderer.tsx
interface RemoteWindowRendererProps {
  window: WindowState;
  useReactContext?: boolean; // New option
}

export const RemoteWindowRenderer: React.FC<RemoteWindowRendererProps> = ({
  window,
  useReactContext = false
}) => {
  const remoteComponent = (
    <Suspense fallback={<LoadingFallback />}>
      <RemoteComponent />
    </Suspense>
  );

  return (
    <div className="remote-window" style={windowStyle}>
      <div className="window-container">
        <RemoteErrorBoundary remoteName={window.id}>
          {useReactContext ? (
            <ApiClientProvider remoteId={window.id}>
              {remoteComponent}
            </ApiClientProvider>
          ) : (
            remoteComponent
          )}
        </RemoteErrorBoundary>
      </div>
    </div>
  );
};
```

### Phase 3: Dual-Mode Support (Week 3)

#### 3.1 Smart Pattern Detection
```javascript
// packages/shared-api-client/src/hooks.tsx
export function useApiClient(): IApiClient {
  const context = useContext(ApiClientContext);

  // Priority 1: React Context (preferred for React remotes)
  if (context) {
    console.log('[API Client] ✅ Using React Context Pattern');
    return context;
  }

  // Priority 2: Module Federation Bridge (for non-React or legacy remotes)
  if (typeof window !== 'undefined' && window.__HOST_API_BRIDGE__) {
    console.log('[API Client] ✅ Using Module Federation Bridge Pattern');
    return getApiClient();
  }

  // Priority 3: Error with helpful guidance
  throw new Error(`
    API Client not available. Choose one option:

    Option 1 (React Context): Wrap your remote with <ApiClientProvider>
    Option 2 (Bridge): Ensure window.__HOST_API_BRIDGE__ is available

    See API_Refactor.md for migration guide.
  `);
}
```

#### 3.2 Remote Configuration System
```javascript
// apps/desktop-host/src/config/remoteConfig.ts
export interface RemoteConfig {
  id: string;
  url: string;
  apiPattern: 'context' | 'bridge' | 'auto';
  exposes: string[];
}

export const REMOTE_CONFIGS: RemoteConfig[] = [
  {
    id: 'notepad',
    url: 'http://localhost:3001/remoteEntry.js',
    apiPattern: 'auto', // Let remote choose
    exposes: ['./App'],
  },
  {
    id: 'calculator',
    url: 'http://localhost:3002/remoteEntry.js',
    apiPattern: 'context', // Force React Context
    exposes: ['./App'],
  },
];
```

#### 3.3 Auto-Detection Logic
```javascript
// apps/desktop-host/src/shell/RemoteManager.tsx
const determineApiPattern = (remoteConfig: RemoteConfig, component: React.ComponentType) => {
  if (remoteConfig.apiPattern !== 'auto') {
    return remoteConfig.apiPattern;
  }

  // Auto-detect based on component properties or metadata
  const hasContextSupport = component.displayName?.includes('WithContext') ||
                           component.contextTypes !== undefined;

  return hasContextSupport ? 'context' : 'bridge';
};
```

### Phase 4: Migration and Examples (Week 4)

#### 4.1 Create Migration Guide
```markdown
## Migration Guide: Bridge → React Context

### Before (Bridge Pattern)
```javascript
// Remote code
const Notepad = () => {
  // Component uses bridge automatically
  return <Textarea apiId="my-textarea" />;
};
```

### After (React Context Pattern)
```javascript
// Remote code - no changes needed!
const Notepad = () => {
  // Component works with both patterns
  return <Textarea apiId="my-textarea" />;
};

// Host configuration
<RemoteWindowRenderer
  window={window}
  useReactContext={true}
/>
```

#### 4.2 Create Pattern Comparison Examples

**Example 1: Simple React Remote (Context Preferred)**
```javascript
// apps/calculator-remote/src/App.tsx
export const Calculator = () => {
  const apiClient = useApiClient(); // Uses React Context when available

  return (
    <div>
      <Button apiId="calc-equals" onClick={calculate}>
        =
      </Button>
    </div>
  );
};
```

**Example 2: Vanilla JS Remote (Bridge Required)**
```javascript
// apps/legacy-remote/src/app.js
// Uses bridge pattern since no React Context available
const apiClient = window.__HOST_API_BRIDGE__;
apiClient.executeAction('legacy-button', 'click');
```

**Example 3: Hybrid Remote (Auto-Detection)**
```javascript
// apps/hybrid-remote/src/App.tsx
export const HybridApp = () => {
  // Works with either pattern automatically
  const apiClient = useApiClient();

  return <MyComponent />;
};
```

## 🔄 Implementation Phases

### Phase 1: Foundation (Days 1-3)
- [ ] Fix terminology and logging
- [ ] Improve TypeScript declarations
- [ ] Add better error messages
- [ ] Update documentation

### Phase 2: Context Support (Days 4-6)
- [ ] Create ApiClientProvider export
- [ ] Update RemoteWindowRenderer
- [ ] Test React Context pattern
- [ ] Verify type safety

### Phase 3: Dual-Mode (Days 7-9)
- [ ] Implement smart detection
- [ ] Add remote configuration system
- [ ] Create auto-detection logic
- [ ] Test both patterns together

### Phase 4: Polish (Days 10-12)
- [ ] Create migration examples
- [ ] Write comprehensive documentation
- [ ] Add performance optimizations
- [ ] Create testing utilities

## 🧪 Testing Strategy

### Unit Tests
```javascript
describe('useApiClient Hook', () => {
  it('should prefer React Context over bridge', () => {
    const TestComponent = () => {
      const client = useApiClient();
      return <div>{client.constructor.name}</div>;
    };

    const { getByText } = render(
      <ApiClientProvider>
        <TestComponent />
      </ApiClientProvider>
    );

    expect(getByText('DirectApiClient')).toBeInTheDocument();
  });

  it('should fallback to bridge when no context', () => {
    window.__HOST_API_BRIDGE__ = mockBridge;
    const TestComponent = () => {
      const client = useApiClient();
      return <div>{client.constructor.name}</div>;
    };

    const { getByText } = render(<TestComponent />);
    expect(getByText('FederatedApiClient')).toBeInTheDocument();
  });
});
```

### Integration Tests
```javascript
describe('Module Federation API Integration', () => {
  it('should work with React Context pattern', async () => {
    const result = await __PROMETHEOS_API__.textarea.setValue(
      'test-textarea',
      'Context pattern test'
    );
    expect(result.success).toBe(true);
  });

  it('should work with Bridge pattern', async () => {
    // Test without React Context
    const result = await window.__HOST_API_BRIDGE__.executeAction(
      'test-textarea',
      'setValue',
      { value: 'Bridge pattern test' }
    );
    expect(result.success).toBe(true);
  });
});
```

## 📈 Benefits of Dual-Pattern Support

### For Developers
- ✅ **Choice**: Pick the pattern that fits your use case
- ✅ **Migration Path**: Gradual migration from bridge to context
- ✅ **Compatibility**: Support legacy and modern remotes
- ✅ **Type Safety**: Better TypeScript support with React Context

### For Architecture
- ✅ **Flexibility**: Support different remote technologies
- ✅ **Scalability**: Better separation of concerns
- ✅ **Maintainability**: Cleaner code paths
- ✅ **Future-Proof**: Easy to add new patterns

### For Performance
- ✅ **React Context**: Leverages React's optimization
- ✅ **Bridge**: Minimal overhead for simple cases
- ✅ **Auto-Detection**: Use optimal pattern automatically
- ✅ **Tree Shaking**: Better bundle optimization

## 🎯 Success Metrics

### Technical Metrics
- [ ] 100% backward compatibility maintained
- [ ] 0 breaking changes for existing remotes
- [ ] < 5KB bundle size increase
- [ ] > 95% test coverage for both patterns

### Developer Experience Metrics
- [ ] Clear documentation for both patterns
- [ ] TypeScript support for both patterns
- [ ] Error messages guide developers to correct usage
- [ ] Migration examples for common scenarios

### Performance Metrics
- [ ] React Context pattern shows up in React DevTools
- [ ] Bridge pattern maintains current performance
- [ ] Auto-detection adds < 1ms overhead
- [ ] Memory usage remains constant

## 🚀 Implementation Roadmap

```mermaid
gantt
    title API Refactor Implementation Timeline
    dateFormat  YYYY-MM-DD
    section Phase 1: Foundation
    Fix Terminology           :p1-1, 2024-01-01, 2d
    TypeScript Improvements   :p1-2, after p1-1, 2d
    Documentation Update      :p1-3, after p1-2, 1d

    section Phase 2: Context Support
    Export ApiProvider        :p2-1, after p1-3, 2d
    Update RemoteRenderer     :p2-2, after p2-1, 2d
    Testing                   :p2-3, after p2-2, 1d

    section Phase 3: Dual-Mode
    Smart Detection           :p3-1, after p2-3, 2d
    Configuration System      :p3-2, after p3-1, 2d
    Integration Testing       :p3-3, after p3-2, 1d

    section Phase 4: Polish
    Migration Guide           :p4-1, after p3-3, 2d
    Examples                  :p4-2, after p4-1, 2d
    Performance Optimization  :p4-3, after p4-2, 1d
```

## 🎉 Conclusion

This refactor will transform our Module Federation API integration from a single-pattern system into a flexible, dual-pattern architecture that supports both the current bridge approach and the cleaner React Context approach. Developers can choose the best pattern for their use case, and we maintain full backward compatibility while providing a clear migration path forward.

The implementation preserves the sophisticated 7-layer integration architecture while making it more accessible and maintainable for future development.