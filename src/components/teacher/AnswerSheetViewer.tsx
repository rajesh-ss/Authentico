import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SubjectMarksBreakdown } from '@/data/mockAnswerSheets';
import { FileText, ZoomIn, ZoomOut, RotateCw, Download, ChevronLeft, ChevronRight } from 'lucide-react';

interface AnswerSheetViewerProps {
  subjects: SubjectMarksBreakdown[];
}

export function AnswerSheetViewer({ subjects }: AnswerSheetViewerProps) {
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.subjectCode || '');
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 8; // Mock total pages

  const subject = subjects.find(s => s.subjectCode === selectedSubject);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Answer Sheet</CardTitle>
          </div>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((s) => (
                <SelectItem key={s.subjectCode} value={s.subjectCode}>
                  {s.subjectName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomOut} disabled={zoom <= 50}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Badge variant="outline" className="font-mono text-xs px-2">{zoom}%</Badge>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomIn} disabled={zoom >= 200}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleRotate}>
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground px-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <Download className="h-3 w-3" />
            <span className="hidden sm:inline">Download</span>
          </Button>
        </div>

        {/* Document Viewer */}
        <div className="relative bg-muted/20 rounded-lg overflow-hidden min-h-[300px] sm:min-h-[400px] flex items-center justify-center border">
          <div 
            className="transition-transform duration-200 ease-out"
            style={{ 
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
            }}
          >
            {/* Placeholder for actual answer sheet document */}
            <div className="w-[280px] sm:w-[400px] h-[380px] sm:h-[500px] bg-card border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center p-4 gap-4">
              <FileText className="h-16 w-16 text-muted-foreground/50" />
              <div className="text-center">
                <p className="font-medium text-muted-foreground">{subject?.subjectName}</p>
                <p className="text-sm text-muted-foreground/70">Answer Sheet - Page {currentPage}</p>
                <Badge variant="secondary" className="mt-2 text-xs">{subject?.subjectCode}</Badge>
              </div>
              <p className="text-xs text-muted-foreground/50 text-center">
                Document viewer placeholder<br />
                Actual scanned answer sheets would appear here
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        {subject && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-sm">
            <div className="p-2 rounded bg-muted/30">
              <p className="text-xs text-muted-foreground">Theory</p>
              <p className="font-semibold">{subject.theoryObtained}/{subject.theoryMax}</p>
            </div>
            <div className="p-2 rounded bg-muted/30">
              <p className="text-xs text-muted-foreground">Practical</p>
              <p className="font-semibold">{subject.practicalObtained}/{subject.practicalMax}</p>
            </div>
            <div className="p-2 rounded bg-muted/30">
              <p className="text-xs text-muted-foreground">Internal</p>
              <p className="font-semibold">{subject.internalObtained}/{subject.internalMax}</p>
            </div>
            <div className="p-2 rounded bg-primary/10">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="font-semibold text-primary">{subject.totalObtained}/{subject.totalMax}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
