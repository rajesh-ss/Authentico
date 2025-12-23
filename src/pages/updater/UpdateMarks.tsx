import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatsGrid, FormDialog } from '@/components/shared';
import { useDialog } from '@/hooks/useDialog';
import { RefreshCcw, CheckCircle2, Clock, User, Edit, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface PendingUpdate {
  id: string;
  studentName: string;
  regNo: string;
  subject: string;
  currentMarks: number;
  approvedAt: Date;
  approvedBy: string;
}

const pendingUpdates: PendingUpdate[] = [
  { id: 'UPD-2024-001', studentName: 'Rahul Verma', regNo: '2021CS1089', subject: 'Data Structures', currentMarks: 35, approvedAt: new Date(Date.now() - 86400000), approvedBy: 'Dr. Emily Davis' },
  { id: 'UPD-2024-002', studentName: 'Priya Sharma', regNo: '2021CS1045', subject: 'Database Management', currentMarks: 42, approvedAt: new Date(Date.now() - 172800000), approvedBy: 'Prof. Robert Chen' },
  { id: 'UPD-2024-003', studentName: 'Ananya Patel', regNo: '2021CS1023', subject: 'Machine Learning', currentMarks: 48, approvedAt: new Date(Date.now() - 259200000), approvedBy: 'Dr. Emily Davis' },
  { id: 'UPD-2024-004', studentName: 'Vikram Singh', regNo: '2021CS1067', subject: 'Computer Networks', currentMarks: 38, approvedAt: new Date(Date.now() - 345600000), approvedBy: 'Prof. Robert Chen' },
];

export default function UpdateMarks() {
  const [updates, setUpdates] = useState(pendingUpdates);
  const [newMarks, setNewMarks] = useState<number>(0);
  const updateDialog = useDialog<PendingUpdate>();

  const stats = [
    { icon: Clock, value: updates.length, label: 'Pending Updates', color: 'warning' as const },
    { icon: CheckCircle2, value: 12, label: 'Completed Today', color: 'success' as const },
    { icon: RefreshCcw, value: 156, label: 'Total This Month', color: 'primary' as const },
  ];

  const openUpdateDialog = (update: PendingUpdate) => {
    setNewMarks(update.currentMarks);
    updateDialog.open(update);
  };

  const handleUpdate = () => {
    if (!updateDialog.data) return;
    setUpdates(updates.filter(u => u.id !== updateDialog.data!.id));
    updateDialog.close();
    toast.success(`Marks updated for ${updateDialog.data.studentName}`);
  };

  return (
    <DashboardLayout title="Update Marks" subtitle="Process approved re-evaluation mark updates">
      <StatsGrid stats={stats} columns={3} />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold">Pending Updates</CardTitle>
          <Badge variant="warning">{updates.length} pending</Badge>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {updates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-success" />
                <p>All updates completed!</p>
              </div>
            ) : (
              updates.map((update) => (
                <div key={update.id} className="border rounded-lg p-4 hover:border-accent/50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <Badge variant="outline" className="font-mono">{update.id}</Badge>
                        <span className="text-xs text-muted-foreground">Approved {format(update.approvedAt, 'MMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-4 mb-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-foreground">{update.studentName}</span>
                        </div>
                        <span className="text-sm text-muted-foreground font-mono">{update.regNo}</span>
                      </div>
                      <div className="flex items-center gap-4 flex-wrap">
                        <Badge variant="secondary">{update.subject}</Badge>
                        <span className="text-sm text-muted-foreground">Current: <span className="font-medium text-foreground">{update.currentMarks}</span> marks</span>
                      </div>
                    </div>
                    <Button onClick={() => openUpdateDialog(update)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Update Marks
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Update Dialog */}
      <FormDialog 
        open={updateDialog.isOpen} 
        onOpenChange={(open) => !open && updateDialog.close()} 
        title="Update Marks" 
        description={`Update marks for ${updateDialog.data?.studentName}`}
        onSubmit={handleUpdate}
        submitLabel="Update Marks"
        maxWidth="md"
      >
        {updateDialog.data && (
          <div className="space-y-6">
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-xs text-muted-foreground">Student</Label>
                  <p className="font-medium">{updateDialog.data.studentName}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Registration No</Label>
                  <p className="font-mono">{updateDialog.data.regNo}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-xs text-muted-foreground">Subject</Label>
                  <p className="font-medium">{updateDialog.data.subject}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <Label className="text-xs text-muted-foreground">Current Marks</Label>
                <p className="text-3xl font-bold text-foreground">{updateDialog.data.currentMarks}</p>
              </div>
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
              <div className="text-center">
                <Label className="text-xs text-muted-foreground">New Marks</Label>
                <Input 
                  type="number" 
                  value={newMarks} 
                  onChange={(e) => setNewMarks(Number(e.target.value))}
                  className="text-3xl font-bold text-center w-24 h-14 text-success"
                  min={0}
                  max={100}
                />
              </div>
            </div>

            {newMarks !== updateDialog.data.currentMarks && (
              <div className="text-center p-3 bg-success/10 rounded-lg">
                <span className="text-sm text-success font-medium">
                  Change: {newMarks > updateDialog.data.currentMarks ? '+' : ''}{newMarks - updateDialog.data.currentMarks} marks
                </span>
              </div>
            )}
          </div>
        )}
      </FormDialog>
    </DashboardLayout>
  );
}
