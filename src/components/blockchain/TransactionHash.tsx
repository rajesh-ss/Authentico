import { Copy, ExternalLink, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface TransactionHashProps {
  hash: string;
  truncate?: boolean;
  showCopy?: boolean;
  showLink?: boolean;
  className?: string;
}

export function TransactionHash({ 
  hash, 
  truncate = true, 
  showCopy = true, 
  showLink = true,
  className 
}: TransactionHashProps) {
  const [copied, setCopied] = useState(false);

  const displayHash = truncate 
    ? `${hash.slice(0, 10)}...${hash.slice(-8)}`
    : hash;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <code className="hash-text bg-accent/5 px-2 py-1 rounded font-mono">
        {displayHash}
      </code>
      {showCopy && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7"
          onClick={handleCopy}
        >
          {copied ? (
            <CheckCheck className="h-3.5 w-3.5 text-success" />
          ) : (
            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </Button>
      )}
      {showLink && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7"
          onClick={() => window.open(`https://etherscan.io/tx/${hash}`, '_blank')}
        >
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      )}
    </div>
  );
}
