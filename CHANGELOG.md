# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-09-27

### 🔥 MAJOR ARCHITECTURAL TRANSFORMATION

#### Added
- **Module Federation Architecture**: Complete migration from Vite-based plugin system to Webpack 5 Module Federation microfrontend architecture
- **Host Application** (`apps/desktop-host/`): Core desktop shell with window management, API bridge, and remote orchestration
- **Remote Applications**: First federated remote (`apps/notepad-remote/`) demonstrating microfrontend capabilities
- **Dynamic Remote Loading**: Module Federation-based remote registry with lazy loading
- **Shared Singleton Management**: React, ReactDOM configured as federated singletons
- **Enhanced Security**: Better isolation through Module Federation containers vs. dynamic imports
- **Independent Development**: Separate development servers for host and remote applications

#### Changed
- **BREAKING**: Development workflow now requires separate terminals for host and remote applications
- **BREAKING**: Build system migrated from Vite to Webpack 5 with Module Federation
- **BREAKING**: Plugin system architecture transformed to microfrontend remotes
- **Preserved**: Sophisticated 7-layer integration architecture maintained
- **Preserved**: Window management system (Zustand store) intact
- **Preserved**: API bridge system adapted for federation
- **Preserved**: Theme system (BeOS, Windows, macOS) fully maintained
- **Enhanced**: Bundle optimization through federated shared dependencies

#### Technical Details
- **Host Application**: Runs on `http://localhost:3000`
- **Notepad Remote**: Runs on `http://localhost:3001`
- **Module Federation**: Uses `@module-federation/enhanced` v0.18.4
- **Remote Entry Points**: Available at `/remoteEntry.js` for each remote
- **Shared Libraries**: Foundation established for `@shared/*` packages

#### Migration Impact
- **Performance**: Foundation for significant bundle size reduction (50MB → 15MB target)
- **Security**: Remote isolation through webpack containers
- **Scalability**: Independent deployment and versioning of desktop applications
- **Development**: Clear separation of concerns between host and remote applications

#### Development Commands (New)
```bash
# Host Application
cd apps/desktop-host && npm run dev

# Remote Applications
cd apps/notepad-remote && npm run start

# Access federated application at http://localhost:3000
```

#### Architecture Achieved
- ✅ **SOLID Principles**: Single responsibility, open/closed, dependency inversion
- ✅ **Suckless Principles**: Simplicity, do one thing well, minimalism
- ✅ **Module Federation**: Host/remote architecture with shared singletons
- ✅ **API Bridge Preservation**: Sophisticated integration maintained
- ✅ **Window Management**: Existing Zustand-based system intact

#### Next Phase Priorities
1. Complete shared libraries implementation (`@shared/ui-kit`, `@shared/api-client`)
2. Migrate additional applications (calculator, file explorer, browser)
3. Production optimization and CDN strategy
4. Enhanced security with parameter validation
5. Performance monitoring and bundle analysis

### Known Issues
- TypeScript configuration needs refinement for production builds
- Shared libraries currently use mock implementations
- MCP protocol integration pending completion
- Legacy development commands preserved for backward compatibility

---

## [1.x.x] - Previous Versions

### Legacy Architecture (Pre-Module Federation)
- Vite-based plugin system with dynamic imports
- Single monolithic bundle (~50MB)
- Plugin-oriented architecture with sophisticated 7-layer integration
- BeOS theme system with desktop tab bar
- Comprehensive window management with Zustand
- Production-grade MCP protocol implementation
- Complex worker communication patterns with Comlink
- Triple interface pattern (TypeScript SDK, Python bindings, MCP JSON-RPC 2.0)

For detailed history of the legacy architecture, see:
- `REFACTOR_MF.md` - Complete migration documentation
- `design-review.md` - Original architecture assessment
- `integration-architecture-review.md` - Integration layer analysis