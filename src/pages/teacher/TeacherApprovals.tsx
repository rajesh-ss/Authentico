import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ApprovalList, type ApprovalItem } from '@/components/approvals';
import { mockReEvaluations, type ReEvaluationItem } from '@/data';
import { getAnswerSheetByRequestId } from '@/data/mockAnswerSheets';
import { MarksBreakdown } from '@/components/teacher/MarksBreakdown';
import { AnswerSheetViewer } from '@/components/teacher/AnswerSheetViewer';
import { useDialog } from '@/hooks/useDialog';
import { Clock, CheckCircle, XCircle, AlertCircle, FileText, Calculator, ClipboardList } from 'lucide-react';

export default function TeacherApprovals() {
  const [requests, setRequests] = useState<ReEvaluationItem[]>(
    mockReEvaluations.filter(r => r.status === 'submitted' || r.status === 'under_review')
  );
  
  const viewDialog = useDialog<ReEvaluationItem>();
  const answerSheetData = viewDialog.data ? getAnswerSheetByRequestId(viewDialog.data.id) : undefined;

  const counts = {
    submitted: requests.filter(r => r.status === 'submitted').length,
    under_review: requests.filter(r => r.status === 'under_review').length,
  };

  const stats = [
    { icon: Clock, value: counts.submitted, label: 'New Requests', color: 'warning' as const },
    { icon: AlertCircle, value: counts.under_review, label: 'Under Review', color: 'accent' as const },
  ];

  const filterOptions = [
    { value: 'all', label: 'All Pending' },
    { value: 'submitted', label: 'New' },
    { value: 'under_review', label: 'Under Review' },
  ];

  return (
    <>
      <ApprovalList
        title="Pending Approvals"
        subtitle="Validate and approve student re-evaluation requests"
        data={requests as (ReEvaluationItem & ApprovalItem)[]}
        setData={setRequests as any}
        stats={stats}
        filterOptions={filterOptions}
      />

      {/* Enhanced View Dialog with Tabs */}
      <Dialog open={viewDialog.isOpen} onOpenChange={(open) => !open && viewDialog.close()}>
        <DialogContent className="max-w-4xl h-[90vh] p-0 gap-0 flex flex-col overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary flex-shrink-0" />
              <span className="truncate">Re-Evaluation Request Details</span>
            </DialogTitle>
            <DialogDescription className="truncate">
              {viewDialog.data?.id} • {viewDialog.data?.studentName}
            </DialogDescription>
          </DialogHeader>
          
          {viewDialog.data && (
            <Tabs defaultValue="overview" className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="px-6 pt-4 border-b flex-shrink-0">
                <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:inline-flex">
                  <TabsTrigger value="overview" className="gap-2">
                    <ClipboardList className="h-4 w-4 hidden sm:inline" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="marks" className="gap-2">
                    <Calculator className="h-4 w-4 hidden sm:inline" />
                    Marks
                  </TabsTrigger>
                  <TabsTrigger value="answersheet" className="gap-2">
                    <FileText className="h-4 w-4 hidden sm:inline" />
                    Answer Sheet
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                  <TabsContent value="overview" className="m-0 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-muted/30 space-y-1">
                        <Label className="text-xs text-muted-foreground">Student Name</Label>
                        <p className="font-medium">{viewDialog.data.studentName}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/30 space-y-1">
                        <Label className="text-xs text-muted-foreground">Student ID</Label>
                        <p className="font-medium font-mono">{viewDialog.data.studentId}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/30 space-y-1">
                        <Label className="text-xs text-muted-foreground">Semester</Label>
                        <p className="font-medium">{viewDialog.data.semester}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/30 space-y-1">
                        <Label className="text-xs text-muted-foreground">Submitted Date</Label>
                        <p className="font-medium">{viewDialog.data.submittedAt.toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Subjects for Re-Evaluation</Label>
                      <div className="flex flex-wrap gap-2">
                        {viewDialog.data.subjects.map((s, i) => (
                          <Badge key={i} variant="secondary" className="text-sm">{s}</Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Reason for Re-Evaluation</Label>
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <p className="text-sm leading-relaxed">{viewDialog.data.reason}</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 pt-4">
                      <Button className="flex-1 gap-2" onClick={() => viewDialog.close()}>
                        <CheckCircle className="h-4 w-4" />
                        Approve Request
                      </Button>
                      <Button variant="destructive" className="flex-1 gap-2" onClick={() => viewDialog.close()}>
                        <XCircle className="h-4 w-4" />
                        Reject Request
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="marks" className="m-0">
                    {answerSheetData ? (
                      <MarksBreakdown subjects={answerSheetData.subjects} />
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No marks breakdown available for this request</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="answersheet" className="m-0">
                    {answerSheetData ? (
                      <AnswerSheetViewer subjects={answerSheetData.subjects} />
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No answer sheets available for this request</p>
                      </div>
                    )}
                  </TabsContent>
                </div>
              </div>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
