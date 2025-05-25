
/**
 * FileSystem service for managing files and folders in local storage
 */

export type FileType = 'file' | 'folder' | 'drive';
export type DriveType = 'local' | 'github' | 'network';

export interface FileSystemItem {
  id: string;
  name: string;
  type: FileType;
  parent: string | null;
  content?: string;
  path: string;
  driveId: string;
  modifiedAt: number;
  createdAt: number;
}

export interface Drive {
  id: string;
  name: string;
  type: DriveType;
  url?: string;
  token?: string;
  readOnly: boolean;
  createdAt: number;
}

class FileSystem {
  private static instance: FileSystem;
  private FILES_KEY = 'filesystem_files';
  private DRIVES_KEY = 'filesystem_drives';
  
  private constructor() {
    // Initialize with default local drive if none exists
    if (this.getDrives().length === 0) {
      const localDrive: Drive = {
        id: 'local-drive',
        name: 'Local Drive',
        type: 'local',
        readOnly: false,
        createdAt: Date.now()
      };
      this.saveDrive(localDrive);
      
      // Create root folder for local drive
      this.saveFile({
        id: 'root',
        name: 'Root',
        type: 'folder',
        parent: null,
        path: '/',
        driveId: 'local-drive',
        modifiedAt: Date.now(),
        createdAt: Date.now()
      });
    }
  }
  
  public static getInstance(): FileSystem {
    if (!FileSystem.instance) {
      FileSystem.instance = new FileSystem();
    }
    return FileSystem.instance;
  }
  
  // File operations
  public getFiles(): FileSystemItem[] {
    const files = localStorage.getItem(this.FILES_KEY);
    return files ? JSON.parse(files) : [];
  }
  
  public getFileById(id: string): FileSystemItem | null {
    return this.getFiles().find(file => file.id === id) || null;
  }
  
  public getFilesByParent(parentId: string | null, driveId: string): FileSystemItem[] {
    return this.getFiles().filter(
      file => file.parent === parentId && file.driveId === driveId
    );
  }
  
  public saveFile(file: FileSystemItem): void {
    const files = this.getFiles();
    const existingFileIndex = files.findIndex(f => f.id === file.id);
    
    if (existingFileIndex >= 0) {
      files[existingFileIndex] = {
        ...files[existingFileIndex],
        ...file,
        modifiedAt: Date.now()
      };
    } else {
      files.push(file);
    }
    
    localStorage.setItem(this.FILES_KEY, JSON.stringify(files));
  }
  
  public deleteFile(id: string): void {
    const filesToDelete = [id];
    const files = this.getFiles();
    
    // Find all children recursively
    const findChildren = (parentId: string) => {
      const children = files.filter(file => file.parent === parentId);
      children.forEach(child => {
        filesToDelete.push(child.id);
        if (child.type === 'folder') {
          findChildren(child.id);
        }
      });
    };
    
    findChildren(id);
    
    const remainingFiles = files.filter(file => !filesToDelete.includes(file.id));
    localStorage.setItem(this.FILES_KEY, JSON.stringify(remainingFiles));
  }
  
  public moveFile(id: string, newParentId: string | null, newPath: string): void {
    const files = this.getFiles();
    const fileIndex = files.findIndex(f => f.id === id);
    
    if (fileIndex >= 0) {
      const file = files[fileIndex];
      
      // Update the file's parent and path
      files[fileIndex] = {
        ...file,
        parent: newParentId,
        path: newPath,
        modifiedAt: Date.now()
      };
      
      // If this is a folder, update paths of all children
      if (file.type === 'folder') {
        const oldPath = file.path;
        const updateChildrenPaths = (parentId: string, parentPath: string) => {
          const children = files.filter(f => f.parent === parentId);
          children.forEach(child => {
            const childIndex = files.findIndex(f => f.id === child.id);
            const newChildPath = `${parentPath}/${child.name}`;
            files[childIndex] = {
              ...child,
              path: newChildPath,
              modifiedAt: Date.now()
            };
            
            if (child.type === 'folder') {
              updateChildrenPaths(child.id, newChildPath);
            }
          });
        };
        
        updateChildrenPaths(id, newPath);
      }
      
      localStorage.setItem(this.FILES_KEY, JSON.stringify(files));
    }
  }
  
  // Drive operations
  public getDrives(): Drive[] {
    const drives = localStorage.getItem(this.DRIVES_KEY);
    return drives ? JSON.parse(drives) : [];
  }
  
  public getDriveById(id: string): Drive | null {
    return this.getDrives().find(drive => drive.id === id) || null;
  }
  
  public saveDrive(drive: Drive): void {
    const drives = this.getDrives();
    const existingDriveIndex = drives.findIndex(d => d.id === drive.id);
    
    if (existingDriveIndex >= 0) {
      drives[existingDriveIndex] = drive;
    } else {
      drives.push(drive);
    }
    
    localStorage.setItem(this.DRIVES_KEY, JSON.stringify(drives));
  }
  
  public deleteDrive(id: string): void {
    const drives = this.getDrives();
    const remainingDrives = drives.filter(drive => drive.id !== id);
    localStorage.setItem(this.DRIVES_KEY, JSON.stringify(remainingDrives));
    
    // Delete all files associated with this drive
    const files = this.getFiles();
    const remainingFiles = files.filter(file => file.driveId !== id);
    localStorage.setItem(this.FILES_KEY, JSON.stringify(remainingFiles));
  }
  
  // GitHub operations
  public async connectToGitHub(accessToken: string, repoUrl: string, readOnly: boolean): Promise<Drive> {
    // Parse GitHub URL to extract owner and repo
    const urlParts = repoUrl.replace(/\/$/, '').split('/');
    const repoName = urlParts[urlParts.length - 1];
    const owner = urlParts[urlParts.length - 2];
    
    // Create a new drive
    const drive: Drive = {
      id: `github-${owner}-${repoName}`,
      name: `${owner}/${repoName}`,
      type: 'github',
      url: repoUrl,
      token: accessToken,
      readOnly,
      createdAt: Date.now()
    };
    
    this.saveDrive(drive);
    
    // Create root folder for GitHub drive
    this.saveFile({
      id: `${drive.id}-root`,
      name: repoName,
      type: 'folder',
      parent: null,
      path: '/',
      driveId: drive.id,
      modifiedAt: Date.now(),
      createdAt: Date.now()
    });
    
    return drive;
  }
  
  public async addNetworkDrive(url: string): Promise<Drive> {
    // Parse URL to create a name
    const urlParts = url.replace(/\/$/, '').split('/');
    const repoName = urlParts[urlParts.length - 1];
    const owner = urlParts[urlParts.length - 2];
    
    // Create a new drive
    const drive: Drive = {
      id: `network-${Date.now()}`,
      name: `${owner}/${repoName}`,
      type: 'network',
      url,
      readOnly: true,
      createdAt: Date.now()
    };
    
    this.saveDrive(drive);
    
    // Create root folder for network drive
    this.saveFile({
      id: `${drive.id}-root`,
      name: drive.name,
      type: 'folder',
      parent: null,
      path: '/',
      driveId: drive.id,
      modifiedAt: Date.now(),
      createdAt: Date.now()
    });
    
    return drive;
  }
}

export const fileSystem = FileSystem.getInstance();
