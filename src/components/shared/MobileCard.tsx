import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

interface MobileCardProps {
  header: ReactNode;
  badges?: ReactNode;
  footer?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function MobileCard({
  header,
  badges,
  footer,
  actions,
  children,
  className,
}: MobileCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">{header}</div>
          {actions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">{actions}</DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        {badges && <div className="flex flex-wrap gap-2 mt-3">{badges}</div>}
        {children}
        {footer && <div className="mt-2">{footer}</div>}
      </CardContent>
    </Card>
  );
}
