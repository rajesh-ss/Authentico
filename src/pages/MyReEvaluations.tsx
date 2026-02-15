import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { marksheetService, StudentInfo } from '@/services/marksheet.service';
import { detailsChangeService, DetailsChangeData } from '@/services/details-change.service';
import { toast } from 'sonner';
import {
  User,
  Loader2,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Send,
  Clock,
  FileText,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function MyReEvaluations() {
  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingRequests, setPendingRequests] = useState<DetailsChangeData[]>([]);

  // Form state
  const [studentName, setStudentName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    _id: string;
    status: string;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Parallel fetch for student info and pending requests
        const [studentRes, requestsRes] = await Promise.all([
          marksheetService.getMyMarksheets(),
          detailsChangeService.getPendingRequests(),
        ]);

        if (studentRes.success) {
          setStudent(studentRes.data.student);
          setStudentName(studentRes.data.student.studentName);
          setFatherName(studentRes.data.student.fatherName);
          setMotherName(studentRes.data.student.motherName);
        } else {
          setError(studentRes.message || 'Failed to fetch student data');
        }

        if (requestsRes.success) {
          setPendingRequests(requestsRes.data);
        }
      } catch (err) {
        setError('Failed to fetch data. Please try again.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const hasChanges = student
    ? studentName !== student.studentName ||
      fatherName !== student.fatherName ||
      motherName !== student.motherName
    : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!student) return;

    if (!hasChanges) {
      toast.error('Please make at least one change before submitting.');
      return;
    }

    const changes: Record<string, string> = {};
    if (studentName !== student.studentName) changes.studentName = studentName;
    if (fatherName !== student.fatherName) changes.fatherName = fatherName;
    if (motherName !== student.motherName) changes.motherName = motherName;

    try {
      setSubmitting(true);
      const response = await detailsChangeService.createRequest({
        rollNo: student.rollNo,
        reason,
        changes,
      });

      if (response.success) {
        setSubmitted(true);
        setSubmittedData({
          _id: response.data._id,
          status: response.data.status,
        });
        toast.success('Details change request submitted successfully');
        // Refresh pending requests
        const updatedRequests = await detailsChangeService.getPendingRequests();
        if (updatedRequests.success) {
          setPendingRequests(updatedRequests.data);
        }
      } else {
        toast.error(response.message || 'Failed to submit request');
      }
    } catch (err) {
      console.error('Submit error:', err);
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Success view
  if (submitted && submittedData) {
    return (
      <DashboardLayout title="Details Update" subtitle="Request submitted successfully">
        <Card className="max-w-2xl mx-auto border-success/50 bg-gradient-to-br from-success/5 to-success/10">
          <CardContent className="py-12 text-center">
            <div className="h-20 w-20 mx-auto rounded-full bg-success/20 flex items-center justify-center mb-6">
              <CheckCircle className="h-10 w-10 text-success" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Request Submitted!</h2>
            <p className="text-muted-foreground mb-2">
              Your details change request has been submitted successfully.
            </p>
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge variant="warning">{submittedData.status}</Badge>
            </div>
            <div className="flex items-center justify-center gap-4">
              <Button variant="outline" asChild>
                <Link to="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <Button
                onClick={() => {
                  setSubmitted(false);
                  setSubmittedData(null);
                }}
              >
                Submit Another Request
              </Button>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Request Details Update"
      subtitle="Submit a request to update your personal details"
    >
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
              <span className="text-muted-foreground">Loading...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-12 text-destructive">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && student && (
            <>
              {/* Current Details */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Current Details
                  </CardTitle>
                  <CardDescription>
                    Your current details on record (Roll No: {student.rollNo})
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Student Name</p>
                      <p className="font-medium text-sm">{student.studentName}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Father's Name</p>
                      <p className="font-medium text-sm">{student.fatherName}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Mother's Name</p>
                      <p className="font-medium text-sm">{student.motherName}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Change Form */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Request Changes</CardTitle>
                  <CardDescription>
                    Update the fields below with the corrected values.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="studentName">Student Name</Label>
                        <Input
                          id="studentName"
                          value={studentName}
                          onChange={(e) => setStudentName(e.target.value)}
                        />
                        {studentName !== student.studentName && (
                          <p className="text-xs text-primary">Changed</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fatherName">Father's Name</Label>
                        <Input
                          id="fatherName"
                          value={fatherName}
                          onChange={(e) => setFatherName(e.target.value)}
                        />
                        {fatherName !== student.fatherName && (
                          <p className="text-xs text-primary">Changed</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="motherName">Mother's Name</Label>
                        <Input
                          id="motherName"
                          value={motherName}
                          onChange={(e) => setMotherName(e.target.value)}
                        />
                        {motherName !== student.motherName && (
                          <p className="text-xs text-primary">Changed</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reason">Reason for Change (optional)</Label>
                      <Textarea
                        id="reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Explain why these details need to be updated..."
                        rows={2}
                      />
                    </div>

                    {hasChanges && (
                      <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                        <p className="text-sm text-primary font-medium mb-1">Summary of Changes:</p>
                        <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                          {studentName !== student.studentName && (
                            <li>
                              Student Name: {student.studentName} → {studentName}
                            </li>
                          )}
                          {fatherName !== student.fatherName && (
                            <li>
                              Father's Name: {student.fatherName} → {fatherName}
                            </li>
                          )}
                          {motherName !== student.motherName && (
                            <li>
                              Mother's Name: {student.motherName} → {motherName}
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center gap-3 pt-2">
                      <Button
                        type="submit"
                        disabled={!hasChanges || submitting}
                        className="flex-1 sm:flex-none"
                      >
                        {submitting ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Send className="h-4 w-4 mr-2" />
                        )}
                        Submit Request
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setStudentName(student.studentName);
                          setFatherName(student.fatherName);
                          setMotherName(student.motherName);
                          setReason('');
                        }}
                      >
                        Reset
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Sidebar - Pending Requests */}
        <div className="space-y-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-warning" />
                Pending Requests
              </CardTitle>
              <CardDescription>Track your active change requests</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No pending requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((req) => (
                    <div
                      key={req._id}
                      className="p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="warning" className="text-[10px] px-1.5 py-0.5">
                          {req.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(req.createdAt), 'MMM d, h:mm a')}
                        </span>
                      </div>

                      <div className="space-y-1 mb-2">
                        {Object.entries(req.changes).map(([key, val]) => (
                          <div key={key} className="text-sm">
                            <span className="text-muted-foreground capitalize text-xs">
                              {key.replace(/([A-Z])/g, ' $1').trim()}:
                            </span>
                            <div className="font-medium truncate" title={val as string}>
                              {val as string}
                            </div>
                          </div>
                        ))}
                      </div>

                      {req.reason && (
                        <p className="text-xs text-muted-foreground italic truncate">
                          "{req.reason}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
