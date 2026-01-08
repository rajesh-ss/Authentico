import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Users, Columns, Sparkles, Loader2, Send, Package } from 'lucide-react';

interface DataPreviewProps {
  headers: string[];
  paginatedData: Record<string, unknown>[];
  totalRecords: number;
  estimatedTime: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  startIndex: number;
  endIndex: number;
  onNextPage: () => void;
  onPrevPage: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  onSubmit: () => void;
  isSubmitting: boolean;
  batchCount?: number;
}

export const DataPreview = React.memo(function DataPreview({
  headers,
  paginatedData,
  totalRecords,
  estimatedTime,
  currentPage,
  totalPages,
  pageSize,
  startIndex,
  endIndex,
  onNextPage,
  onPrevPage,
  canGoNext,
  canGoPrev,
  onSubmit,
  isSubmitting,
  batchCount,
}: DataPreviewProps) {
  return (
    <Card className="animate-in slide-in-from-bottom-4 duration-300">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Eye className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Data Preview</CardTitle>
              <CardDescription>Review your data before issuing</CardDescription>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-1.5">
              <Users className="h-3 w-3" />
              {totalRecords.toLocaleString()} Records
            </Badge>
            <Badge variant="outline" className="gap-1.5">
              <Columns className="h-3 w-3" />
              {headers.length} Columns
            </Badge>
            {batchCount && batchCount > 1 && (
              <Badge variant="default" className="gap-1.5">
                <Package className="h-3 w-3" />
                {batchCount} Batches
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Column Headers Preview */}
        <div className="flex flex-wrap gap-1.5">
          {headers.map((header) => (
            <Badge key={header} variant="outline" className="text-xs font-normal">
              {header}
            </Badge>
          ))}
        </div>

        {/* Data Table */}
        <ScrollArea className="w-full rounded-lg border">
          <div className="min-w-max">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-14 text-center">#</TableHead>
                  {headers.slice(0, 5).map((header) => (
                    <TableHead key={header} className="whitespace-nowrap font-medium">
                      {header}
                    </TableHead>
                  ))}
                  {headers.length > 5 && (
                    <TableHead className="text-muted-foreground text-center">
                      +{headers.length - 5} more
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((row, index) => (
                  <TableRow key={index} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-xs text-center text-muted-foreground">
                      {startIndex + index}
                    </TableCell>
                    {headers.slice(0, 5).map((header) => (
                      <TableCell key={header} className="whitespace-nowrap max-w-[200px] truncate">
                        {String(row[header] ?? '-')}
                      </TableCell>
                    ))}
                    {headers.length > 5 && (
                      <TableCell className="text-muted-foreground text-center">...</TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {startIndex}-{endIndex} of {totalRecords}
            </p>
            <div className="flex gap-1">
              <Button 
                variant="outline" 
                size="sm"
                onClick={onPrevPage}
                disabled={!canGoPrev}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={onNextPage}
                disabled={!canGoNext}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        <Separator />

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Estimated generation time: ~{estimatedTime} seconds</span>
          </div>
          <Button 
            size="lg"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="gap-2 min-w-[180px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Generate {batchCount && batchCount > 1 ? `${batchCount} Batches` : `${totalRecords.toLocaleString()} Cards`}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});
