import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TransactionBadge } from '@/components/blockchain/TransactionBadge';
import { FileText, Upload, ArrowRight, Eye, Download, MoreHorizontal, Loader2, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useGeneration, GenerationJob } from '@/contexts/GenerationContext';

const quickActions = [
  { to: '/issue/template', icon: Upload, title: 'Issue New Cards', desc: 'Upload template & data', color: 'primary' },
  { to: '/generation-status', icon: FileText, title: 'View All Batches', desc: 'View generation history', color: 'success' },
];

// Mock recent batches for display
const mockRecentBatches: GenerationJob[] = [
  {
    id: 'batch-001',
    fileName: 'CS_Semester6_2024_Batch1',
    totalCards: 2500,
    generatedCards: 2500,
    status: 'completed',
    startedAt: new Date(Date.now() - 86400000),
    completedAt: new Date(Date.now() - 86000000),
    transactionId: 'TXN-M4K8J2-XYZ123AB',
    batchNumber: 1,
    totalBatches: 3,
    parentFileName: 'CS_Semester6_2024.xlsx',
  },
  {
    id: 'batch-002',
    fileName: 'ME_Semester4_2024_Batch1',
    totalCards: 1800,
    generatedCards: 1800,
    status: 'completed',
    startedAt: new Date(Date.now() - 172800000),
    completedAt: new Date(Date.now() - 172000000),
    transactionId: 'TXN-L3J7H1-DEF456GH',
    batchNumber: 1,
    totalBatches: 1,
    parentFileName: 'ME_Semester4_2024.xlsx',
  },
  {
    id: 'batch-003',
    fileName: 'ECE_Semester8_2024_Batch1',
    totalCards: 2200,
    generatedCards: 2200,
    status: 'completed',
    startedAt: new Date(Date.now() - 259200000),
    completedAt: new Date(Date.now() - 258000000),
    transactionId: 'TXN-K2I6G0-JKL789MN',
    batchNumber: 1,
    totalBatches: 2,
    parentFileName: 'ECE_Semester8_2024.xlsx',
  },
];

const getStatusIcon = (status: GenerationJob['status']) => {
  switch (status) {
    case 'in_progress':
      return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-success" />;
    case 'failed':
      return <XCircle className="h-4 w-4 text-destructive" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
};

const getStatusBadge = (status: GenerationJob['status']) => {
  switch (status) {
    case 'in_progress':
      return <Badge variant="default">Generating</Badge>;
    case 'completed':
      return <Badge variant="success">Completed</Badge>;
    case 'failed':
      return <Badge variant="destructive">Failed</Badge>;
    default:
      return <Badge variant="secondary">Pending</Badge>;
  }
};

export default function IssuerDashboard() {
  const { jobs, activeJob } = useGeneration();
  const navigate = useNavigate();
  
  // Combine active job with mock batches, prioritizing real jobs
  const recentBatches = activeJob 
    ? [activeJob, ...jobs.filter(j => j.id !== activeJob.id && j.status === 'completed').slice(0, 2), ...mockRecentBatches.slice(0, 3 - jobs.filter(j => j.status === 'completed').length)]
    : [...jobs.filter(j => j.status === 'completed').slice(0, 3), ...mockRecentBatches].slice(0, 4);

  return (
    <DashboardLayout title="Dashboard" subtitle="Welcome back, Dr. Sarah Johnson">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {quickActions.map((action) => (
          <Link key={action.to} to={action.to}>
            <Card className="group hover:border-primary/50 transition-colors">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`h-12 w-12 rounded-lg bg-${action.color}/10 flex items-center justify-center group-hover:bg-${action.color}/20 transition-colors`}>
                  <action.icon className={`h-6 w-6 text-${action.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">{action.desc}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Marks Card Batches */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold">Recent Marks Card Batches</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/generation-status">View All<ArrowRight className="h-4 w-4 ml-1" /></Link>
          </Button>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentBatches.map((batch) => (
              <div 
                key={batch.id} 
                className={`p-4 rounded-lg border transition-colors ${
                  batch.status === 'in_progress' 
                    ? 'border-primary/50 bg-primary/5' 
                    : 'border-border hover:border-muted-foreground/30'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(batch.status)}
                    <div>
                      <p className="font-medium text-foreground">{batch.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {batch.status === 'in_progress' 
                          ? `Started ${format(batch.startedAt, 'dd MMM yyyy, HH:mm')}`
                          : batch.completedAt 
                            ? `Completed ${format(batch.completedAt, 'dd MMM yyyy, HH:mm')}`
                            : format(batch.startedAt, 'dd MMM yyyy, HH:mm')
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(batch.status)}
                    {batch.status === 'completed' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/batch/${batch.id}`)}>
                            <Eye className="h-4 w-4 mr-2" />View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />Download
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
                
                {/* Progress bar for active generation */}
                {batch.status === 'in_progress' && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Generating marks cards...</span>
                      <span>{batch.generatedCards} / {batch.totalCards} cards</span>
                    </div>
                    <Progress 
                      value={(batch.generatedCards / batch.totalCards) * 100} 
                      className="h-2"
                    />
                  </div>
                )}
                
                {/* Summary for completed batches */}
                {batch.status === 'completed' && (
                  <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" />
                      {batch.totalCards} cards
                    </span>
                    <TransactionBadge status="confirmed" size="sm" />
                  </div>
                )}
              </div>
            ))}
            
            {recentBatches.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No marks card batches yet</p>
                <Button variant="link" asChild className="mt-2">
                  <Link to="/issue/template">Issue your first batch</Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}