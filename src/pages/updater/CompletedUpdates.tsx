import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { FilterBar, DataTable, FormDialog, MobileCard, StatsGrid, type Column } from '@/components/shared';
import { useDialog } from '@/hooks/useDialog';
import { useSearch } from '@/hooks/useSearch';
import { CheckCircle2, Eye, Calendar, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

interface CompletedUpdate {
  id: string;
  studentName: string;
  regNo: string;
  subject: string;
  oldMarks: number;
  newMarks: number;
  completedAt: Date;
  updatedBy: string;
}

const completedUpdates: CompletedUpdate[] = [
  { id: 'UPD-2024-100', studentName: 'Amit Kumar', regNo: '2021CS1012', subject: 'Operating Systems', oldMarks: 45, newMarks: 52, completedAt: new Date(Date.now() - 3600000), updatedBy: 'Mr. James Wilson' },
  { id: 'UPD-2024-099', studentName: 'Sneha Reddy', regNo: '2021CS1078', subject: 'Software Engineering', oldMarks: 38, newMarks: 44, completedAt: new Date(Date.now() - 7200000), updatedBy: 'Mr. James Wilson' },
  { id: 'UPD-2024-098', studentName: 'Karan Malhotra', regNo: '2021CS1034', subject: 'Web Development', oldMarks: 55, newMarks: 62, completedAt: new Date(Date.now() - 86400000), updatedBy: 'Mr. James Wilson' },
  { id: 'UPD-2024-097', studentName: 'Neha Gupta', regNo: '2021CS1056', subject: 'Algorithms', oldMarks: 41, newMarks: 48, completedAt: new Date(Date.now() - 172800000), updatedBy: 'Mr. James Wilson' },
];

export default function CompletedUpdates() {
  const [updates] = useState(completedUpdates);
  const viewDialog = useDialog<CompletedUpdate>();

  const { searchQuery, setSearchQuery, filteredData } = useSearch({
    data: updates,
    searchFields: ['studentName', 'regNo', 'id', 'subject'],
  });

  const totalIncrease = updates.reduce((acc, u) => acc + (u.newMarks - u.oldMarks), 0);
  
  const stats = [
    { icon: CheckCircle2, value: updates.length, label: 'Completed Updates', color: 'success' as const },
    { icon: TrendingUp, value: `+${totalIncrease}`, label: 'Total Marks Added', color: 'accent' as const },
    { icon: Calendar, value: updates.filter(u => {
      const today = new Date();
      return u.completedAt.toDateString() === today.toDateString();
    }).length, label: 'Completed Today', color: 'primary' as const },
  ];

  const columns: Column<CompletedUpdate>[] = [
    { key: 'id', header: 'ID', render: (r) => <span className="font-mono text-sm">{r.id}</span> },
    { key: 'student', header: 'Student', render: (r) => <div><p className="font-medium">{r.studentName}</p><p className="text-xs text-muted-foreground">{r.regNo}</p></div> },
    { key: 'subject', header: 'Subject', render: (r) => r.subject },
    { key: 'marks', header: 'Marks Change', render: (r) => (
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">{r.oldMarks}</span>
        <span className="text-muted-foreground">→</span>
        <span className="font-medium text-success">{r.newMarks}</span>
        <Badge variant="success" className="text-xs">+{r.newMarks - r.oldMarks}</Badge>
      </div>
    )},
    { key: 'completed', header: 'Completed', render: (r) => <span className="text-muted-foreground">{format(r.completedAt, 'MMM d, h:mm a')}</span> },
    { key: 'actions', header: 'Actions', className: 'text-right', render: (r) => (
      <Button variant="ghost" size="icon" onClick={() => viewDialog.open(r)}><Eye className="h-4 w-4" /></Button>
    )},
  ];

  return (
    <DashboardLayout title="Completed Updates" subtitle="View all completed mark updates">
      <StatsGrid stats={stats} columns={3} />

      <FilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search completed updates..."
      />

      {/* Desktop Table */}
      <div className="hidden md:block">
        <DataTable data={filteredData} columns={columns} title="Completed Updates" keyExtractor={(r) => r.id} emptyMessage="No completed updates" />
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filteredData.map(update => (
          <MobileCard
            key={update.id}
            header={
              <div className="min-w-0">
                <p className="font-mono text-xs text-muted-foreground">{update.id}</p>
                <p className="font-medium truncate">{update.studentName}</p>
                <p className="text-xs text-muted-foreground">{update.subject}</p>
              </div>
            }
            badges={<Badge variant="success">+{update.newMarks - update.oldMarks}</Badge>}
            footer={<span className="text-xs text-muted-foreground">{format(update.completedAt, 'MMM d, h:mm a')}</span>}
            actions={<DropdownMenuItem onClick={() => viewDialog.open(update)}>View Details</DropdownMenuItem>}
          />
        ))}
      </div>

      {/* View Dialog */}
      <FormDialog open={viewDialog.isOpen} onOpenChange={(open) => !open && viewDialog.close()} title="Update Details" description={`ID: ${viewDialog.data?.id}`} onSubmit={viewDialog.close} submitLabel="Close" maxWidth="md">
        {viewDialog.data && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-xs text-muted-foreground">Student</Label><p className="font-medium text-sm">{viewDialog.data.studentName}</p></div>
              <div><Label className="text-xs text-muted-foreground">Registration No</Label><p className="font-mono text-sm">{viewDialog.data.regNo}</p></div>
            </div>
            <div><Label className="text-xs text-muted-foreground">Subject</Label><p className="font-medium text-sm">{viewDialog.data.subject}</p></div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <Label className="text-xs text-muted-foreground">Previous</Label>
                  <p className="text-2xl font-bold">{viewDialog.data.oldMarks}</p>
                </div>
                <div className="text-center">
                  <Label className="text-xs text-muted-foreground">Updated</Label>
                  <p className="text-2xl font-bold text-success">{viewDialog.data.newMarks}</p>
                </div>
                <div className="text-center">
                  <Label className="text-xs text-muted-foreground">Change</Label>
                  <p className="text-2xl font-bold text-accent">+{viewDialog.data.newMarks - viewDialog.data.oldMarks}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div><Label className="text-xs text-muted-foreground">Completed At</Label><p className="text-sm">{format(viewDialog.data.completedAt, 'PPp')}</p></div>
              <div><Label className="text-xs text-muted-foreground">Updated By</Label><p className="text-sm">{viewDialog.data.updatedBy}</p></div>
            </div>
          </div>
        )}
      </FormDialog>
    </DashboardLayout>
  );
}
