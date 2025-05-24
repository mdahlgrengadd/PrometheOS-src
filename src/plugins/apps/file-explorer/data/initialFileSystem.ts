
import { FileSystemItem } from "../types/fileSystem";

// Simulated initial file system
export const initialFileSystem: FileSystemItem = {
  id: 'root',
  name: 'My Computer',
  type: 'folder' as const,
  children: [
    {
      id: 'desktop',
      name: 'Desktop',
      type: 'folder' as const,
      children: [
        { id: 'readme', name: 'README.txt', type: 'file' as const, size: 1024 },
        { id: 'image1', name: 'vacation.jpg', type: 'file' as const, size: 2048000 },
        { id: 'screenshot', name: 'screenshot.png', type: 'file' as const, size: 512000 },
        { id: 'notes', name: 'notes.txt', type: 'file' as const, size: 256 }
      ]
    },
    {
      id: 'documents',
      name: 'Documents',
      type: 'folder' as const,
      children: [
        { id: 'report', name: 'Annual Report.docx', type: 'file' as const, size: 512000 },
        { id: 'presentation', name: 'Presentation.pdf', type: 'file' as const, size: 1024000 },
        {
          id: 'projects',
          name: 'Projects',
          type: 'folder' as const,
          children: [
            { 
              id: 'website-project',
              name: 'Website', 
              type: 'folder' as const, 
              children: [
                { id: 'index-html', name: 'index.html', type: 'file' as const, size: 4096 },
                { id: 'style-css', name: 'style.css', type: 'file' as const, size: 2048 },
                { id: 'app-js', name: 'app.js', type: 'file' as const, size: 8192 }
              ]
            },
            { id: 'python-script', name: 'script.py', type: 'file' as const, size: 1536 }
          ]
        }
      ]
    },
    {
      id: 'downloads',
      name: 'Downloads',
      type: 'folder' as const,
      children: [
        { id: 'installer', name: 'installer.exe', type: 'file' as const, size: 104857600 },
        { id: 'song', name: 'favorite-song.mp3', type: 'file' as const, size: 5242880 },
        { id: 'video', name: 'tutorial.mp4', type: 'file' as const, size: 52428800 },
        { id: 'archive', name: 'backup.zip', type: 'file' as const, size: 10485760 }
      ]
    }
  ]
};
