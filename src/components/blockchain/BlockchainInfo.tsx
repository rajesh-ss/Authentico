import { BlockchainTransaction } from '@/types/blockchain';
import { TransactionBadge } from './TransactionBadge';
import { TransactionHash } from './TransactionHash';
import { Clock, Hash, Fuel } from 'lucide-react';
import { format } from 'date-fns';

interface BlockchainInfoProps {
  transaction: BlockchainTransaction;
  compact?: boolean;
}

export function BlockchainInfo({ transaction, compact = false }: BlockchainInfoProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <TransactionBadge status={transaction.status} size="sm" />
        <TransactionHash hash={transaction.hash} showLink={false} />
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Blockchain Record</span>
        <TransactionBadge status={transaction.status} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Hash className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Transaction:</span>
          <TransactionHash hash={transaction.hash} />
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Timestamp:</span>
          <span className="text-foreground">
            {format(transaction.timestamp, 'PPpp')}
          </span>
        </div>

        {transaction.gasUsed && (
          <div className="flex items-center gap-2 text-sm">
            <Fuel className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Gas Used:</span>
            <span className="text-foreground">{transaction.gasUsed}</span>
          </div>
        )}

        {transaction.blockNumber && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground ml-6">Block:</span>
            <span className="text-foreground font-mono">#{transaction.blockNumber}</span>
          </div>
        )}
      </div>
    </div>
  );
}
