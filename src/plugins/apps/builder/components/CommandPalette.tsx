import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import useIdeStore from '../store/ide-store';
import { commands } from '../utils/mock-data';
import { Command } from '../types';

const CommandPalette: React.FC = () => {
  const { commandPaletteOpen, toggleCommandPalette } = useIdeStore();
  const [query, setQuery] = useState('');
  const [filteredCommands, setFilteredCommands] = useState<Command[]>(commands);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Filter commands based on query
  useEffect(() => {
    if (!query) {
      setFilteredCommands(commands);
      return;
    }
    
    const lowerCaseQuery = query.toLowerCase();
    const filtered = commands.filter(command => 
      command.title.toLowerCase().includes(lowerCaseQuery) ||
      (command.category && command.category.toLowerCase().includes(lowerCaseQuery))
    );
    
    setFilteredCommands(filtered);
    setSelectedIndex(0);
  }, [query]);
  
  // Focus input on open
  useEffect(() => {
    if (commandPaletteOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [commandPaletteOpen]);
  
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prevIndex) => 
          prevIndex < filteredCommands.length - 1 ? prevIndex + 1 : prevIndex
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prevIndex) => 
          prevIndex > 0 ? prevIndex - 1 : prevIndex
        );
        break;
      case 'Enter':
        e.preventDefault();
        executeCommand(filteredCommands[selectedIndex]);
        break;
      case 'Escape':
        e.preventDefault();
        toggleCommandPalette();
        break;
    }
  };
  
  const executeCommand = (command: Command) => {
    toggleCommandPalette();
    command.handler();
  };
  
  if (!commandPaletteOpen) {
    return null;
  }
  
  return (
    <div 
      className="command-palette"
      onClick={() => toggleCommandPalette()}
    >
      <div 
        className="command-palette-content animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-3 py-2 bg-input border-b border-border">
          <Search size={16} className="mr-2 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        
        <div className="command-palette-results">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((command, index) => (
              <div
                key={command.id}
                className={`command-palette-item ${index === selectedIndex ? 'selected' : ''}`}
                onClick={() => executeCommand(command)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <span className="flex-1">{command.title}</span>
                {command.category && (
                  <span className="text-xs text-muted-foreground mr-2">
                    {command.category}
                  </span>
                )}
                {command.shortcut && (
                  <kbd className="bg-muted text-muted-foreground px-2 py-0.5 text-xs rounded">
                    {command.shortcut}
                  </kbd>
                )}
              </div>
            ))
          ) : (
            <div className="p-3 text-muted-foreground">
              No commands found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
