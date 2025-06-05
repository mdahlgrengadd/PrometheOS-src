import {
  Calculator,
  Calendar,
  Camera,
  FileText,
  Folder,
  Globe,
  Image as ImageIcon,
  LucideIcon,
  Mail,
  Music,
  Settings,
  Share2,
  Terminal,
} from "lucide-react";

export interface DesktopIconData {
  title: string;
  description: string;
  stat: string;
  gridCoord: [number, number];
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
