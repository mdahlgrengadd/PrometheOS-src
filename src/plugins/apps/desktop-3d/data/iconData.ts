import {
  Calculator,
  Calendar,
  Camera,
  Code,
  FileImage,
  FileText,
  Folder,
  Gamepad2,
  Globe,
  Image as ImageIcon,
  LucideIcon,
  Mail,
  Map,
  MessageSquare,
  Music,
  Settings,
  Share2,
  ShoppingBag,
  StickyNote,
  Terminal,
  Zap,
} from "lucide-react";

export type MeshType =
  | "dodecahedron"
  | "icosahedron"
  | "octahedron"
  | "tetrahedron"
  | "cube"
  | "teapot"
  | "suzanne"
  | "torusknot"
  | "torus"
  | "cone"
  | "cylinder";

export interface DesktopIconData {
  title: string;
  description: string;
  stat: string;
  gridCoord: [number, number];
  // Optional 3D mesh configuration
  use3DMesh?: boolean;
  meshType?: MeshType;
  enableMeshRotation?: boolean;
}

// Create icon data in the same format as periodicTableData for compatibility
export const desktopIcons: DesktopIconData[] = [
  { title: "Doc", description: "Text Editor", stat: "1.0", gridCoord: [1, 1] },
  { title: "Calc", description: "Calculator", stat: "2.0", gridCoord: [2, 1] },
  { title: "Img", description: "Image Viewer", stat: "3.5", gridCoord: [3, 1] },
  { title: "Term", description: "Terminal", stat: "4.0", gridCoord: [4, 1] },
  { title: "Set", description: "Settings", stat: "1.2", gridCoord: [5, 1] },
  { title: "Mus", description: "Music Player", stat: "2.1", gridCoord: [1, 2] },
  {
    title: "Fold",
    description: "File Explorer",
    stat: "1.5",
    gridCoord: [2, 2],
  },
  {
    title: "Mail",
    description: "Email Client",
    stat: "3.0",
    gridCoord: [3, 2],
  },
  { title: "Web", description: "Web Browser", stat: "5.2", gridCoord: [4, 2] },
  { title: "Cal", description: "Calendar", stat: "2.3", gridCoord: [5, 2] },
  { title: "Shr", description: "Share", stat: "1.1", gridCoord: [1, 3] },
  { title: "Cam", description: "Camera", stat: "2.4", gridCoord: [2, 3] },
  { title: "Game", description: "Games", stat: "3.2", gridCoord: [3, 3] },
  { title: "Chat", description: "Messaging", stat: "2.8", gridCoord: [4, 3] },
  {
    title: "Dev",
    description: "Developer Tools",
    stat: "4.5",
    gridCoord: [5, 3],
  },
  { title: "Map", description: "Maps", stat: "3.7", gridCoord: [1, 4] },
  { title: "Note", description: "Notes", stat: "1.9", gridCoord: [2, 4] },
  { title: "Shop", description: "Store", stat: "2.2", gridCoord: [3, 4] },
  {
    title: "Calc",
    description: "Scientific Calculator",
    stat: "3.8",
    gridCoord: [4, 4],
  },
  { title: "Pdf", description: "PDF Reader", stat: "2.6", gridCoord: [5, 4] },
];

// Original icon format for other components
export interface IconData {
  id: string;
  title: string;
  label: string;
  icon: LucideIcon;
  grid: [number, number];
  color: string;
}

export const iconObjects: IconData[] = [
  {
    id: "text-editor",
    title: "Text Editor",
    label: "Text",
    icon: FileText,
    grid: [0, 0],
    color: "#3b82f6",
  },
  {
    id: "calculator",
    title: "Calculator",
    label: "Calc",
    icon: Calculator,
    grid: [1, 0],
    color: "#10b981",
  },
  {
    id: "settings",
    title: "Settings",
    label: "Settings",
    icon: Settings,
    grid: [2, 0],
    color: "#6b7280",
  },
  {
    id: "gallery",
    title: "Gallery",
    label: "Images",
    icon: ImageIcon,
    grid: [0, 1],
    color: "#f59e0b",
  },
  {
    id: "terminal",
    title: "Terminal",
    label: "Terminal",
    icon: Terminal,
    grid: [1, 1],
    color: "#22c55e",
  },
  {
    id: "music",
    title: "Music Player",
    label: "Music",
    icon: Music,
    grid: [2, 1],
    color: "#8b5cf6",
  },
];

// Icon mapping for 3D rendering - maps desktop icon titles to Lucide icons
export const iconMapping: Record<string, LucideIcon> = {
  // Primary icons
  Doc: FileText,
  Calc: Calculator,
  Img: ImageIcon,
  Term: Terminal,
  Set: Settings,
  Mus: Music,
  Fold: Folder,
  Mail: Mail,
  Web: Globe,
  Cal: Calendar,
  Shr: Share2,
  Cam: Camera,
  Game: Gamepad2,
  Chat: MessageSquare,
  Dev: Code,
  Map: Map,
  Note: StickyNote,
  Shop: ShoppingBag,
  Pdf: FileImage,

  // Fallback icons for any missing mappings
  default: FileText,
};

// Helper function to get icon for a desktop icon title
export const getIconForTitle = (title: string): LucideIcon => {
  return iconMapping[title] || iconMapping["default"];
};

/**
 * Randomly selects icons to use 3D meshes
 * @param icons Array of desktop icons
 * @param percentage Percentage of icons to convert to 3D (0-1)
 * @param meshTypes Array of mesh types to randomly choose from
 * @returns Updated icons array with 3D mesh configuration
 */
export const applyRandom3DMesh = (
  icons: DesktopIconData[],
  percentage: number = 0.3,
  meshTypes: MeshType[] = [
    "dodecahedron",
    "icosahedron",
    "octahedron",
    "tetrahedron",
    "cube",
    "teapot",
    "suzanne",
    "torusknot",
    "torus",
    "cone",
    "cylinder",
  ]
): DesktopIconData[] => {
  const updatedIcons = [...icons];
  const numToConvert = Math.floor(icons.length * percentage);

  // Create array of indices and shuffle them
  const indices = Array.from({ length: icons.length }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  // Apply 3D mesh to first numToConvert icons
  for (let i = 0; i < numToConvert; i++) {
    const iconIndex = indices[i];
    const randomMeshType =
      meshTypes[Math.floor(Math.random() * meshTypes.length)];

    updatedIcons[iconIndex] = {
      ...updatedIcons[iconIndex],
      use3DMesh: true,
      meshType: randomMeshType,
      enableMeshRotation: Math.random() > 0.3, // 70% chance of rotation
    };
  }

  return updatedIcons;
};

/**
 * Pre-configured desktop icons with some 3D mesh examples
 */
export const desktopIconsWithMesh: DesktopIconData[] = [
  { title: "Doc", description: "Text Editor", stat: "1.0", gridCoord: [1, 1] },
  {
    title: "Calc",
    description: "Calculator",
    stat: "2.0",
    gridCoord: [2, 1],
    use3DMesh: true,
    meshType: "cube",
    enableMeshRotation: true,
  },
  { title: "Img", description: "Image Viewer", stat: "3.5", gridCoord: [3, 1] },
  {
    title: "Term",
    description: "Terminal",
    stat: "4.0",
    gridCoord: [4, 1],
    use3DMesh: true,
    meshType: "octahedron",
    enableMeshRotation: false,
  },
  { title: "Set", description: "Settings", stat: "1.2", gridCoord: [5, 1] },
  {
    title: "Mus",
    description: "Music Player",
    stat: "2.1",
    gridCoord: [1, 2],
    use3DMesh: true,
    meshType: "icosahedron",
    enableMeshRotation: true,
  },
  {
    title: "Fold",
    description: "File Explorer",
    stat: "1.5",
    gridCoord: [2, 2],
  },
  {
    title: "Mail",
    description: "Email Client",
    stat: "3.0",
    gridCoord: [3, 2],
    use3DMesh: true,
    meshType: "dodecahedron",
    enableMeshRotation: true,
  },
  { title: "Web", description: "Web Browser", stat: "5.2", gridCoord: [4, 2] },
  { title: "Cal", description: "Calendar", stat: "2.3", gridCoord: [5, 2] },
  { title: "Shr", description: "Share", stat: "1.1", gridCoord: [1, 3] },
  {
    title: "Cam",
    description: "Camera",
    stat: "2.4",
    gridCoord: [2, 3],
    use3DMesh: true,
    meshType: "icosahedron",
    enableMeshRotation: true,
  },
  { title: "Game", description: "Games", stat: "3.2", gridCoord: [3, 3] },
  { title: "Chat", description: "Messaging", stat: "2.8", gridCoord: [4, 3] },
  {
    title: "Dev",
    description: "Developer Tools",
    stat: "4.5",
    gridCoord: [5, 3],
    use3DMesh: true,
    meshType: "tetrahedron",
    enableMeshRotation: false,
  },
  { title: "Map", description: "Maps", stat: "3.7", gridCoord: [1, 4] },
  { title: "Note", description: "Notes", stat: "1.9", gridCoord: [2, 4] },
  { title: "Shop", description: "Store", stat: "2.2", gridCoord: [3, 4] },
  {
    title: "Calc",
    description: "Scientific Calculator",
    stat: "3.8",
    gridCoord: [4, 4],
  },
  { title: "Pdf", description: "PDF Reader", stat: "2.6", gridCoord: [5, 4] },
];
