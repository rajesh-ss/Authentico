import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { TransactionBadge } from '@/components/blockchain/TransactionBadge';
import { TransactionHash } from '@/components/blockchain/TransactionHash';
import { marksheetService, Marksheet, StudentInfo } from '@/services/marksheet.service';
import {
  FileText,
  Eye,
  Search,
  ArrowLeft,
  Calendar,
  Award,
  CheckCircle2,
  Loader2,
  AlertCircle,
  User,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { reevaluationService } from '@/services/reevaluation.service';
import { FormDialog } from '@/components/shared';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function MyMarksCards() {
  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [marksheets, setMarksheets] = useState<Marksheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMarksheet, setSelectedMarksheet] = useState<Marksheet | null>(null);

  // Re-evaluation State
  const [reevalOpen, setReevalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<{
    subjectCode: string;
    subjectSlot: string;
    rollNo: string;
    passYear: number;
  } | null>(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
        console.error('Error fetching marksheets:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredMarksheets = marksheets.filter(
    (ms) =>
      ms.passYear.toString().includes(searchQuery) ||
      ms.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ms.remarks.finalRemark.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleReevalClick = (subject: any, ms: Marksheet) => {
    console.log('handleReevalClick called', subject, ms);
    setSelectedSubject({
      subjectCode: subject.subjectCode,
      subjectSlot: subject.subjectSlot,
      rollNo: ms.rollNo,
      passYear: ms.passYear,
    });
    setReason('');
    setReevalOpen(true);
  };

  const submitReevaluation = async () => {
    console.log('submitReevaluation called');
    console.log('Selected Subject:', selectedSubject);
    console.log('Reason:', reason);

    if (!selectedSubject || !reason.trim()) {
      console.log('Validation failed: missing subject or reason');
      toast.error('Please provide a reason for re-evaluation');
      return;
    }

    try {
      setSubmitting(true);
      console.log('Calling reevaluationService.createRequest...');
      const response = await reevaluationService.createRequest({
        rollNo: selectedSubject.rollNo,
        subjectCode: selectedSubject.subjectCode,
        passYear: selectedSubject.passYear,
        reason: reason,
      });
      console.log('API Response:', response);
      toast.success('Re-evaluation request submitted successfully');
      setReevalOpen(false);
    } catch (error) {
      console.error('Re-evaluation request failed:', error);
      toast.error('Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  // Detail View
  if (selectedMarksheet && student) {
    const ms = selectedMarksheet;
    const percentage = ms.maxMarks > 0 ? ((ms.totalMarks / ms.maxMarks) * 100).toFixed(1) : '0';

    return (
      <DashboardLayout title={`Marksheet — ${ms.passYear}`} subtitle={`Roll No: ${ms.rollNo}`}>
        <FormDialog
          open={reevalOpen}
          onOpenChange={setReevalOpen}
          title="Request Re-evaluation"
          description={`Requesting re-evaluation for Subject: ${selectedSubject?.subjectCode}`}
          onSubmit={submitReevaluation}
          submitLabel={submitting ? 'Submitting...' : 'Submit Request'}
          isLoading={submitting}
        >
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs">Roll No</span>
                <span className="font-medium">{selectedSubject?.rollNo}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Pass Year</span>
                <span className="font-medium">{selectedSubject?.passYear}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Re-evaluation</Label>
              <Textarea
                id="reason"
                placeholder="Please explain why you are requesting a re-evaluation..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="resize-none"
                rows={4}
              />
            </div>
          </div>
        </FormDialog>

        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" className="mb-4" onClick={() => setSelectedMarksheet(null)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to All Marksheets
          </Button>

          {/* Student + Marks Summary */}
          <Card className="mb-6">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 md:h-16 md:w-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl md:text-2xl font-bold">{student.studentName}</h2>
                      {ms.isLatest && <Badge variant="success">Latest</Badge>}
                      <Badge variant="outline">v{ms.version}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {student.fatherName} • Roll No: {ms.rollNo} •{' '}
                      {format(new Date(ms.createdAt), 'dd MMM yyyy')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {[
                  { label: 'Total Marks', value: `${ms.totalMarks}/${ms.maxMarks}` },
                  { label: 'Percentage', value: `${percentage}%` },
                  { label: 'Result', value: ms.remarks.finalRemark },
                  { label: 'Pass Year', value: ms.passYear.toString() },
                ].map((stat, i) => (
                  <div key={i} className="p-3 md:p-4 bg-muted/30 rounded-lg text-center">
                    <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-sm md:text-lg font-bold truncate">{stat.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Subject-wise Marks */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Subject-wise Marks</CardTitle>
            </CardHeader>
            <CardContent className="p-0 md:p-6 md:pt-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <thead>
                    <tr className="border-b border-border">
                      {[
                        'Slot',
                        'Subject Code',
                        'Mark 1',
                        'Mark 2',
                        'Mark 3',
                        'Total',
                        'Action',
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-left py-3 px-4 font-medium text-muted-foreground text-sm"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ms.subjects.map((subject) => (
                      <tr
                        key={subject.subjectSlot}
                        className="border-b border-border/50 hover:bg-muted/30"
                      >
                        <td className="py-3 px-4 text-sm">{subject.subjectSlot}</td>
                        <td className="py-3 px-4 font-mono text-xs md:text-sm">
                          {subject.subjectCode}
                        </td>
                        <td className="py-3 px-4 text-center text-sm">{subject.marks.mark1}</td>
                        <td className="py-3 px-4 text-center text-sm">{subject.marks.mark2}</td>
                        <td className="py-3 px-4 text-center text-sm">{subject.marks.mark3}</td>
                        <td className="py-3 px-4 text-center font-medium text-sm">
                          {subject.total}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => handleReevalClick(subject, ms)}
                          >
                            Re-eval
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Additional Marks */}
          {(ms.environmentMarks > 0 || ms.sportsMarks > 0 || ms.nccMarks > 0) && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Additional Marks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-muted/30 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">Environment</p>
                    <p className="text-lg font-bold">{ms.environmentMarks}</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">Sports</p>
                    <p className="text-lg font-bold">{ms.sportsMarks}</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">NCC</p>
                    <p className="text-lg font-bold">{ms.nccMarks}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Blockchain Verification */}
          {ms.fabricTxId && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  Blockchain Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-muted-foreground">Status</span>
                  <TransactionBadge status="confirmed" />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-muted-foreground">Transaction ID</span>
                  <TransactionHash hash={ms.fabricTxId} />
                </div>
                {ms.thumbprint && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-muted-foreground">Thumbprint</span>
                    <span className="font-mono text-xs truncate max-w-[300px]">
                      {ms.thumbprint}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Marksheets" subtitle="View all your academic records">
      <FormDialog
        open={reevalOpen}
        onOpenChange={setReevalOpen}
        title="Request Re-evaluation"
        description={`Requesting re-evaluation for Subject: ${selectedSubject?.subjectCode}`}
        onSubmit={submitReevaluation}
        submitLabel={submitting ? 'Submitting...' : 'Submit Request'}
        isLoading={submitting}
      >
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground block text-xs">Roll No</span>
              <span className="font-medium">{selectedSubject?.rollNo}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-xs">Pass Year</span>
              <span className="font-medium">{selectedSubject?.passYear}</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Re-evaluation</Label>
            <Textarea
              id="reason"
              placeholder="Please explain why you are requesting a re-evaluation..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="resize-none"
              rows={4}
            />
          </div>
        </div>
      </FormDialog>

      <div className="max-w-4xl mx-auto">
        {/* Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by year, roll no, or result..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {student && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span className="font-medium text-foreground">{student.studentName}</span>
              <span>• {student.rollNo}</span>
            </div>
          )}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
            <span className="text-muted-foreground">Loading marksheets...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-12 text-destructive">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && filteredMarksheets.length === 0 && (
          <div className="text-center py-12">
            <div className="h-16 w-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-lg mb-1">No marksheets found</h3>
            <p className="text-muted-foreground text-sm">
              {searchQuery
                ? 'Try adjusting your search'
                : 'Your marksheets will appear here once they are issued'}
            </p>
          </div>
        )}

        {!loading && !error && filteredMarksheets.length > 0 && (
          <div className="grid gap-4">
            {filteredMarksheets.map((ms) => {
              const percentage =
                ms.maxMarks > 0 ? ((ms.totalMarks / ms.maxMarks) * 100).toFixed(1) : '0';

              return (
                <Card key={ms._id} className="hover:border-primary/50 transition-colors">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="h-12 w-12 md:h-14 md:w-14 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <FileText className="h-6 w-6 md:h-7 md:w-7 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-base md:text-lg">
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
                          <div className="flex items-center gap-3 md:gap-4 mt-1 text-xs md:text-sm text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(ms.createdAt), 'dd MMM yyyy')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Award className="h-3 w-3" />
                              {percentage}% • {ms.totalMarks}/{ms.maxMarks}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between md:justify-end gap-3">
                        <div className="text-left md:text-right mr-2 md:mr-4">
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {ms.remarks.finalRemark}
                          </p>
                        </div>
                        {ms.fabricTxId && (
                          <div className="hidden sm:block">
                            <TransactionBadge status="confirmed" size="sm" />
                          </div>
                        )}
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedMarksheet(ms)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
