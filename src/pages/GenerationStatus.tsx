import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BatchPreviewDialog } from '@/components/issuance/BatchPreviewDialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { TransactionBadge } from '@/components/blockchain/TransactionBadge';
import {
  Loader2,
  CheckCircle2,
  FileText,
  Layers,
  ArrowRight,
  Search,
  X,
  Download,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { uploadService, CommittedUpload } from '@/services/upload.service';
import { toast } from 'sonner';

export default function GenerationStatus() {
  const navigate = useNavigate();

  const [uploads, setUploads] = useState<CommittedUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Preview dialog state
  const [previewUploadId, setPreviewUploadId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

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

  const handlePreview = (uploadId: string) => {
    setPreviewUploadId(uploadId);
    setPreviewOpen(true);
  };

  // Filter uploads based on search
  const filteredUploads = useMemo(() => {
    if (!searchQuery) return uploads;
    const query = searchQuery.toLowerCase();
    return uploads.filter(
      (u) =>
        u.uploadId.toLowerCase().includes(query) ||
        u.passYear.toString().includes(query) ||
        u.fabricTxId?.toLowerCase().includes(query)
    );
  }, [uploads, searchQuery]);

  // Stats
  const totalRecords = uploads.reduce((sum, u) => sum + u.totalRecords, 0);
  const hasActiveFilter = searchQuery !== '';

  return (
    <DashboardLayout
      title="Committed Batches"
      subtitle="View and download committed marksheet batches"
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <StatCard
            icon={<CheckCircle2 className="h-5 w-5 text-success" />}
            value={uploads.length}
            label="Committed Batches"
            bgClass="bg-success/10"
          />
          <StatCard
            icon={<Layers className="h-5 w-5 text-primary" />}
            value={totalRecords}
            label="Total Records"
            bgClass="bg-primary/10"
          />
          <StatCard
            icon={<FileText className="h-5 w-5 text-muted-foreground" />}
            value={filteredUploads.length}
            label={hasActiveFilter ? 'Filtered Results' : 'Showing All'}
            bgClass="bg-muted"
          />
        </div>

        {/* Batches List */}
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-lg">All Committed Batches</CardTitle>
                <CardDescription>
                  {hasActiveFilter
                    ? `Showing ${filteredUploads.length} of ${uploads.length} batches`
                    : 'All committed marksheet batches'}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/issue/template')}
                className="gap-2"
              >
                New Upload <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Search */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by upload ID, pass year, or transaction ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              {hasActiveFilter && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchQuery('')}
                  className="shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent>
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                <span className="text-muted-foreground">Loading batches...</span>
              </div>
            )}

            {error && (
              <div className="flex items-center justify-center py-12 text-destructive">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span>{error}</span>
              </div>
            )}

            {!loading && !error && filteredUploads.length === 0 && (
              <EmptyState
                hasFilters={hasActiveFilter}
                onClearFilters={() => setSearchQuery('')}
                onNavigate={() => navigate('/issue/template')}
              />
            )}

            {!loading && !error && filteredUploads.length > 0 && (
              <ScrollArea className="h-[600px] pr-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {filteredUploads.map((upload) => (
                    <div
                      key={upload._id}
                      className="p-4 rounded-lg border border-border hover:border-muted-foreground/30 transition-colors"
                    >
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">
                              Upload — {upload.passYear}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(upload.createdAt), 'dd MMM yyyy, HH:mm')}
                            </p>
                          </div>
                        </div>
                        <Badge variant="success">Committed</Badge>
                      </div>

                      {/* Info */}
                      <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <FileText className="h-3.5 w-3.5" />
                          {upload.totalRecords} records
                        </span>
                        {upload.fabricTxId && <TransactionBadge status="confirmed" size="sm" />}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePreview(upload.uploadId)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
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
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Preview Dialog */}
        <BatchPreviewDialog
          uploadId={previewUploadId}
          open={previewOpen}
          onOpenChange={setPreviewOpen}
        />
      </div>
    </DashboardLayout>
  );
}

// --- Sub-components ---

function StatCard({
  icon,
  value,
  label,
  bgClass,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  bgClass: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className={cn('h-10 w-10 rounded-full flex items-center justify-center', bgClass)}>
            {icon}
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({
  hasFilters,
  onClearFilters,
  onNavigate,
}: {
  hasFilters: boolean;
  onClearFilters: () => void;
  onNavigate: () => void;
}) {
  return (
    <div className="text-center py-12">
      <div className="h-16 w-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
        <FileText className="h-8 w-8 text-muted-foreground" />
      </div>
      {hasFilters ? (
        <>
          <h3 className="font-medium text-lg mb-1">No matching batches</h3>
          <p className="text-muted-foreground text-sm mb-4">Try adjusting your search</p>
          <Button variant="outline" onClick={onClearFilters} className="gap-2">
            <X className="h-4 w-4" /> Clear Search
          </Button>
        </>
      ) : (
        <>
          <h3 className="font-medium text-lg mb-1">No committed batches yet</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Upload student data and commit to see batches here
          </p>
          <Button onClick={onNavigate} className="gap-2">
            Upload Data <ArrowRight className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
}
