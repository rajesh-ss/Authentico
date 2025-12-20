import { MarksCard } from '@/types/blockchain';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TransactionBadge } from '@/components/blockchain/TransactionBadge';
import { Eye, Download, Shield, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from 'date-fns';

interface RecentMarksCardsProps {
  cards: MarksCard[];
}

const statusBadgeVariant = {
  issued: 'issued' as const,
  reevaluated: 'reevaluated' as const,
  superseded: 'superseded' as const,
  pending_verification: 'pending' as const,
};

export function RecentMarksCards({ cards }: RecentMarksCardsProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Reg. No</TableHead>
            <TableHead>Semester</TableHead>
            <TableHead>Version</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Blockchain</TableHead>
            <TableHead>Issued</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cards.map((card) => (
            <TableRow key={card.id} className="group">
              <TableCell className="font-medium">{card.studentName}</TableCell>
              <TableCell className="font-mono text-sm">{card.registrationNumber}</TableCell>
              <TableCell>{card.semester}</TableCell>
              <TableCell>
                <Badge variant="outline" className="font-mono">
                  v{card.version}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={statusBadgeVariant[card.status]}>
                  {card.status.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell>
                <TransactionBadge status={card.blockchain.status} size="sm" />
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {format(card.issuedAt, 'MMM d, yyyy')}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Shield className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Download PDF</DropdownMenuItem>
                      <DropdownMenuItem>View Blockchain Proof</DropdownMenuItem>
                      <DropdownMenuItem>Version History</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
