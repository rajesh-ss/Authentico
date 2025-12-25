import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  LayoutDashboard, 
  FileText, 
  Upload, 
  Users, 
  ClipboardCheck,
  RefreshCcw,
  Shield,
  QrCode,
  Settings,
  LogOut,
  GraduationCap,
  Bell,
  ChevronDown,
  X,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: string;
  children?: NavItem[];
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isHovering: boolean;
  onHoverChange: (hovering: boolean) => void;
}

const roleNavItems: Record<UserRole, NavItem[]> = {
  issuer: [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'Issue Marks Cards', icon: Upload, href: '/issue/template' },
    { label: 'Marks Cards', icon: GraduationCap, href: '/generation-status' },
  ],
  college_admin: [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'User Management', icon: Users, href: '/users' },
    { label: 'All Marks Cards', icon: FileText, href: '/cards' },
    { label: 'Re-Evaluations', icon: RefreshCcw, href: '/reevaluations', badge: '5' },
  ],
  reevaluation_approver: [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'Pending Approvals', icon: ClipboardCheck, href: '/approvals', badge: '8' },
    { label: 'Approved Requests', icon: FileText, href: '/approved' },
    { label: 'Rejected Requests', icon: FileText, href: '/rejected' },
  ],
  reevaluation_updater: [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'Update Marks', icon: RefreshCcw, href: '/update-marks', badge: '4' },
    { label: 'Completed Updates', icon: FileText, href: '/completed' },
  ],
  verifying_admin: [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'Pending Signatures', icon: Shield, href: '/signatures', badge: '6' },
    { label: 'Signed Records', icon: FileText, href: '/signed' },
  ],
  student: [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'My Marks Cards', icon: GraduationCap, href: '/my-cards' },
    { label: 'Re-Evaluations', icon: RefreshCcw, href: '/my-reevaluations' },
    { label: 'Verify Certificate', icon: QrCode, href: '/verify' },
  ],
};

export function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse, isHovering, onHoverChange }: SidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Determine if sidebar should show expanded content (collapsed but hovering = expanded view)
  const showExpanded = !isCollapsed || isHovering;

  if (!user) return null;

  const navItems = roleNavItems[user.role];

  const toggleExpand = (label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const isActive = (href: string) => location.pathname === href;
  const isParentActive = (item: NavItem) => 
    item.children?.some(child => location.pathname.startsWith(child.href));

  const handleNavClick = () => {
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const NavItemContent = ({ item, isChild = false }: { item: NavItem; isChild?: boolean }) => {
    const active = isActive(item.href);
    
    // Show collapsed (icon only) view when not showing expanded content and not a child item
    if (!showExpanded && !isChild) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Link
              to={item.href}
              onClick={handleNavClick}
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-lg transition-colors mx-auto",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.badge && (
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-destructive" />
              )}
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2">
            {item.label}
            {item.badge && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {item.badge}
              </Badge>
            )}
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <Link
        to={item.href}
        onClick={handleNavClick}
        className={cn(
          "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors",
          active
            ? "bg-sidebar-primary text-sidebar-primary-foreground"
            : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
        )}
      >
        <div className="flex items-center gap-3">
          <item.icon className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{item.label}</span>
        </div>
        {item.badge && (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-sidebar-primary/20 text-sidebar-primary-foreground">
            {item.badge}
          </Badge>
        )}
      </Link>
    );
  };

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar gradient-sidebar border-r border-sidebar-border flex flex-col z-50 transition-all duration-300 ease-in-out",
        "lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        showExpanded ? "w-64" : "w-16"
      )}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
    >
      {/* Logo & Branding */}
      <div className={cn(
        "border-b border-sidebar-border transition-all duration-300",
        showExpanded ? "p-4 md:p-6" : "p-3"
      )}>
        <div className="flex items-center justify-between">
          <div className={cn(
            "flex items-center gap-3 overflow-hidden",
            !showExpanded && "justify-center w-full"
          )}>
            <div className={cn(
              "rounded-lg bg-gradient-to-br from-sidebar-primary to-accent flex items-center justify-center flex-shrink-0",
              showExpanded ? "h-10 w-10" : "h-9 w-9"
            )}>
              <Shield className={cn(
                "text-sidebar-primary-foreground",
                showExpanded ? "h-6 w-6" : "h-5 w-5"
              )} />
            </div>
            {showExpanded && (
              <div className="min-w-0">
                <h1 className="font-semibold text-sidebar-foreground text-sm truncate">BlockCert</h1>
                <p className="text-[10px] text-sidebar-foreground/60 truncate">Academic Verification</p>
              </div>
            )}
          </div>
          {/* Mobile close button */}
          {showExpanded && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent flex-shrink-0"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className={cn(
        "flex-1 overflow-y-auto transition-all duration-300",
        showExpanded ? "p-4" : "p-2"
      )}>
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.label} className="relative">
              {item.children && showExpanded ? (
                <div>
                  <button
                    onClick={() => toggleExpand(item.label)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors",
                      isParentActive(item)
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </div>
                    <ChevronDown 
                      className={cn(
                        "h-4 w-4 transition-transform",
                        expandedItems.includes(item.label) && "rotate-180"
                      )} 
                    />
                  </button>
                  {expandedItems.includes(item.label) && (
                    <ul className="mt-1 ml-4 pl-4 border-l border-sidebar-border space-y-1">
                      {item.children.map((child) => (
                        <li key={child.label}>
                          <NavItemContent item={child} isChild />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <NavItemContent item={item} />
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Collapse Toggle (Desktop only) */}
      <div className={cn(
        "hidden lg:flex border-t border-sidebar-border",
        showExpanded ? "p-3 px-4" : "p-2 justify-center"
      )}>
        <Button
          variant="ghost"
          size={showExpanded ? "sm" : "icon"}
          onClick={onToggleCollapse}
          className={cn(
            "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
            showExpanded ? "w-full justify-start gap-2" : "w-10 h-10"
          )}
        >
          {isCollapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4" />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </Button>
      </div>

      {/* Footer Actions */}
      <div className={cn(
        "border-t border-sidebar-border space-y-1 transition-all duration-300",
        showExpanded ? "p-4" : "p-2"
      )}>
        {!showExpanded ? (
          <>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  to="/notifications"
                  onClick={handleNavClick}
                  className="flex items-center justify-center w-10 h-10 rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors mx-auto relative"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Notifications</TooltipContent>
            </Tooltip>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  to="/settings"
                  onClick={handleNavClick}
                  className="flex items-center justify-center w-10 h-10 rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors mx-auto"
                >
                  <Settings className="h-5 w-5" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Settings</TooltipContent>
            </Tooltip>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={logout}
                  className="flex items-center justify-center w-10 h-10 rounded-lg text-destructive/80 hover:text-destructive hover:bg-destructive/10 transition-colors mx-auto"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Logout</TooltipContent>
            </Tooltip>
          </>
        ) : (
          <>
            <Link
              to="/notifications"
              onClick={handleNavClick}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4" />
                Notifications
              </div>
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                4
              </Badge>
            </Link>
            <Link
              to="/settings"
              onClick={handleNavClick}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-destructive/80 hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
