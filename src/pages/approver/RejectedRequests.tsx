import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { FilterBar, DataTable, FormDialog, MobileCard, StatusBadge, StatsGrid, type Column } from '@/components/shared';
import { mockReEvaluations, type ReEvaluationItem } from '@/data';
import { useDialog } from '@/hooks/useDialog';
import { useSearch } from '@/hooks/useSearch';
import { XCircle, Eye, Calendar } from 'lucide-react';

export default function RejectedRequests() {
  const [requests] = useState<ReEvaluationItem[]>(
    mockReEvaluations.filter(r => r.status === 'rejected')
  );

  const viewDialog = useDialog<ReEvaluationItem>();

  const { searchQuery, setSearchQuery, filteredData } = useSearch({
    data: requests,
    searchFields: ['studentName', 'studentId', 'id'],
  });

  const stats = [
    { icon: XCircle, value: requests.length, label: 'Rejected Requests', color: 'destructive' as const },
    { icon: Calendar, value: requests.filter(r => {
      const today = new Date();
      return r.updatedAt.toDateString() === today.toDateString();
    }).length, label: 'Rejected Today', color: 'warning' as const },
  ];

  const columns: Column<ReEvaluationItem>[] = [
    { key: 'id', header: 'ID', render: (r) => <span className="font-mono text-sm">{r.id}</span> },
    { key: 'student', header: 'Student', render: (r) => <div><p className="font-medium">{r.studentName}</p><p className="text-xs text-muted-foreground">{r.studentId}</p></div> },
    { key: 'semester', header: 'Semester', render: (r) => r.semester },
    { key: 'subjects', header: 'Subjects', render: (r) => <span className="text-muted-foreground">{r.subjects.length} subject(s)</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'rejected', header: 'Rejected On', render: (r) => <span className="text-muted-foreground">{r.updatedAt.toLocaleDateString()}</span> },
    { key: 'actions', header: 'Actions', className: 'text-right', render: (r) => (
      <Button variant="ghost" size="icon" onClick={() => viewDialog.open(r)}><Eye className="h-4 w-4" /></Button>
    )},
  ];

  return (
    <DashboardLayout title="Rejected Requests" subtitle="View all rejected re-evaluation requests">
      <StatsGrid stats={stats} columns={2} />

      <FilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search rejected requests..."
      />

      {/* Desktop Table */}
      <div className="hidden md:block">
        <DataTable data={filteredData} columns={columns} title="Rejected Requests" keyExtractor={(r) => r.id} emptyMessage="No rejected requests" />
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filteredData.map(request => (
          <MobileCard
            key={request.id}
            header={
              <div className="min-w-0">
                <p className="font-mono text-xs text-muted-foreground">{request.id}</p>
                <p className="font-medium truncate">{request.studentName}</p>
                <p className="text-xs text-muted-foreground">{request.semester}</p>
              </div>
            }
            badges={<StatusBadge status={request.status} size="sm" />}
            footer={<span className="text-xs text-muted-foreground">Rejected: {request.updatedAt.toLocaleDateString()}</span>}
            actions={<DropdownMenuItem onClick={() => viewDialog.open(request)}>View Details</DropdownMenuItem>}
          />
        ))}
      </div>

      {/* View Dialog */}
      <FormDialog open={viewDialog.isOpen} onOpenChange={(open) => !open && viewDialog.close()} title="Request Details" description={`ID: ${viewDialog.data?.id}`} onSubmit={viewDialog.close} submitLabel="Close" maxWidth="2xl">
        {viewDialog.data && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-xs text-muted-foreground">Student</Label><p className="font-medium text-sm">{viewDialog.data.studentName}</p></div>
              <div><Label className="text-xs text-muted-foreground">Semester</Label><p className="font-medium text-sm">{viewDialog.data.semester}</p></div>
            </div>
            <div><Label className="text-xs text-muted-foreground">Subjects</Label><div className="flex flex-wrap gap-1 mt-1">{viewDialog.data.subjects.map((s, i) => <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>)}</div></div>
            <div><Label className="text-xs text-muted-foreground">Reason</Label><p className="text-sm bg-muted/50 p-3 rounded-lg mt-1">{viewDialog.data.reason}</p></div>
            <div className="pt-2 border-t">
              <Label className="text-xs text-muted-foreground">Rejected On</Label>
              <p className="font-medium text-sm text-destructive">{viewDialog.data.updatedAt.toLocaleDateString()}</p>
            </div>
          </div>
        )}
      </FormDialog>
    </DashboardLayout>
  );
}
