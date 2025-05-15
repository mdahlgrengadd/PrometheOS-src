# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/570b9bc3-df94-4bcc-8fb1-ce3f4ccc81a5

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/570b9bc3-df94-4bcc-8fb1-ce3f4ccc81a5) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Zustand (for global state management)

## Project Roadmap Implementation

### Phase 1: Window Management with Zustand (✅ Completed)

We've implemented a centralized window management system using Zustand:

- Global store for all window state with persistence
- Dictionary-based window storage for O(1) lookups
- Clean, testable action API for window operations
- Persists window positions and sizes across page reloads
- Properly handles z-index management with rehydration

Key features:
- `useWindowStore` provides actions like `focus`, `move`, `resize`, `minimize`, etc.
- Optimized selectors for better performance and fewer re-renders
- Shared TypeScript types between components in `src/types/window.ts`
- Unit tests for store operations in `tests/unit/windowStore.test.ts`

**Example: Using the Window Store**

Creating a new window:
```tsx
import { useWindowStore } from '@/store/windowStore';

// In your component:
const registerWindow = useWindowStore(state => state.registerWindow);

// Register a new window
registerWindow({
  id: 'my-plugin-id',
  title: 'My Plugin',
  content: <MyPluginContent />,
  isOpen: true,
  isMinimized: false,
  zIndex: 1,
  position: { x: 100, y: 100 },
  size: { width: 500, height: 400 }
});

// Access window state
const myWindow = useWindowStore(state => state.windows['my-plugin-id']);

// Use window actions
const { focus, move, resize, minimize, maximize, close } = useWindowStore(
  state => ({
    focus: state.focus,
    move: state.move,
    resize: state.resize,
    minimize: state.minimize,
    maximize: state.maximize,
    close: state.close
  })
);

// Focus a window
focus('my-plugin-id');

// Move a window
move('my-plugin-id', { x: 200, y: 150 });

// Get only open windows
const openWindows = useWindowStore(state => 
  Object.values(state.windows).filter(w => w.isOpen)
);
```

Run tests with:
```
npm run test
```

### Future Phases

- Phase 2: Extract WindowShell, implement gesture library, CSS prop theme tokens
- Phase 3: Workerize PluginManager with Comlink
- Phase 4: Implement theme manifests
- Phase 5: Add responsive layout support
- Phase 6: Build secure remote-plugin loader

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/570b9bc3-df94-4bcc-8fb1-ce3f4ccc81a5) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)
