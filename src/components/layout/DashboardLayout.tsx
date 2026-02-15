import { ReactNode, useState, useEffect, useCallback } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const SIDEBAR_COLLAPSED_KEY = 'sidebar-collapsed';

export function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const stored = sessionStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    return stored === 'true';
  });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    sessionStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(isCollapsed));
  }, [isCollapsed]);

  const handleToggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
    setIsHovering(false);
  }, []);

  const handleHoverChange = useCallback(
    (hovering: boolean) => {
      // Only allow hover expansion on desktop and when collapsed
      if (window.innerWidth >= 1024 && isCollapsed) {
        setIsHovering(hovering);
      }
    },
    [isCollapsed]
  );

  // No changes needed here, just fixing the lint by removing the line if unused or acknowledging it.
  // Actually, I'll just remove the declaration since it's not used in the JSX below.
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
          isHovering={isHovering}
          onHoverChange={handleHoverChange}
        />

        {/* Main content - only responds to collapse state, not hover */}
        <div className={cn('transition-all duration-300', isCollapsed ? 'lg:ml-16' : 'lg:ml-64')}>
          <Header title={title} subtitle={subtitle} onMenuClick={() => setSidebarOpen(true)} />
          <main className="p-4 md:p-6">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  );
}
