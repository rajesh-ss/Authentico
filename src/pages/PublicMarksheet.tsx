import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { marksheetService, StudentMarksheetData } from '@/services/marksheet.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  CheckCircle2,
  XCircle,
  GraduationCap,
  School,
  Calendar,
  User,
} from 'lucide-react';
import { format } from 'date-fns';

export default function PublicMarksheet() {
  const { rollNo } = useParams<{ rollNo: string }>();
  const [data, setData] = useState<StudentMarksheetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarksheet = async () => {
      if (!rollNo) return;
      try {
        setLoading(true);
        const response = await marksheetService.getPublicMarksheet(rollNo);
        setData(response.data);
      } catch (err) {
        console.error('Failed to fetch marksheet:', err);
        setError('Failed to load certificate details. Please check the URL or try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMarksheet();
  }, [rollNo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verifying Certificate...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-destructive/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-destructive">Verification Failed</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">
            {error || 'Certificate not found'}
          </CardContent>
        </Card>
      </div>
    );
  }

  const { student, marksheets } = data;
  const latestMarksheet = marksheets.find((m) => m.isLatest) || marksheets[0];

  if (!latestMarksheet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-destructive/50">
          <CardContent className="pt-6 text-center text-muted-foreground">
            No marksheet data available for this student.
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPass = latestMarksheet.result === 'PASS' || latestMarksheet.result === 'P';

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Verification Header */}
        <div className="flex items-center justify-center gap-2 text-success font-medium bg-white p-4 rounded-lg shadow-sm border border-success/20">
          <CheckCircle2 className="h-5 w-5" />
          <span>Certificate Verified Successfully</span>
        </div>

        {/* Student Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Student Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Student Name</p>
                <p className="font-semibold text-lg">{student.studentName}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Roll Number</p>
                  <p className="font-mono font-medium">{student.rollNo}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Enrollment No</p>
                  <p className="font-mono font-medium">{student.enrollmentNo}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Father's Name</p>
                <p className="font-medium">{student.fatherName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mother's Name</p>
                <p className="font-medium">{student.motherName}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Institution Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="h-5 w-5 text-primary" />
              Institution Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">School Name</p>
                <p className="font-medium">{student.schoolName}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">School Code</p>
                  <p className="font-mono font-medium">{student.schoolCode}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Center Code</p>
                  <p className="font-mono font-medium">{student.centerCode}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Marks Details */}
        <Card
          className={isPass ? 'border-l-4 border-l-success' : 'border-l-4 border-l-destructive'}
        >
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Academic Performance
            </CardTitle>
            <Badge variant={isPass ? 'default' : 'destructive'} className="text-lg px-4 py-1">
              {latestMarksheet.result === 'F' ? 'FAIL' : latestMarksheet.result}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="mb-6 grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Pass Year</p>
                <p className="font-bold text-lg">{latestMarksheet.passYear}</p>
              </div>
              <div className="text-center border-l border-r border-border">
                <p className="text-sm text-muted-foreground mb-1">Total Marks</p>
                <p className="font-bold text-lg">
                  {latestMarksheet.totalMarks} / {latestMarksheet.maxMarks}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Percentage</p>
                <p className="font-bold text-lg">
                  {((latestMarksheet.totalMarks / latestMarksheet.maxMarks) * 100).toFixed(2)}%
                </p>
              </div>
            </div>

            <div className="rounded-md border overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground font-medium">
                  <tr>
                    <th className="px-4 py-3">Subject Code</th>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3 text-right">Marks</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {latestMarksheet.subjects.map((subject) => (
                    <tr key={subject.subjectCode} className="hover:bg-muted/20">
                      <td className="px-4 py-3 font-mono">{subject.subjectCode}</td>
                      <td className="px-4 py-3">
                        {/* Subject name map or raw code if unavailable */} Subject{' '}
                        {subject.subjectCode}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">{subject.total}</td>
                      <td className="px-4 py-3 text-center">
                        {subject.qualificationFlag === 'F' ||
                        subject.qualificationFlag === 'ABS' ? (
                          <span className="text-destructive font-bold">
                            {subject.qualificationFlag || 'F'}
                          </span>
                        ) : (
                          <span className="text-success font-bold">P</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex flex-col md:flex-row gap-4 justify-between text-sm text-muted-foreground pt-4 border-t">
              {latestMarksheet.remarks?.finalRemark && (
                <div>
                  <span className="font-medium text-foreground">Remarks: </span>
                  {latestMarksheet.remarks.finalRemark}
                </div>
              )}
              <div className="flex gap-2 items-center">
                <Calendar className="h-4 w-4" />
                <span>
                  Result Date:{' '}
                  {latestMarksheet.resultDate
                    ? format(new Date(latestMarksheet.resultDate), 'PP')
                    : 'N/A'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
