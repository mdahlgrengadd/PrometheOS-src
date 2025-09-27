// Consolidated UI Kit - ShadCN/UI Components (Federated)
// This replaces the multiple UI systems with a single, shared library

// Base utilities
export { cn } from './lib/utils';

// Core components - most commonly used
export { Button } from './ui/button';
export { Input } from './ui/input';
export { Label } from './ui/label';
export { Textarea } from './ui/textarea';
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';

// Layout components
export { Separator } from './ui/separator';
export { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
export { ScrollArea } from './ui/scroll-area';

// Form components
export { Checkbox } from './ui/checkbox';
export { Switch } from './ui/switch';
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
export { RadioGroup, RadioGroupItem } from './ui/radio-group';
export { Slider } from './ui/slider';

// Feedback components
export { Alert, AlertDescription, AlertTitle } from './ui/alert';
export { Badge } from './ui/badge';
export { Progress } from './ui/progress';
export { Skeleton } from './ui/skeleton';
export { Toast, ToastAction, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from './ui/toast';
export { Toaster } from './ui/toaster';
export { useToast, toast } from './ui/use-toast';

// Overlay components
export { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
export { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
export { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
export { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';

// Navigation components
export { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
export { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from './ui/navigation-menu';

// Display components
export { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
export { AspectRatio } from './ui/aspect-ratio';
export { Calendar } from './ui/calendar';
export { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

// Window management components (simplified from shelley-wm)
export { WindowChrome } from './window/window-chrome';
export { WindowContainer } from './window/window-container';