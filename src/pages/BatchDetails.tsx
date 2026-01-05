import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  ArrowLeft, Search, Download, Eye, GraduationCap, Calendar, BookOpen,
  Award, CheckCircle2, FileText, Loader2, FileDown
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useGeneration } from '@/contexts/GenerationContext';
import { downloadSinglePDF, downloadBulkPDF } from '@/lib/pdfGenerator';
import { toast } from 'sonner';
import { generateMockStudents, historicalBatches, type Student } from '@/data/mockStudents';
import { MarksCardModal } from '@/components/batch';

export default function BatchDetails() {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const { jobs } = useGeneration();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadingStudentId, setDownloadingStudentId] = useState<string | null>(null);

  // Find the batch (from context or historical)
  const contextJob = jobs.find(j => j.id === batchId);
  const historicalBatch = batchId ? historicalBatches[batchId] : null;
  
  const batchInfo = contextJob 
    ? { fileName: contextJob.fileName, totalCards: contextJob.generatedCards, completedAt: contextJob.completedAt }
    : historicalBatch;

  // Generate mock students for this batch
  const students = useMemo(() => {
    if (!batchId || !batchInfo) return [];
    return generateMockStudents(batchId, batchInfo.totalCards);
  }, [batchId, batchInfo]);

  // Filter students
  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students;
    const query = searchQuery.toLowerCase();
    return students.filter(s => 
      s.studentName.toLowerCase().includes(query) ||
      s.registrationNo.toLowerCase().includes(query) ||
      s.rollNo.includes(query)
    );
  }, [students, searchQuery]);

  if (!batchInfo) {
    return (
      <DashboardLayout title="Batch Not Found" subtitle="The requested batch could not be found">
        <Card>
          <CardContent className="py-12 text-center">
            <div className="h-16 w-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-lg mb-1">Batch not found</h3>
            <p className="text-muted-foreground text-sm mb-4">
              The batch you're looking for doesn't exist or has been removed
            </p>
            <Button onClick={() => navigate('/generation-status')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Marks Cards
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleDownloadSinglePDF = (student: Student) => {
    setDownloadingStudentId(student.id);
    try {
      downloadSinglePDF(student);
      toast.success(`Downloaded marks card for ${student.studentName}`);
    } catch (error) {
      toast.error('Failed to generate PDF');
    } finally {
      setDownloadingStudentId(null);
    }
  };

  const handleDownloadAllPDFs = async () => {
    if (students.length === 0) return;
    
    setIsDownloading(true);
    try {
      const batchName = batchInfo.fileName.replace(/\.[^/.]+$/, '');
      await downloadBulkPDF(students, batchName);
      toast.success(`Downloaded ${students.length} marks cards as ZIP`);
    } catch (error) {
      toast.error('Failed to generate PDFs');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <DashboardLayout
      title={batchInfo.fileName.replace(/\.[^/.]+$/, '')}
      subtitle={`${batchInfo.totalCards} marks cards generated`}
    >
      <div className="space-y-6">
        {/* Back Button & Summary */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <Button variant="outline" onClick={() => navigate('/generation-status')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Marks Cards
          </Button>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              {batchInfo.totalCards} cards
            </span>
            {batchInfo.completedAt && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(batchInfo.completedAt, 'PPp')}
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{batchInfo.totalCards}</p>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{batchInfo.totalCards}</p>
                  <p className="text-sm text-muted-foreground">Verified</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <Award className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {students.filter(s => s.percentage >= 75).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Distinction</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {students.length > 0 ? Math.round(students.reduce((sum, s) => sum + s.percentage, 0) / students.length) : 0}%
                  </p>
                  <p className="text-sm text-muted-foreground">Avg. Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Student List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-lg">Student Marks Cards</CardTitle>
                <CardDescription>
                  {searchQuery 
                    ? `Showing ${filteredStudents.length} of ${students.length} students`
                    : `All ${students.length} students in this batch`
                  }
                </CardDescription>
              </div>
              <Button 
                onClick={handleDownloadAllPDFs}
                disabled={isDownloading}
                className="gap-2"
              >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileDown className="h-4 w-4" />
                )}
                Download All PDFs
              </Button>
            </div>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, registration no, or roll no..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Registration No</TableHead>
                    <TableHead className="text-center">Marks</TableHead>
                    <TableHead className="text-center">Percentage</TableHead>
                    <TableHead className="text-center">Grade</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-mono">{student.rollNo}</TableCell>
                      <TableCell className="font-medium">{student.studentName}</TableCell>
                      <TableCell className="font-mono text-muted-foreground">{student.registrationNo}</TableCell>
                      <TableCell className="text-center">{student.totalMarks}/{student.maxMarks}</TableCell>
                      <TableCell className="text-center">
                        <span className={cn(
                          "font-medium",
                          student.percentage >= 75 && "text-success",
                          student.percentage < 50 && "text-destructive"
                        )}>
                          {student.percentage}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={student.percentage >= 75 ? 'success' : student.percentage >= 60 ? 'default' : 'secondary'}>
                          {student.grade.split(' ')[0]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="gap-1">
                          <CheckCircle2 className="h-3 w-3 text-success" />
                          Verified
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewStudent(student)}
                            className="gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDownloadSinglePDF(student)}
                            disabled={downloadingStudentId === student.id}
                            className="gap-1"
                          >
                            {downloadingStudentId === student.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                            PDF
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Marks Card Modal */}
      <MarksCardModal 
        student={selectedStudent} 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </DashboardLayout>
  );
}
