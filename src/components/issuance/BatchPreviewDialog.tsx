import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DataPreview } from './DataPreview';
import { useQuery } from '@tanstack/react-query';
import { uploadService } from '@/services/upload.service';
import { Loader2 } from 'lucide-react';
import { usePagination } from '@/hooks';
import { useMemo, useState, useEffect } from 'react';
import { StudentRecord } from '@/services/upload.service';

interface BatchPreviewDialogProps {
  uploadId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ROWS_PER_PAGE = 5;

export function BatchPreviewDialog({ uploadId, open, onOpenChange }: BatchPreviewDialogProps) {
  const [previewData, setPreviewData] = useState<StudentRecord[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['uploadPreview', uploadId],
    queryFn: () => {
      if (!uploadId) throw new Error('Upload ID is required');
      return uploadService.getUploadPreview(uploadId);
    },
    enabled: !!uploadId && open,
  });

  useEffect(() => {
    if (response?.success && response.data) {
      setPreviewData(response.data.previewData);

      // Extract headers from the first record's student object and top-level fields
      if (response.data.previewData.length > 0) {
        const firstRecord = response.data.previewData[0];
        // Flatten for display: show direct fields + student fields
        const studentKeys = Object.keys(firstRecord.student || {}).map((k) => `student.${k}`);
        const directKeys = Object.keys(firstRecord).filter(
          (k) =>
            k !== 'student' &&
            k !== 'subjects' &&
            k !== 'remarks' &&
            typeof firstRecord[k] !== 'object'
        );

        setHeaders([...directKeys, ...studentKeys]);
      }
    }
  }, [response]);

  // Pagination hook
  const pagination = usePagination({
    data: previewData,
    pageSize: ROWS_PER_PAGE,
  });

  const dialogContent = useMemo(() => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading batch data...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-destructive">
          <p>Failed to load batch data</p>
          <p className="text-sm mt-1">{(error as Error).message}</p>
        </div>
      );
    }

    if (previewData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <p>No records found in this batch</p>
        </div>
      );
    }

    return (
      <DataPreview
        headers={headers}
        paginatedData={pagination.paginatedData}
        totalRecords={previewData.length}
        estimatedTime={0} // Not needed for simple view
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        pageSize={pagination.pageSize}
        startIndex={pagination.startIndex}
        endIndex={pagination.endIndex}
        onNextPage={pagination.nextPage}
        onPrevPage={pagination.prevPage}
        canGoNext={pagination.canGoNext}
        canGoPrev={pagination.canGoPrev}
        onSubmit={() => onOpenChange(false)} // Just close on "Submit" or hide the button
        isSubmitting={false}
        batchCount={1}
        hideSubmit={true} // We might need to add this prop to DataPreview if not present, or just pass a no-op
      />
    );
  }, [isLoading, error, previewData, headers, pagination, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Batch Preview</DialogTitle>
          <DialogDescription>Viewing records for batch {uploadId}</DialogDescription>
        </DialogHeader>

        {dialogContent}
      </DialogContent>
    </Dialog>
  );
}
