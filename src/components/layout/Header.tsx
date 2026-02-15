import { useAuth } from '@/contexts/AuthContext';
import { getPrimaryRole, getRoleLabel } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Bell, Building2, ChevronDown, Menu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
}

export function Header({ title, subtitle, onMenuClick }: HeaderProps) {
  const { user } = useAuth();
  const primaryRole = user ? getPrimaryRole(user.roles) : undefined;

  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-4 md:px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile menu button */}
          <Button variant="ghost" size="icon" className="lg:hidden shrink-0" onClick={onMenuClick}>
            <Menu className="h-5 w-5" />
          </Button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-2xl font-semibold text-foreground truncate">
                {title}
              </h1>
              {primaryRole && (
                <Badge variant="outline" className="hidden sm:flex text-[10px] font-normal py-0">
                  {getRoleLabel(primaryRole)}
                </Badge>
              )}
            </div>
            {subtitle && (
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5 truncate">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Search - Hidden on mobile */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search records, students..."
              className="w-48 lg:w-64 pl-9 bg-muted/50"
            />
          </div>

          {/* Institution Badge - Hidden on mobile */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground">{user?.institution}</span>
          </div>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
                  4
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 md:w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                Notifications
                <Badge variant="secondary" className="text-[10px]">
                  4 new
                </Badge>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-64 overflow-y-auto">
                <DropdownMenuItem className="flex flex-col items-start gap-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-success" />
                    <span className="font-medium text-sm">Re-evaluation Approved</span>
                  </div>
                  <p className="text-xs text-muted-foreground ml-4">
                    Request #REV-2024-089 has been approved
                  </p>
                  <span className="text-[10px] text-muted-foreground ml-4">2 min ago</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-accent" />
                    <span className="font-medium text-sm">Blockchain Confirmed</span>
                  </div>
                  <p className="text-xs text-muted-foreground ml-4">
                    45 marks cards verified on chain
                  </p>
                  <span className="text-[10px] text-muted-foreground ml-4">15 min ago</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-warning" />
                    <span className="font-medium text-sm">Pending Signature</span>
                  </div>
                  <p className="text-xs text-muted-foreground ml-4">
                    3 records awaiting your signature
                  </p>
                  <span className="text-[10px] text-muted-foreground ml-4">1 hour ago</span>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-center text-accent cursor-pointer">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
