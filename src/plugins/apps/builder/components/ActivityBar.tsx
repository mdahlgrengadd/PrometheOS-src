
import React from 'react';
import { 
  FileCode, 
  Search, 
  GitBranch, 
  LayoutGrid, 
  Settings 
} from 'lucide-react';
import { Tooltip } from "@/components/ui/tooltip";
import { TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ViewType } from '../types';
import useIdeStore from '../store/ide-store';

const ActivityBar: React.FC = () => {
  const { activeView, setActiveView } = useIdeStore();
  
  const icons = [
    { id: 'explorer' as ViewType, icon: FileCode, label: 'Explorer' },
    { id: 'search' as ViewType, icon: Search, label: 'Search' },
    { id: 'git' as ViewType, icon: GitBranch, label: 'Source Control' },
    { id: 'extensions' as ViewType, icon: LayoutGrid, label: 'Extensions' },
  ];
  
  return (
    <div className="activity-bar flex flex-col items-center py-2">
      <div className="flex flex-col items-center space-y-4">
        {icons.map((item) => (
          <ActivityBarItem 
            key={item.id}
            icon={item.icon} 
            label={item.label} 
            isActive={activeView === item.id}
            onClick={() => setActiveView(item.id)}
          />
        ))}
      </div>
      
      <div className="flex-1"></div>
      
      <ActivityBarItem 
        icon={Settings} 
        label="Settings" 
        isActive={false}
        onClick={() => {/* Add settings handler */}}
      />
    </div>
  );
};

interface ActivityBarItemProps {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const ActivityBarItem: React.FC<ActivityBarItemProps> = ({ 
  icon: Icon, 
  label, 
  isActive,
  onClick
}) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <button 
            className={`p-2 rounded transition-colors relative ${
              isActive 
                ? 'text-primary bg-sidebar-accent' 
                : 'text-sidebar-foreground hover:text-primary hover:bg-sidebar-accent'
            }`}
            onClick={onClick}
            aria-label={label}
          >
            {isActive && (
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary" />
            )}
            <Icon size={24} />
          </button>
        </TooltipTrigger>
        <TooltipContent 
          side="right"
          className="bg-popover text-popover-foreground"
        >
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ActivityBar;
