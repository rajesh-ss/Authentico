import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExcelUploadProps {
  excelFile: File | null;
  rawData: Record<string, unknown>[];
  headers: string[];
  onUpload: (file: File) => Promise<{ data: unknown[]; headers: string[] }>;
  onNext: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function ExcelUpload({
  excelFile,
  rawData,
  headers,
  onUpload,
  onNext,
  onBack,
  isLoading,
}: ExcelUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      setParseError(null);
      const file = e.dataTransfer.files[0];
      if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv'))) {
        try {
          await onUpload(file);
        } catch {
          setParseError('Failed to parse the file. Please check the format.');
        }
      }
    },
    [onUpload]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      setParseError(null);
      const file = e.target.files?.[0];
      if (file) {
        try {
          await onUpload(file);
        } catch {
          setParseError('Failed to parse the file. Please check the format.');
        }
      }
    },
    [onUpload]
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Upload Student Data</h2>
        <p className="text-muted-foreground mt-1">
          Upload an Excel file containing student marks data
        </p>
      </div>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Excel File</CardTitle>
          <CardDescription>Upload .xlsx, .xls, or .csv file</CardDescription>
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
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={onNext} disabled={!excelFile || rawData.length === 0 || isLoading}>
          Continue to Field Mapping
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
