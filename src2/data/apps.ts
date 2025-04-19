
import { 
  Home, 
  Mail, 
  Calendar, 
  Settings, 
  FileText, 
  Image, 
  Music, 
  Calculator, 
  Chrome, 
  MessageSquare 
} from "lucide-react";

export interface App {
  id: string;
  name: string;
  icon: any;
  color: string;
  component?: React.ComponentType<any>;
}

export const apps: App[] = [
  {
    id: "home",
    name: "Home",
    icon: Home,
    color: "bg-blue-500"
  },
  {
    id: "mail",
    name: "Mail",
    icon: Mail,
    color: "bg-red-500"
  },
  {
    id: "calendar",
    name: "Calendar",
    icon: Calendar,
    color: "bg-yellow-500"
  },
  {
    id: "settings",
    name: "Settings",
    icon: Settings,
    color: "bg-gray-500"
  },
  {
    id: "notes",
    name: "Notes",
    icon: FileText,
    color: "bg-yellow-400"
  },
  {
    id: "photos",
    name: "Photos",
    icon: Image,
    color: "bg-purple-500"
  },
  {
    id: "music",
    name: "Music",
    icon: Music,
    color: "bg-pink-500"
  },
  {
    id: "calculator",
    name: "Calculator",
    icon: Calculator,
    color: "bg-gray-600"
  },
  {
    id: "browser",
    name: "Browser",
    icon: Chrome,
    color: "bg-blue-600"
  },
  {
    id: "messages",
    name: "Messages",
    icon: MessageSquare,
    color: "bg-green-500"
  }
];

export const getApp = (id: string): App | undefined => {
  return apps.find(app => app.id === id);
};
