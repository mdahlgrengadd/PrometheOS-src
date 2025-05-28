# API Single Source of Truth Workflow

This document explains how the API system now works with a single source of truth approach.

## Overview

The entire API system is now driven by the definitions in `src/api/system/registerSystemApi.ts`. All OpenAPI specifications, TypeScript clients, and Python clients are automatically generated from this single file.

## How It Works

### 1. Single Source: `registerSystemApi.ts`

All API definitions are stored in the `servicesApiComponent` object in `src/api/system/registerSystemApi.ts`. This includes:
- API endpoints under `/api/services/*`
- Action definitions with parameters
- Handler implementations

### 2. Extraction Script

`scripts/extract-api-components.js` uses safe AST parsing to extract the `servicesApiComponent` definition from the TypeScript source code and converts it to JSON.

### 3. OpenAPI Generation

`scripts/generate-openapi.js` uses the extracted components to generate `openapi.json` automatically.

### 4. Client Generation

Both TypeScript and Python clients are generated from the OpenAPI specification:
- TypeScript: `src/prometheos-client-generated/`
- Python: `src/prometheos-client-python-generated/`

## Making API Changes

To add, modify, or remove API endpoints:

1. **Edit the source**: Modify `src/api/system/registerSystemApi.ts`
   - Add/modify actions in `servicesApiComponent.actions`
   - Add/modify handlers with `registerApiActionHandler()`

2. **Regenerate everything**: Run the build commands
   ```bash
   npm run build:openapi          # Generate OpenAPI spec
   npm run build:clients:ts       # Generate TypeScript client
   npm run build:clients:python   # Generate Python client
   npm run build:clients          # Generate both clients
   ```

3. **Update Python wrapper**: If needed, run the Python package build
   ```bash
   npm run build:python           # Rebuild Python package and wheel
   ```

## Available Scripts

- `npm run build:openapi` - Generate OpenAPI spec from registerSystemApi.ts
- `npm run build:clients` - Generate both TypeScript and Python clients
- `npm run build:clients:ts` - Generate only TypeScript client
- `npm run build:clients:python` - Generate only Python client
- `npm run build:python` - Rebuild Python package with wrapper classes

## Key Benefits

1. **Single Source of Truth**: All API changes happen in one place
2. **Automatic Propagation**: Changes automatically flow to all clients
3. **Type Safety**: TypeScript definitions ensure consistency
4. **No Manual Updates**: No need to manually update multiple files
5. **Version Consistency**: All clients stay in sync automatically

## Example Workflow

1. Add a new action to `servicesApiComponent.actions` in `registerSystemApi.ts`
2. Add the corresponding handler with `registerApiActionHandler()`
3. Run `npm run build:clients` to regenerate all clients
4. The new action is now available in TypeScript and Python clients

## File Structure

```
src/api/system/registerSystemApi.ts    # Source of truth
scripts/extract-api-components.js      # Extraction script
scripts/generate-openapi.js            # OpenAPI generator
openapi.json                           # Generated spec
src/prometheos-client-generated/       # Generated TypeScript client
src/prometheos-client-python-generated/ # Generated Python client
src/prometheos-client-python/          # Python wrapper classes
```

This system ensures that `registerSystemApi.ts` is truly the single source of truth for all API definitions.
