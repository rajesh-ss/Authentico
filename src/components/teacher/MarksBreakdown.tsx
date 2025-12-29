import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SubjectMarksBreakdown } from '@/data/mockAnswerSheets';
import { BookOpen, Calculator } from 'lucide-react';

interface MarksBreakdownProps {
  subjects: SubjectMarksBreakdown[];
}

export function MarksBreakdown({ subjects }: MarksBreakdownProps) {
  return (
    <div className="space-y-4 overflow-hidden">
      {subjects.map((subject) => {
        const percentage = Math.round((subject.totalObtained / subject.totalMax) * 100);
        
        return (
          <Card key={subject.subjectCode} className="border-border/50 overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <BookOpen className="h-4 w-4 text-primary flex-shrink-0" />
                  <div className="min-w-0">
                    <CardTitle className="text-base truncate">{subject.subjectName}</CardTitle>
                    <p className="text-xs text-muted-foreground font-mono">{subject.subjectCode}</p>
                  </div>
                </div>
                <Badge variant={percentage >= 75 ? 'default' : percentage >= 50 ? 'secondary' : 'destructive'} className="flex-shrink-0">
                  {subject.grade}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Overall Score */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Score</span>
                  <span className="font-semibold">{subject.totalObtained} / {subject.totalMax} ({percentage}%)</span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>

              {/* Component-wise Breakdown */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Theory</p>
                  <p className="font-semibold text-sm">{subject.theoryObtained}/{subject.theoryMax}</p>
                </div>
                <div className="p-2 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Practical</p>
                  <p className="font-semibold text-sm">{subject.practicalObtained}/{subject.practicalMax}</p>
                </div>
                <div className="p-2 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Internal</p>
                  <p className="font-semibold text-sm">{subject.internalObtained}/{subject.internalMax}</p>
                </div>
              </div>

              {/* Question-wise Breakdown */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Calculator className="h-4 w-4 flex-shrink-0" />
                  Question-wise Marks
                </div>
                <div className="rounded-lg border overflow-x-auto">
                  <Table className="min-w-[400px]">
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="h-8 text-xs w-16">Q.No</TableHead>
                        <TableHead className="h-8 text-xs text-center w-16">Max</TableHead>
                        <TableHead className="h-8 text-xs text-center w-20">Obtained</TableHead>
                        <TableHead className="h-8 text-xs">Remarks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subject.questions.map((q) => (
                        <TableRow key={q.questionNo} className="hover:bg-muted/20">
                          <TableCell className="py-2 font-mono text-sm">{q.questionNo}</TableCell>
                          <TableCell className="py-2 text-center text-muted-foreground">{q.maxMarks}</TableCell>
                          <TableCell className="py-2 text-center">
                            <span className={q.obtainedMarks < q.maxMarks * 0.4 ? 'text-destructive font-medium' : ''}>
                              {q.obtainedMarks}
                            </span>
                          </TableCell>
                          <TableCell className="py-2 text-xs text-muted-foreground">
                            <span className="block max-w-[200px] truncate" title={q.remarks}>
                              {q.remarks || '-'}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
