import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TransactionBadge } from '@/components/blockchain/TransactionBadge';
import {
  FileText,
  Upload,
  ArrowRight,
  Download,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { uploadService, CommittedUpload } from '@/services/upload.service';
import { toast } from 'sonner';

const quickActions = [
  {
    to: '/issue/template',
    icon: Upload,
    title: 'Issue New Cards',
    desc: 'Upload template & data',
    color: 'primary',
  },
  {
    to: '/generation-status',
    icon: FileText,
    title: 'View All Batches',
    desc: 'View generation history',
    color: 'success',
  },
];

export default function IssuerDashboard() {
  const [uploads, setUploads] = useState<CommittedUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUploads = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await uploadService.getUploadsByStatus('COMMITTED');
        if (response.success) {
          setUploads(response.data);
        } else {
          setError(response.message || 'Failed to fetch uploads');
        }
      } catch (err) {
        setError('Failed to fetch committed uploads. Please try again.');
        console.error('Error fetching uploads:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUploads();
  }, []);

  const handleDownload = async (uploadId: string) => {
    try {
      setDownloadingId(uploadId);
      await uploadService.downloadMarksheets(uploadId);
      toast.success('Marksheets downloaded successfully');
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Failed to download marksheets. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <DashboardLayout title="Dashboard" subtitle="Welcome back, Issuer">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-6">
        {quickActions.map((action) => (
          <Link key={action.to} to={action.to}>
            <Card className="group hover:border-primary/50 transition-colors">
              <CardContent className="p-5 flex items-center gap-4">
                <div
                  className={`h-12 w-12 rounded-lg bg-${action.color}/10 flex items-center justify-center group-hover:bg-${action.color}/20 transition-colors`}
                >
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

      {/* Committed Uploads */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold">Committed Uploads</CardTitle>
          <Badge variant="secondary">{uploads.length} total</Badge>
        </CardHeader>
        <CardContent className="pt-0">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
              <span className="text-muted-foreground">Loading uploads...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-12 text-destructive">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && uploads.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No committed uploads yet</p>
              <Button variant="link" asChild className="mt-2">
                <Link to="/issue/template">Issue your first batch</Link>
              </Button>
            </div>
          )}

          {!loading && !error && uploads.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {uploads.map((upload) => (
                <div
                  key={upload._id}
                  className="p-4 rounded-lg border border-border hover:border-muted-foreground/30 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">
                          Upload — {upload.passYear}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(upload.createdAt), 'dd MMM yyyy, HH:mm')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 ml-7 sm:ml-0">
                      <Badge variant="success">Committed</Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(upload.uploadId)}
                        disabled={downloadingId === upload.uploadId}
                      >
                        {downloadingId === upload.uploadId ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <Download className="h-4 w-4 mr-1" />
                        )}
                        Download
                      </Button>
                    </div>
                  </div>

                  {/* Summary info */}
                  <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" />
                      {upload.totalRecords} records
                    </span>
                    {upload.fabricTxId && <TransactionBadge status="confirmed" size="sm" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
