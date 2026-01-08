import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { GraduationCap, Hash, BookOpen, Calendar } from 'lucide-react';
import { MarksCardTemplate } from '@/types/issuance';

// Sample data for preview
const sampleData = {
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

interface TemplatePreviewDialogProps {
  template: MarksCardTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TemplatePreviewDialog({ template, open, onOpenChange }: TemplatePreviewDialogProps) {
  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Preview: {template.name}
            <Badge variant="secondary" className="uppercase text-xs ml-2">
              {template.fileType}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="border rounded-lg p-6 bg-gradient-to-br from-background to-muted/30 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2 pb-4 border-b border-dashed">
            <div className="flex justify-center">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                <GraduationCap className="h-7 w-7 text-primary" />
              </div>
            </div>
            <h3 className="font-bold text-lg text-foreground">University of Technology</h3>
            <p className="text-sm text-muted-foreground">Statement of Marks</p>
            <Badge variant="outline" className="text-xs">Sample Preview</Badge>
          </div>

          {/* Student Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <GraduationCap className="h-3 w-3" />
                Student Name
              </p>
              <p className="font-medium">{sampleData.studentName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Hash className="h-3 w-3" />
                Registration No
              </p>
              <p className="font-medium font-mono">{sampleData.registrationNo}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                Semester
              </p>
              <p className="font-medium">{sampleData.semester}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Academic Year
              </p>
              <p className="font-medium">{sampleData.academicYear}</p>
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
                    <TableHead className="text-xs">Subject</TableHead>
                    <TableHead className="text-xs text-center w-16">Credits</TableHead>
                    <TableHead className="text-xs text-center w-16">Internal</TableHead>
                    <TableHead className="text-xs text-center w-16">External</TableHead>
                    <TableHead className="text-xs text-center w-16">Total</TableHead>
                    <TableHead className="text-xs text-center w-16">Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleData.subjects.map((subject) => (
                    <TableRow key={subject.code} className="text-sm">
                      <TableCell className="py-2">
                        <div>
                          <p className="font-medium">{subject.name}</p>
                          <p className="text-muted-foreground text-xs">{subject.code}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{subject.credits}</TableCell>
                      <TableCell className="text-center">{subject.internal}</TableCell>
                      <TableCell className="text-center">{subject.external}</TableCell>
                      <TableCell className="text-center font-medium">{subject.total}</TableCell>
                      <TableCell className="text-center">
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
              <span className="font-bold">{sampleData.totalMarks}/400</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Percentage</span>
              <span className="font-bold">{sampleData.percentage}%</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Result</span>
              <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                {sampleData.grade}
              </Badge>
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

          {/* Template Fields Info */}
          {template.fields.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Template Fields</p>
                <div className="flex flex-wrap gap-2">
                  {template.fields.map((field) => (
                    <Badge key={field.id} variant="secondary" className="text-xs">
                      {field.name}
                      {field.required && <span className="text-destructive ml-1">*</span>}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
