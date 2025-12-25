import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  Search, 
  Download, 
  Eye, 
  GraduationCap, 
  Hash, 
  Calendar, 
  BookOpen,
  Award,
  CheckCircle2,
  FileText,
  QrCode
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useGeneration } from '@/contexts/GenerationContext';

// Generate mock student data for a batch
function generateMockStudents(batchId: string, count: number) {
  const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Ananya', 'Diya', 'Myra', 'Sara', 'Anika', 'Aadhya', 'Kiara', 'Riya', 'Pari', 'Aisha'];
  const lastNames = ['Sharma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Reddy', 'Nair', 'Iyer', 'Verma', 'Joshi', 'Rao', 'Mehta', 'Shah', 'Desai', 'Pillai'];
  
  const subjects = [
    { code: 'CS601', name: 'Machine Learning', credits: 4 },
    { code: 'CS602', name: 'Cloud Computing', credits: 4 },
    { code: 'CS603', name: 'Data Mining', credits: 3 },
    { code: 'CS604', name: 'Cyber Security', credits: 3 },
    { code: 'CS605', name: 'Big Data Analytics', credits: 3 },
  ];

  const grades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C'];
  
  return Array.from({ length: count }, (_, i) => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const studentSubjects = subjects.map(sub => {
      const internal = Math.floor(Math.random() * 10) + 20;
      const external = Math.floor(Math.random() * 20) + 40;
      return {
        ...sub,
        internal,
        external,
        total: internal + external,
        grade: grades[Math.floor(Math.random() * grades.length)],
      };
    });
    
    const totalMarks = studentSubjects.reduce((sum, s) => sum + s.total, 0);
    const percentage = (totalMarks / (subjects.length * 100)) * 100;
    
    return {
      id: `MC-${batchId.slice(-6)}-${String(i + 1).padStart(4, '0')}`,
      studentName: `${firstName} ${lastName}`,
      registrationNo: `REG${2024}${String(i + 1).padStart(4, '0')}`,
      rollNo: `${String(i + 1).padStart(3, '0')}`,
      semester: 'Semester 6',
      academicYear: '2023-2024',
      department: 'Computer Science & Engineering',
      subjects: studentSubjects,
      totalMarks,
      maxMarks: subjects.length * 100,
      percentage: Math.round(percentage * 100) / 100,
      grade: percentage >= 75 ? 'First Class with Distinction' : percentage >= 60 ? 'First Class' : percentage >= 50 ? 'Second Class' : 'Pass',
      status: 'verified' as const,
      blockchainHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      issuedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    };
  });
}

// Historical batch data
const historicalBatches: Record<string, { fileName: string; totalCards: number; completedAt: Date }> = {
  'hist_batch_001': { fileName: 'CS_Semester6_2024_Batch1.xlsx', totalCards: 120, completedAt: new Date('2024-12-20T10:35:00') },
  'hist_batch_002': { fileName: 'ECE_Semester4_2024.xlsx', totalCards: 85, completedAt: new Date('2024-12-18T14:04:00') },
  'hist_batch_003': { fileName: 'ME_Semester2_2024.xlsx', totalCards: 95, completedAt: new Date('2024-12-15T09:20:00') },
  'hist_batch_004': { fileName: 'Civil_Semester8_2024.xlsx', totalCards: 60, completedAt: new Date('2024-12-10T11:03:00') },
  'hist_batch_005': { fileName: 'IT_Semester6_2024.xlsx', totalCards: 110, completedAt: new Date('2024-12-05T16:36:00') },
};

interface Student {
  id: string;
  studentName: string;
  registrationNo: string;
  rollNo: string;
  semester: string;
  academicYear: string;
  department: string;
  subjects: Array<{
    code: string;
    name: string;
    credits: number;
    internal: number;
    external: number;
    total: number;
    grade: string;
  }>;
  totalMarks: number;
  maxMarks: number;
  percentage: number;
  grade: string;
  status: 'verified' | 'pending';
  blockchainHash: string;
  issuedAt: Date;
}

function MarksCardModal({ student, open, onClose }: { student: Student | null; open: boolean; onClose: () => void }) {
  if (!student) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Marks Card Details
          </DialogTitle>
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
            <div className="border rounded-md overflow-hidden">
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
}

export default function BatchDetails() {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const { jobs } = useGeneration();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
                    {Math.round(students.reduce((sum, s) => sum + s.percentage, 0) / students.length)}%
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
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewStudent(student)}
                          className="gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
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
