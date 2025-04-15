
import React, { useState } from 'react';
import { 
  FilePlus, 
  FolderPlus, 
  Trash2, 
  RefreshCcw, 
  ChevronUp, 
  Github,
  Network,
  LogIn,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFileSystem } from '@/hooks/useFileSystem';
import { toast } from '@/components/ui/use-toast';
import { FileSystemItem, Drive } from '@/services/FileSystem';

interface FileBrowserToolbarProps {
  selectedItems: string[];
  refreshFiles: () => void;
}

const FileBrowserToolbar: React.FC<FileBrowserToolbarProps> = ({
  selectedItems,
  refreshFiles
}) => {
  const {
    createFile,
    createFolder,
    deleteItem,
    navigateToParentDirectory,
    getCurrentDirectoryInfo,
    addNetworkDrive,
    connectToGitHub
  } = useFileSystem();

  const [isNewFileDialogOpen, setIsNewFileDialogOpen] = useState(false);
  const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] = useState(false);
  const [isNetworkDriveDialogOpen, setIsNetworkDriveDialogOpen] = useState(false);
  const [isGithubLoginDialogOpen, setIsGithubLoginDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [networkUrl, setNetworkUrl] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [githubRepo, setGithubRepo] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const currentDir = getCurrentDirectoryInfo();

  const handleNewFile = () => {
    if (newName.trim()) {
      createFile(newName.trim());
      setNewName('');
      setIsNewFileDialogOpen(false);
      refreshFiles();
      toast({
        title: "File Created",
        description: `${newName.trim()} has been created successfully.`
      });
    }
  };

  const handleNewFolder = () => {
    if (newName.trim()) {
      createFolder(newName.trim());
      setNewName('');
      setIsNewFolderDialogOpen(false);
      refreshFiles();
      toast({
        title: "Folder Created",
        description: `${newName.trim()} has been created successfully.`
      });
    }
  };

  const handleDelete = () => {
    if (selectedItems.length > 0) {
      selectedItems.forEach(itemId => {
        deleteItem(itemId);
      });
      refreshFiles();
      toast({
        title: "Deleted",
        description: `${selectedItems.length} item(s) have been deleted.`
      });
    }
  };

  const handleAddNetworkDrive = async () => {
    if (networkUrl.trim()) {
      try {
        await addNetworkDrive(networkUrl.trim());
        setNetworkUrl('');
        setIsNetworkDriveDialogOpen(false);
        refreshFiles();
        toast({
          title: "Network Drive Added",
          description: `Network drive has been added successfully.`
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to add network drive.",
          variant: "destructive"
        });
      }
    }
  };

  const handleGithubLogin = async () => {
    if (githubToken.trim() && githubRepo.trim()) {
      try {
        await connectToGitHub(githubToken.trim(), githubRepo.trim(), false);
        setGithubToken('');
        setGithubRepo('');
        setIsGithubLoginDialogOpen(false);
        setIsAuthenticated(true);
        refreshFiles();
        toast({
          title: "GitHub Connected",
          description: `GitHub repository has been connected successfully.`
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to connect to GitHub.",
          variant: "destructive"
        });
      }
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    toast({
      title: "Logged Out",
      description: "You have been logged out from GitHub."
    });
  };

  return (
    <div className="flex items-center space-x-2 p-2 border-b bg-muted/40">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => navigateToParentDirectory()}
        disabled={!currentDir?.parent}
      >
        <ChevronUp className="h-4 w-4 mr-1" />
        Up
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setIsNewFileDialogOpen(true)}
      >
        <FilePlus className="h-4 w-4 mr-1" />
        New File
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setIsNewFolderDialogOpen(true)}
      >
        <FolderPlus className="h-4 w-4 mr-1" />
        New Folder
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleDelete}
        disabled={selectedItems.length === 0}
      >
        <Trash2 className="h-4 w-4 mr-1" />
        Delete
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={refreshFiles}
      >
        <RefreshCcw className="h-4 w-4 mr-1" />
        Refresh
      </Button>

      <div className="ml-auto flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsNetworkDriveDialogOpen(true)}
        >
          <Network className="h-4 w-4 mr-1" />
          Add Network
        </Button>
        
        {!isAuthenticated ? (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsGithubLoginDialogOpen(true)}
          >
            <Github className="h-4 w-4 mr-1" />
            GitHub Login
          </Button>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-1" />
            Logout
          </Button>
        )}
      </div>

      {/* New File Dialog */}
      <Dialog open={isNewFileDialogOpen} onOpenChange={setIsNewFileDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New File</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleNewFile}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Folder Dialog */}
      <Dialog open={isNewFolderDialogOpen} onOpenChange={setIsNewFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleNewFolder}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Network Drive Dialog */}
      <Dialog open={isNetworkDriveDialogOpen} onOpenChange={setIsNetworkDriveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Network Drive</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="url" className="text-right">
                GitHub URL
              </Label>
              <Input
                id="url"
                value={networkUrl}
                onChange={(e) => setNetworkUrl(e.target.value)}
                className="col-span-3"
                placeholder="https://github.com/username/repo"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleAddNetworkDrive}>Add Drive</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* GitHub Login Dialog */}
      <Dialog open={isGithubLoginDialogOpen} onOpenChange={setIsGithubLoginDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>GitHub Login</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="token" className="text-right">
                Access Token
              </Label>
              <Input
                id="token"
                type="password"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                className="col-span-3"
                placeholder="GitHub personal access token"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="repo" className="text-right">
                Repository
              </Label>
              <Input
                id="repo"
                value={githubRepo}
                onChange={(e) => setGithubRepo(e.target.value)}
                className="col-span-3"
                placeholder="https://github.com/username/repo"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleGithubLogin}>Connect</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FileBrowserToolbar;
