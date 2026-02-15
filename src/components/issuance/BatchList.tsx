import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Eye, FileText, CheckCircle } from 'lucide-react';
import { UploadBatch } from '@/services/upload.service';

interface BatchListProps {
  batches: UploadBatch[];
  onViewBatch: (batchId: string) => void;
  onIssueAll: () => void;
  isIssuing: boolean;
}

export function BatchList({ batches, onViewBatch, onIssueAll, isIssuing }: BatchListProps) {
  const totalRecords = batches.reduce((sum, batch) => sum + batch.count, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Batches Ready for Issuance</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {batches.length} batch{batches.length !== 1 ? 'es' : ''} • {totalRecords} total records
          </p>
        </div>
        <Button onClick={onIssueAll} disabled={isIssuing || batches.length === 0}>
          {isIssuing ? 'Starting Issuance...' : 'Issue All Batches'}
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Batch ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Records</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {batches.map((batch, index) => (
              <TableRow key={batch.uploadId}>
                <TableCell className="font-medium">
                  {/* Provide a user-friendly batch name if possible, or just the index/ID */}
                  Batch #{index + 1}
                  <span className="block text-xs text-muted-foreground font-normal truncate max-w-[200px]">
                    {batch.uploadId}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm">Ready</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className="inline-flex items-center gap-1">
                    <FileText className="h-3 w-3 text-muted-foreground" />
                    {batch.count}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => onViewBatch(batch.uploadId)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
