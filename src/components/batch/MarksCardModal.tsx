import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Award, GraduationCap, Hash, Calendar, BookOpen, CheckCircle2, 
  QrCode, Download, Printer 
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { downloadSinglePDF } from '@/lib/pdfGenerator';
import type { Student } from '@/data/mockStudents';

interface MarksCardModalProps {
  student: Student | null;
  open: boolean;
  onClose: () => void;
}

// HTML escape utility to prevent XSS attacks
const escapeHtml = (text: string | number): string => {
  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
};

export const MarksCardModal = React.memo(function MarksCardModal({ 
  student, 
  open, 
  onClose 
}: MarksCardModalProps) {
  const handleDownloadPDF = () => {
    if (student) {
      downloadSinglePDF(student);
      toast.success(`Downloaded marks card for ${escapeHtml(student.studentName)}`);
    }
  };

  const handlePrint = () => {
    if (!student) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to print');
      return;
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Marks Card - ${escapeHtml(student.studentName)}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              padding: 20px;
              color: #1a1a1a;
            }
            .header { 
              text-align: center; 
              padding: 20px; 
              background: linear-gradient(135deg, #2563eb, #1d4ed8);
              color: white;
              border-radius: 8px 8px 0 0;
            }
            .header h1 { font-size: 22px; margin-bottom: 5px; }
            .header p { font-size: 14px; opacity: 0.9; }
            .verified-badge {
              display: inline-block;
              background: #22c55e;
              color: white;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 11px;
              margin-top: 10px;
            }
            .content { 
              padding: 25px; 
              border: 1px solid #e5e7eb;
              border-top: none;
            }
            .info-grid { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 15px; 
              margin-bottom: 25px;
              padding-bottom: 20px;
              border-bottom: 1px dashed #e5e7eb;
            }
            .info-item label { 
              font-size: 11px; 
              color: #6b7280; 
              display: block; 
              margin-bottom: 3px;
            }
            .info-item span { font-weight: 600; font-size: 13px; }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 20px 0;
              font-size: 12px;
            }
            th { 
              background: #f3f4f6; 
              padding: 10px 8px; 
              text-align: left;
              font-weight: 600;
              border: 1px solid #e5e7eb;
            }
            td { 
              padding: 10px 8px; 
              border: 1px solid #e5e7eb;
            }
            .text-center { text-align: center; }
            .grade-badge {
              display: inline-block;
              background: #f3f4f6;
              padding: 2px 8px;
              border-radius: 4px;
              font-weight: 600;
            }
            .summary-box { 
              background: #f8fafc; 
              padding: 20px; 
              border-radius: 8px;
              margin: 20px 0;
            }
            .summary-row { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 10px;
            }
            .summary-row:last-child { margin-bottom: 0; }
            .summary-label { color: #6b7280; font-size: 13px; }
            .summary-value { font-weight: 700; font-size: 14px; }
            .result-badge {
              display: inline-block;
              background: #22c55e;
              color: white;
              padding: 4px 16px;
              border-radius: 20px;
              font-size: 12px;
            }
            .blockchain-box {
              background: #fafafa;
              padding: 15px;
              border-radius: 8px;
              margin-top: 20px;
              font-size: 11px;
            }
            .blockchain-box h4 { font-size: 12px; margin-bottom: 8px; color: #374151; }
            .hash { 
              font-family: monospace; 
              font-size: 9px; 
              word-break: break-all;
              color: #6b7280;
            }
            .footer { 
              margin-top: 30px; 
              padding-top: 15px;
              border-top: 1px solid #e5e7eb;
              text-align: center; 
              font-size: 10px; 
              color: #9ca3af;
            }
            @media print {
              body { padding: 0; }
              .header { border-radius: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>University of Technology</h1>
            <p>Statement of Marks</p>
            <span class="verified-badge">✓ Blockchain Verified</span>
          </div>
          <div class="content">
            <div class="info-grid">
              <div class="info-item">
                <label>Student Name</label>
                <span>${escapeHtml(student.studentName)}</span>
              </div>
              <div class="info-item">
                <label>Registration No</label>
                <span>${escapeHtml(student.registrationNo)}</span>
              </div>
              <div class="info-item">
                <label>Roll No</label>
                <span>${escapeHtml(student.rollNo)}</span>
              </div>
              <div class="info-item">
                <label>Semester</label>
                <span>${escapeHtml(student.semester)}</span>
              </div>
              <div class="info-item">
                <label>Academic Year</label>
                <span>${escapeHtml(student.academicYear)}</span>
              </div>
              <div class="info-item">
                <label>Department</label>
                <span>${escapeHtml(student.department)}</span>
              </div>
            </div>

            <h3 style="font-size: 14px; margin-bottom: 10px; color: #374151;">Subject-wise Marks</h3>
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Subject Name</th>
                  <th class="text-center">Credits</th>
                  <th class="text-center">Internal</th>
                  <th class="text-center">External</th>
                  <th class="text-center">Total</th>
                  <th class="text-center">Grade</th>
                </tr>
              </thead>
              <tbody>
                ${student.subjects.map(sub => `
                  <tr>
                    <td>${escapeHtml(sub.code)}</td>
                    <td>${escapeHtml(sub.name)}</td>
                    <td class="text-center">${escapeHtml(sub.credits)}</td>
                    <td class="text-center">${escapeHtml(sub.internal)}</td>
                    <td class="text-center">${escapeHtml(sub.external)}</td>
                    <td class="text-center" style="font-weight: 600;">${escapeHtml(sub.total)}</td>
                    <td class="text-center"><span class="grade-badge">${escapeHtml(sub.grade)}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="summary-box">
              <div class="summary-row">
                <span class="summary-label">Total Marks</span>
                <span class="summary-value">${escapeHtml(student.totalMarks)} / ${escapeHtml(student.maxMarks)}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Percentage</span>
                <span class="summary-value">${escapeHtml(student.percentage)}%</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Result</span>
                <span class="result-badge">${escapeHtml(student.grade)}</span>
              </div>
            </div>

            <div class="blockchain-box">
              <h4>Blockchain Verification</h4>
              <p>Transaction Hash:</p>
              <p class="hash">${escapeHtml(student.blockchainHash)}</p>
              <p style="margin-top: 8px; color: #6b7280;">Issued: ${format(student.issuedAt, 'PPpp')}</p>
            </div>

            <div class="footer">
              <p>This is a computer-generated document and does not require a signature.</p>
              <p>Document ID: ${escapeHtml(student.id)}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  if (!student) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Award className="h-5 w-5 text-primary shrink-0" />
              Marks Card Details
            </DialogTitle>
            <div className="flex gap-2">
              <Button onClick={handlePrint} variant="outline" size="sm" className="gap-1.5 flex-1 sm:flex-none">
                <Printer className="h-4 w-4" />
                <span className="hidden sm:inline">Print</span>
              </Button>
              <Button onClick={handleDownloadPDF} size="sm" className="gap-1.5 flex-1 sm:flex-none">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">PDF</span>
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2 pb-4 border-b border-dashed">
            <div className="flex justify-center">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                <GraduationCap className="h-7 w-7 text-primary" />
              </div>
            </div>
            <h3 className="font-bold text-lg">University of Technology</h3>
            <p className="text-sm text-muted-foreground">Statement of Marks</p>
            <Badge variant="success" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Blockchain Verified
            </Badge>
          </div>

          {/* Student Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground flex items-center gap-1">
                <GraduationCap className="h-3.5 w-3.5" />
                Student Name
              </p>
              <p className="font-medium">{student.studentName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground flex items-center gap-1">
                <Hash className="h-3.5 w-3.5" />
                Registration No
              </p>
              <p className="font-medium font-mono">{student.registrationNo}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" />
                Semester
              </p>
              <p className="font-medium">{student.semester}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Academic Year
              </p>
              <p className="font-medium">{student.academicYear}</p>
            </div>
            <div className="space-y-1 col-span-2">
              <p className="text-muted-foreground">Department</p>
              <p className="font-medium">{student.department}</p>
            </div>
          </div>

          <Separator />

          {/* Subjects Table */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Subject-wise Marks</p>
            
            {/* Mobile View */}
            <div className="sm:hidden space-y-2">
              {student.subjects.map((subject) => (
                <div key={subject.code} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">{subject.name}</p>
                      <p className="text-xs text-muted-foreground">{subject.code}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{subject.grade}</Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs text-center">
                    <div>
                      <p className="text-muted-foreground">Cr</p>
                      <p className="font-medium">{subject.credits}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Int</p>
                      <p className="font-medium">{subject.internal}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Ext</p>
                      <p className="font-medium">{subject.external}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total</p>
                      <p className="font-bold">{subject.total}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View */}
            <div className="hidden sm:block border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-xs">Subject</TableHead>
                    <TableHead className="text-xs text-center">Credits</TableHead>
                    <TableHead className="text-xs text-center">Internal</TableHead>
                    <TableHead className="text-xs text-center">External</TableHead>
                    <TableHead className="text-xs text-center">Total</TableHead>
                    <TableHead className="text-xs text-center">Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {student.subjects.map((subject) => (
                    <TableRow key={subject.code} className="text-xs">
                      <TableCell className="py-2">
                        <div>
                          <p className="font-medium">{subject.name}</p>
                          <p className="text-muted-foreground">{subject.code}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-2">{subject.credits}</TableCell>
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
              <span className="font-bold">{student.totalMarks}/{student.maxMarks}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Percentage</span>
              <span className="font-bold">{student.percentage}%</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Result</span>
              <Badge variant="success">{student.grade}</Badge>
            </div>
          </div>

          {/* Blockchain Info */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Blockchain Verification</p>
            <div className="flex items-center gap-2">
              <QrCode className="h-12 w-12 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Transaction Hash</p>
                <p className="font-mono text-xs truncate">{student.blockchainHash}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Issued on {format(student.issuedAt, 'PPp')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});
