import { useAuth } from '@/contexts/AuthContext';
import { UserRole, roleLabels } from '@/types/auth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Wallet,
  GraduationCap,
  Bell,
  ChevronDown,
  Building2
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

const roleNavItems: Record<UserRole, NavItem[]> = {
  issuer: [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'Issue Marks Cards', icon: Upload, href: '/issue', children: [
      { label: 'Upload Template', icon: FileText, href: '/issue/template' },
      { label: 'Upload Data', icon: Upload, href: '/issue/upload' },
      { label: 'Generate Cards', icon: FileText, href: '/issue/generate' },
    ]},
    { label: 'Issued Cards', icon: FileText, href: '/cards', badge: '156' },
    { label: 'Re-Evaluations', icon: RefreshCcw, href: '/reevaluations', badge: '3' },
    { label: 'Blockchain Logs', icon: Shield, href: '/blockchain' },
  ],
  college_admin: [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'User Management', icon: Users, href: '/users' },
    { label: 'All Marks Cards', icon: FileText, href: '/cards' },
    { label: 'Verification', icon: QrCode, href: '/verify' },
    { label: 'Re-Evaluations', icon: RefreshCcw, href: '/reevaluations', badge: '5' },
    { label: 'Audit Logs', icon: Shield, href: '/audit' },
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
    { label: 'Blockchain History', icon: Shield, href: '/blockchain' },
  ],
  student: [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'My Marks Cards', icon: GraduationCap, href: '/my-cards' },
    { label: 'Re-Evaluation', icon: RefreshCcw, href: '/request-reevaluation' },
    { label: 'Verify Certificate', icon: QrCode, href: '/verify' },
  ],
};

export function Sidebar() {
  const { user, logout, connectWallet, disconnectWallet } = useAuth();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

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

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar gradient-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo & Branding */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-sidebar-primary to-accent flex items-center justify-center">
            <Shield className="h-6 w-6 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-sidebar-foreground text-sm">BlockCert</h1>
            <p className="text-[10px] text-sidebar-foreground/60">Academic Verification</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-sidebar-accent flex items-center justify-center">
            <span className="text-sm font-medium text-sidebar-accent-foreground">
              {user.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
            <Badge variant="role" className="mt-1 text-[10px]">
              {roleLabels[user.role]}
            </Badge>
          </div>
        </div>

        {/* Wallet Connection */}
        {(user.role !== 'student') && (
          <div className="mt-3">
            {user.walletConnected ? (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent text-xs"
                onClick={disconnectWallet}
              >
                <Wallet className="h-3.5 w-3.5 mr-2 text-success" />
                <span className="truncate font-mono text-[10px]">
                  {user.walletAddress?.slice(0, 6)}...{user.walletAddress?.slice(-4)}
                </span>
              </Button>
            ) : (
              <Button 
                variant="wallet" 
                size="sm" 
                className="w-full text-xs"
                onClick={connectWallet}
              >
                <Wallet className="h-3.5 w-3.5 mr-2" />
                Connect Wallet
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.label}>
              {item.children ? (
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
                          <Link
                            to={child.href}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                              isActive(child.href)
                                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                                : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                            )}
                          >
                            <child.icon className="h-4 w-4" />
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors",
                    isActive(item.href)
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </div>
                  {item.badge && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-sidebar-primary/20 text-sidebar-primary-foreground">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-sidebar-border space-y-1">
        <Link
          to="/notifications"
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
      </div>
    </aside>
  );
}
