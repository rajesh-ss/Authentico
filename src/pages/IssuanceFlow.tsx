import { useState, useCallback, useEffect, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Send, GraduationCap, Award, Calendar, Hash, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { useGeneration } from '@/contexts/GenerationContext';

// Sample template data for preview
const sampleTemplate = {
  studentName: 'John Doe',
  registrationNo: 'REG2024001',
  semester: 'Semester 6',
  academicYear: '2023-2024',
  subjects: [
    { code: 'CS601', name: 'Machine Learning', credits: 4, internal: 28, external: 56, total: 84, grade: 'A' },
    { code: 'CS602', name: 'Cloud Computing', credits: 4, internal: 26, external: 52, total: 78, grade: 'B+' },
    { code: 'CS603', name: 'Data Mining', credits: 3, internal: 24, external: 48, total: 72, grade: 'B' },
    { code: 'CS604', name: 'Cyber Security', credits: 3, internal: 27, external: 54, total: 81, grade: 'A' },
  ],
  totalMarks: 315,
  percentage: 78.75,
  grade: 'First Class with Distinction',
};

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

  const { startGeneration, updateProgress, completeJob, failJob } = useGeneration();
  const generationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (generationIntervalRef.current) {
        clearInterval(generationIntervalRef.current);
      }
    };
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!excelFile || rawData.length === 0) return;
    
    setIsSubmitting(true);
    const totalCards = rawData.length;
    const fileName = excelFile.name;
    
    // Start generation job
    const jobId = startGeneration(fileName, totalCards);
    
    // Clear file data immediately
    setExcelFile(null);
    setRawData([]);
    setHeaders([]);
    setIsSubmitting(false);
    
    // Simulate generation progress
    let generated = 0;
    const interval = setInterval(() => {
      generated += Math.ceil(Math.random() * 3) + 1;
      if (generated >= totalCards) {
        generated = totalCards;
        updateProgress(jobId, generated);
        clearInterval(interval);
        generationIntervalRef.current = null;
        
        // Random chance of failure for demo
        if (Math.random() > 0.9) {
          failJob(jobId, 'Network error during blockchain verification');
          toast.error('Generation failed. Please try again.');
        } else {
          completeJob(jobId);
          toast.success(`Successfully generated ${totalCards} marks cards`);
        }
      } else {
        updateProgress(jobId, generated);
      }
    }, 200);
    
    generationIntervalRef.current = interval;
  }, [excelFile, rawData, startGeneration, updateProgress, completeJob, failJob]);

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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:h-[calc(100vh-12rem)]">
        {/* Left: Marks Card Template Preview - Fixed height, no scroll */}
        <Card className="lg:overflow-hidden lg:h-full flex flex-col">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Marks Card Template
                </CardTitle>
                <CardDescription>Preview of the generated marks card</CardDescription>
              </div>
              <Badge variant="outline">Sample</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <div className="border rounded-lg p-6 bg-gradient-to-br from-background to-muted/30 space-y-6 h-full overflow-auto">
              {/* Header */}
              <div className="text-center space-y-2 pb-4 border-b border-dashed">
                <div className="flex justify-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="font-bold text-lg text-foreground">University of Technology</h3>
                <p className="text-sm text-muted-foreground">Statement of Marks</p>
              </div>

              {/* Student Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground flex items-center gap-1">
                    <GraduationCap className="h-3.5 w-3.5" />
                    Student Name
                  </p>
                  <p className="font-medium">{sampleTemplate.studentName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground flex items-center gap-1">
                    <Hash className="h-3.5 w-3.5" />
                    Registration No
                  </p>
                  <p className="font-medium font-mono">{sampleTemplate.registrationNo}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    Semester
                  </p>
                  <p className="font-medium">{sampleTemplate.semester}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Academic Year
                  </p>
                  <p className="font-medium">{sampleTemplate.academicYear}</p>
                </div>
              </div>

              <Separator />

              {/* Subjects Table */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Subject-wise Marks</p>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-xs h-8">Subject</TableHead>
                        <TableHead className="text-xs text-center h-8">Int</TableHead>
                        <TableHead className="text-xs text-center h-8">Ext</TableHead>
                        <TableHead className="text-xs text-center h-8">Total</TableHead>
                        <TableHead className="text-xs text-center h-8">Grade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sampleTemplate.subjects.map((subject) => (
                        <TableRow key={subject.code} className="text-xs">
                          <TableCell className="py-2">
                            <div>
                              <p className="font-medium">{subject.name}</p>
                              <p className="text-muted-foreground">{subject.code}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-center py-2">{subject.internal}</TableCell>
                          <TableCell className="text-center py-2">{subject.external}</TableCell>
                          <TableCell className="text-center py-2 font-medium">{subject.total}</TableCell>
                          <TableCell className="text-center py-2">
                            <Badge variant="outline" className="text-xs">
                              {subject.grade}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-primary/5 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Total Marks</span>
                  <span className="font-bold">{sampleTemplate.totalMarks}/400</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Percentage</span>
                  <span className="font-bold">{sampleTemplate.percentage}%</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Result</span>
                  <Badge variant="success">{sampleTemplate.grade}</Badge>
                </div>
              </div>

              {/* QR Code Placeholder */}
              <div className="flex items-center justify-center pt-2">
                <div className="text-center space-y-2">
                  <div className="h-16 w-16 mx-auto border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/50">
                    <span className="text-xs text-muted-foreground">QR Code</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Blockchain Verified</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right: Upload Section - Scrollable */}
        <div className="space-y-6 lg:overflow-y-auto lg:h-full lg:pr-2">
          {/* Upload Area */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                Upload Student Data
              </CardTitle>
              <CardDescription>
                Upload an Excel file (.xlsx, .xls) or CSV file containing student marks
              </CardDescription>
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
                    <div className="h-14 w-14 mx-auto rounded-full bg-success/10 flex items-center justify-center">
                      <CheckCircle className="h-7 w-7 text-success" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{excelFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {rawData.length} records • {headers.length} columns
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
                        <span>Change File</span>
                      </Button>
                    </label>
                  </div>
                ) : parseError ? (
                  <div className="space-y-4">
                    <div className="h-14 w-14 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                      <AlertCircle className="h-7 w-7 text-destructive" />
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
                    <div className="h-14 w-14 mx-auto rounded-full bg-muted flex items-center justify-center">
                      <Upload className="h-7 w-7 text-muted-foreground" />
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
                          {headers.slice(0, 6).map((header) => (
                            <TableHead key={header} className="whitespace-nowrap">
                              {header}
                            </TableHead>
                          ))}
                          {headers.length > 6 && (
                            <TableHead className="text-muted-foreground">
                              +{headers.length - 6} more
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
                            {headers.slice(0, 6).map((header) => (
                              <TableCell key={header} className="whitespace-nowrap">
                                {String(row[header] || '-')}
                              </TableCell>
                            ))}
                            {headers.length > 6 && (
                              <TableCell className="text-muted-foreground">...</TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </ScrollArea>

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                  <Button variant="outline" onClick={handleReset} disabled={isSubmitting}>
                    Clear
                  </Button>
                  <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? (
                      'Submitting...'
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Issue {rawData.length} Cards
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
