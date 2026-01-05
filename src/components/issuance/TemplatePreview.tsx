import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Award, ChevronDown, ChevronUp, GraduationCap, Hash, BookOpen, Calendar } from 'lucide-react';

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

interface TemplatePreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TemplatePreview = React.memo(function TemplatePreview({ 
  open, 
  onOpenChange 
}: TemplatePreviewProps) {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Marks Card Template</CardTitle>
                  <CardDescription>Preview of generated cards</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="hidden sm:flex">Sample</Badge>
                {open ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="border rounded-lg p-5 bg-gradient-to-br from-background to-muted/30 space-y-5">
              {/* Header */}
              <div className="text-center space-y-2 pb-4 border-b border-dashed">
                <div className="flex justify-center">
                  <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <h3 className="font-bold text-base text-foreground">University of Technology</h3>
                <p className="text-xs text-muted-foreground">Statement of Marks</p>
              </div>

              {/* Student Info */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <GraduationCap className="h-3 w-3" />
                    Student Name
                  </p>
                  <p className="font-medium text-sm">{sampleTemplate.studentName}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    Registration No
                  </p>
                  <p className="font-medium font-mono text-sm">{sampleTemplate.registrationNo}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    Semester
                  </p>
                  <p className="font-medium text-sm">{sampleTemplate.semester}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Academic Year
                  </p>
                  <p className="font-medium text-sm">{sampleTemplate.academicYear}</p>
                </div>
              </div>

              <Separator />

              {/* Subjects Table */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Subject-wise Marks</p>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-xs h-7 py-1">Subject</TableHead>
                        <TableHead className="text-xs text-center h-7 py-1 w-10">Int</TableHead>
                        <TableHead className="text-xs text-center h-7 py-1 w-10">Ext</TableHead>
                        <TableHead className="text-xs text-center h-7 py-1 w-12">Total</TableHead>
                        <TableHead className="text-xs text-center h-7 py-1 w-14">Grade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sampleTemplate.subjects.map((subject) => (
                        <TableRow key={subject.code} className="text-xs">
                          <TableCell className="py-1.5">
                            <div>
                              <p className="font-medium text-xs">{subject.name}</p>
                              <p className="text-muted-foreground text-[10px]">{subject.code}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-center py-1.5 text-xs">{subject.internal}</TableCell>
                          <TableCell className="text-center py-1.5 text-xs">{subject.external}</TableCell>
                          <TableCell className="text-center py-1.5 font-medium text-xs">{subject.total}</TableCell>
                          <TableCell className="text-center py-1.5">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
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
              <div className="bg-primary/5 rounded-lg p-3 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Total Marks</span>
                  <span className="font-bold">{sampleTemplate.totalMarks}/400</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Percentage</span>
                  <span className="font-bold">{sampleTemplate.percentage}%</span>
                </div>
                <Separator className="my-1.5" />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Result</span>
                  <Badge variant="success" className="text-[10px]">{sampleTemplate.grade}</Badge>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex items-center justify-center pt-1">
                <div className="text-center space-y-1">
                  <div className="h-12 w-12 mx-auto border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/50">
                    <span className="text-[10px] text-muted-foreground">QR</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Blockchain Verified</p>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
});
