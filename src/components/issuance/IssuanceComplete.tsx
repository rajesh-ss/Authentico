import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Download, 
  FileText, 
  Shield, 
  RotateCcw,
  ArrowRight,
  PartyPopper
} from 'lucide-react';
import { GeneratedCard, IssuanceSession } from '@/types/issuance';
import { Link } from 'react-router-dom';

interface IssuanceCompleteProps {
  generatedCards: GeneratedCard[];
  session: IssuanceSession | null;
  onReset: () => void;
}

export function IssuanceComplete({
  generatedCards,
  session,
  onReset,
}: IssuanceCompleteProps) {
  const confirmedCount = generatedCards.filter(c => c.blockchainStatus === 'confirmed').length;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">Issuance Complete!</h2>
        <p className="text-muted-foreground mt-1">
          All marks cards have been successfully issued and registered
        </p>
      </div>

      {/* Success Card */}
      <Card className="border-success/50 bg-gradient-to-br from-success/5 to-success/10">
        <CardContent className="py-12">
          <div className="text-center space-y-6">
            <div className="relative inline-block">
              <div className="h-24 w-24 mx-auto rounded-full bg-success/20 flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-success" />
              </div>
              <PartyPopper className="h-8 w-8 text-warning absolute -top-2 -right-2 animate-bounce" />
            </div>

            <div>
              <h3 className="text-3xl font-bold text-success">{confirmedCount}</h3>
              <p className="text-lg text-muted-foreground">
                Marks Cards Issued Successfully
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="p-4 rounded-lg bg-background/50">
                <FileText className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">{confirmedCount}</p>
                <p className="text-xs text-muted-foreground">Cards Generated</p>
              </div>
              <div className="p-4 rounded-lg bg-background/50">
                <Shield className="h-6 w-6 text-blockchain mx-auto mb-2" />
                <p className="text-2xl font-bold">{confirmedCount}</p>
                <p className="text-xs text-muted-foreground">Blockchain Verified</p>
              </div>
              <div className="p-4 rounded-lg bg-background/50">
                <CheckCircle className="h-6 w-6 text-success mx-auto mb-2" />
                <p className="text-2xl font-bold">{session?.successCount || 0}</p>
                <p className="text-xs text-muted-foreground">Successful</p>
              </div>
              <div className="p-4 rounded-lg bg-background/50">
                <Download className="h-6 w-6 text-info mx-auto mb-2" />
                <p className="text-2xl font-bold">Ready</p>
                <p className="text-xs text-muted-foreground">For Download</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Info */}
      {session && (
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Session ID</p>
                <p className="font-mono text-sm">{session.id}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Completed At</p>
                <p className="font-medium">
                  {session.completedAt?.toLocaleString()}
                </p>
              </div>
              <Badge variant="success">Completed</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button variant="outline" size="lg" className="w-full sm:w-auto">
          <Download className="h-5 w-5 mr-2" />
          Download All PDFs
        </Button>
        <Button variant="outline" size="lg" className="w-full sm:w-auto">
          <FileText className="h-5 w-5 mr-2" />
          Export Report
        </Button>
        <Button onClick={onReset} size="lg" className="w-full sm:w-auto">
          <RotateCcw className="h-5 w-5 mr-2" />
          Issue More Cards
        </Button>
      </div>

      <div className="text-center">
        <Link to="/dashboard">
          <Button variant="ghost">
            Back to Dashboard
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
