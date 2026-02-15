import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TransactionBadge } from '@/components/blockchain/TransactionBadge';
import { StatsGrid } from '@/components/shared';
import { marksheetService, Marksheet, StudentInfo } from '@/services/marksheet.service';
import {
  GraduationCap,
  FileText,
  CheckCircle2,
  ArrowRight,
  Loader2,
  AlertCircle,
  User,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function StudentDashboard() {
  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [marksheets, setMarksheets] = useState<Marksheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await marksheetService.getMyMarksheets();
        if (response.success) {
          setStudent(response.data.student);
          setMarksheets(response.data.marksheets);
        } else {
          setError(response.message || 'Failed to fetch data');
        }
      } catch (err) {
        setError('Failed to fetch your marksheets. Please try again.');
        console.error('Error fetching student data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const latestMarksheet = marksheets.find((m) => m.isLatest) || marksheets[0];

  const stats = [
    {
      icon: GraduationCap,
      value: marksheets.length,
      label: 'Marksheets',
      color: 'accent' as const,
    },
    {
      icon: CheckCircle2,
      value: latestMarksheet ? `${latestMarksheet.totalMarks}/${latestMarksheet.maxMarks}` : '—',
      label: 'Latest Marks',
      color: 'success' as const,
    },
  ];

  return (
    <DashboardLayout
      title="My Dashboard"
      subtitle={student ? `Welcome back, ${student.studentName}` : 'Welcome back'}
    >
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
          <span className="text-muted-foreground">Loading your data...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center py-12 text-destructive">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && (
        <>
          <StatsGrid stats={stats} columns={2} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Marksheets List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-semibold">My Marksheets</CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/my-cards">
                      View All
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent className="pt-0">
                  {marksheets.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No marksheets found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {marksheets.slice(0, 3).map((ms) => (
                        <div
                          key={ms._id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors group gap-3"
                        >
                          <div className="flex items-center gap-3 sm:gap-4">
                            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-foreground text-sm sm:text-base">
                                  Pass Year {ms.passYear}
                                </h3>
                                {ms.isLatest && (
                                  <Badge variant="success" className="text-xs">
                                    Latest
                                  </Badge>
                                )}
                                <Badge variant="outline" className="text-xs">
                                  v{ms.version}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 sm:gap-3 mt-1 flex-wrap">
                                <span className="text-xs sm:text-sm text-muted-foreground">
                                  {format(new Date(ms.createdAt), 'dd MMM yyyy')}
                                </span>
                                <span className="text-xs sm:text-sm font-medium text-foreground">
                                  {ms.totalMarks}/{ms.maxMarks}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {ms.remarks.finalRemark}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-2 pl-13 sm:pl-0">
                            {ms.fabricTxId && (
                              <TransactionBadge status="confirmed" size="sm" showIcon={false} />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Student Info */}
            <div className="space-y-6">
              {student && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      Student Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <InfoRow label="Name" value={student.studentName} />
                    <InfoRow label="Father" value={student.fatherName} />
                    <InfoRow label="Mother" value={student.motherName} />
                    <InfoRow label="Roll No" value={student.rollNo} />
                    <InfoRow label="Enrollment" value={student.enrollmentNo} />
                    <InfoRow label="School" value={student.schoolName} />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground truncate ml-2 max-w-[180px]">{value}</span>
    </div>
  );
}
