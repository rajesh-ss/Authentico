import { useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export default function IssuanceFlow() {
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [rawData, setRawData] = useState<Record<string, unknown>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpload = useCallback(async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet);
      const extractedHeaders = Object.keys(jsonData[0] || {});

      setExcelFile(file);
      setRawData(jsonData as Record<string, unknown>[]);
      setHeaders(extractedHeaders);
      setParseError(null);
      toast.success(`Successfully loaded ${jsonData.length} records`);
    } catch {
      setParseError('Failed to parse the file. Please check the format.');
      toast.error('Failed to parse Excel file');
    }
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      setParseError(null);
      const file = e.dataTransfer.files[0];
      if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv'))) {
        await handleUpload(file);
      }
    },
    [handleUpload]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      setParseError(null);
      const file = e.target.files?.[0];
      if (file) {
        await handleUpload(file);
      }
    },
    [handleUpload]
  );

  const handleSubmit = useCallback(async () => {
    if (!excelFile || rawData.length === 0) return;
    
    setIsSubmitting(true);
    try {
      // Simulate submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(`Successfully submitted ${rawData.length} marks cards for processing`);
      
      // Reset form
      setExcelFile(null);
      setRawData([]);
      setHeaders([]);
    } catch {
      toast.error('Failed to submit marks cards');
    } finally {
      setIsSubmitting(false);
    }
  }, [excelFile, rawData]);

  const handleReset = useCallback(() => {
    setExcelFile(null);
    setRawData([]);
    setHeaders([]);
    setParseError(null);
  }, []);

  return (
    <DashboardLayout
      title="Issue Marks Cards"
      subtitle="Upload student data to generate and issue marks cards"
    >
      <div className="space-y-6">
        {/* Upload Area */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upload Student Data</CardTitle>
            <CardDescription>Upload an Excel file (.xlsx, .xls) or CSV file containing student marks</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-all",
                isDragOver
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50",
                excelFile && !parseError && "border-success bg-success/5",
                parseError && "border-destructive bg-destructive/5"
              )}
            >
              {excelFile && !parseError ? (
                <div className="space-y-4">
                  <div className="h-16 w-16 mx-auto rounded-full bg-success/10 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-success" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{excelFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {rawData.length} records found • {headers.length} columns
                    </p>
                  </div>
                  <label className="cursor-pointer inline-block">
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    <Button variant="outline" size="sm" asChild>
                      <span>Upload Different File</span>
                    </Button>
                  </label>
                </div>
              ) : parseError ? (
                <div className="space-y-4">
                  <div className="h-16 w-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                  </div>
                  <div>
                    <p className="font-medium text-destructive">{parseError}</p>
                    <p className="text-sm text-muted-foreground">
                      Please try again with a valid Excel file
                    </p>
                  </div>
                  <label className="cursor-pointer inline-block">
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    <Button variant="outline" size="sm" asChild>
                      <span>Try Again</span>
                    </Button>
                  </label>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="h-16 w-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      Drop your Excel file here
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Supports .xlsx, .xls, and .csv formats
                    </p>
                  </div>
                  <label className="cursor-pointer inline-block">
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    <Button variant="outline" asChild>
                      <span>
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Browse Files
                      </span>
                    </Button>
                  </label>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Data Preview */}
        {rawData.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Data Preview</CardTitle>
                  <CardDescription>
                    Showing first 10 of {rawData.length} records
                  </CardDescription>
                </div>
                <Badge variant="success">{rawData.length} Records</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="w-full">
                <div className="min-w-max">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        {headers.slice(0, 8).map((header) => (
                          <TableHead key={header} className="whitespace-nowrap">
                            {header}
                          </TableHead>
                        ))}
                        {headers.length > 8 && (
                          <TableHead className="text-muted-foreground">
                            +{headers.length - 8} more
                          </TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rawData.slice(0, 10).map((row, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono text-muted-foreground">
                            {index + 1}
                          </TableCell>
                          {headers.slice(0, 8).map((header) => (
                            <TableCell key={header} className="whitespace-nowrap">
                              {String(row[header] || '-')}
                            </TableCell>
                          ))}
                          {headers.length > 8 && (
                            <TableCell className="text-muted-foreground">...</TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        {rawData.length > 0 && (
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleReset} disabled={isSubmitting}>
              Clear
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                'Submitting...'
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit {rawData.length} Marks Cards
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
