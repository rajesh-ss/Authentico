import { MultiSignatureApproval, VerificationSignature } from '@/types/blockchain';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TransactionHash } from '@/components/blockchain/TransactionHash';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CheckCircle2, Clock, Shield, Pen } from 'lucide-react';

interface SignatureProgressProps {
  approval: MultiSignatureApproval;
  onSign?: () => void;
  canSign?: boolean;
}

export function SignatureProgress({ approval, onSign, canSign = false }: SignatureProgressProps) {
  const { requiredSignatures, currentSignatures, status } = approval;
  const remainingSignatures = requiredSignatures - currentSignatures.length;
  const progressPercent = (currentSignatures.length / requiredSignatures) * 100;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-accent" />
          <h3 className="font-semibold text-foreground">Multi-Signature Approval</h3>
        </div>
        <Badge variant={status === 'approved' ? 'success' : status === 'rejected' ? 'failed' : 'pending'}>
          {status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : `${currentSignatures.length} of ${requiredSignatures}`}
        </Badge>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Signature Progress</span>
          <span className="font-medium text-foreground">
            {currentSignatures.length}/{requiredSignatures} signatures
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full transition-all duration-500 rounded-full",
              status === 'approved' ? "bg-success" : "bg-accent"
            )}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        {remainingSignatures > 0 && status !== 'approved' && (
          <p className="text-xs text-muted-foreground mt-2">
            {remainingSignatures} more signature{remainingSignatures > 1 ? 's' : ''} required
          </p>
        )}
      </div>

      {/* Signatures list */}
      <div className="space-y-3">
        {currentSignatures.map((sig, index) => (
          <div 
            key={sig.adminId}
            className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
          >
            <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-success" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm text-foreground">{sig.adminName}</p>
                <span className="text-xs text-muted-foreground">
                  {format(sig.timestamp, 'MMM d, h:mm a')}
                </span>
              </div>
              <TransactionHash 
                hash={sig.transactionHash} 
                className="mt-1"
                showLink={false}
              />
            </div>
          </div>
        ))}

        {/* Pending signature slots */}
        {Array.from({ length: remainingSignatures }).map((_, index) => (
          <div 
            key={`pending-${index}`}
            className="flex items-center gap-3 p-3 border border-dashed border-border rounded-lg"
          >
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Awaiting signature...</p>
          </div>
        ))}
      </div>

      {/* Sign button */}
      {canSign && status === 'pending' && (
        <Button 
          variant="blockchain" 
          className="w-full mt-4"
          onClick={onSign}
        >
          <Pen className="h-4 w-4 mr-2" />
          Add Your Signature
        </Button>
      )}
    </Card>
  );
}
