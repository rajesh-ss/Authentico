import React, { useState, useCallback, useMemo, ReactNode } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { FilterBar, DataTable, ConfirmDialog, MobileCard, StatusBadge, StatsGrid, type Column, type StatusType } from '@/components/shared';
import { useDialog } from '@/hooks/useDialog';
import { useSearch } from '@/hooks/useSearch';
import { Clock, CheckCircle, XCircle, Eye, AlertCircle, LucideIcon } from 'lucide-react';
import { toast } from 'sonner';

export interface ApprovalItem {
  id: string;
  studentName: string;
  studentId: string;
  semester: string;
  subjects: string[];
  status: StatusType;
  submittedAt: Date;
  reason?: string;
}

interface StatConfig {
  icon: LucideIcon;
  value: number;
  label: string;
  color: 'warning' | 'accent' | 'success' | 'destructive';
}

interface ApprovalListProps<T extends ApprovalItem> {
  title: string;
  subtitle: string;
  data: T[];
  setData: React.Dispatch<React.SetStateAction<T[]>>;
  searchFields?: (keyof T)[];
  filterField?: keyof T;
  filterOptions: Array<{ value: string; label: string }>;
  stats?: StatConfig[];
  renderViewContent?: (item: T) => ReactNode;
  renderCustomColumns?: () => Column<T>[];
  showActionButtons?: boolean;
  onApprove?: (item: T, comment: string) => void;
  onReject?: (item: T, comment: string) => void;
}

export function ApprovalList<T extends ApprovalItem>({
  title,
  subtitle,
  data,
  setData,
  searchFields = ['studentName', 'studentId', 'id'] as (keyof T)[],
  filterField = 'status' as keyof T,
  filterOptions,
  stats,
  renderViewContent,
  renderCustomColumns,
  showActionButtons = true,
  onApprove,
  onReject,
}: ApprovalListProps<T>) {
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [actionComment, setActionComment] = useState('');

  const viewDialog = useDialog<T>();
  const actionDialog = useDialog<T>();

  const { searchQuery, setSearchQuery, filterValue, setFilterValue, filteredData } = useSearch({
    data,
    searchFields,
    filterField,
  });

  const openActionDialog = useCallback((item: T, action: 'approve' | 'reject') => {
    setActionType(action);
    setActionComment('');
    actionDialog.open(item);
  }, [actionDialog]);

  const handleAction = useCallback(() => {
    if (!actionDialog.data || !actionType) return;
    
    if (actionType === 'approve' && onApprove) {
      onApprove(actionDialog.data, actionComment);
    } else if (actionType === 'reject' && onReject) {
      onReject(actionDialog.data, actionComment);
    }
    
    setData(prev => prev.filter(item => item.id !== actionDialog.data!.id));
    actionDialog.close();
    toast.success(`Request ${actionDialog.data.id} ${actionType === 'approve' ? 'approved' : 'rejected'}`);
  }, [actionDialog, actionType, actionComment, onApprove, onReject, setData]);

  const defaultColumns: Column<T>[] = useMemo(() => [
    { key: 'id', header: 'ID', render: (r) => <span className="font-mono text-sm">{r.id}</span> },
    { 
      key: 'student', 
      header: 'Student', 
      render: (r) => (
        <div>
          <p className="font-medium">{r.studentName}</p>
          <p className="text-xs text-muted-foreground">{r.studentId}</p>
        </div>
      ) 
    },
    { key: 'semester', header: 'Semester', render: (r) => r.semester },
    { 
      key: 'subjects', 
      header: 'Subjects', 
      render: (r) => <span className="text-muted-foreground">{r.subjects.length} subject(s)</span> 
    },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { 
      key: 'submitted', 
      header: 'Submitted', 
      render: (r) => <span className="text-muted-foreground">{r.submittedAt.toLocaleDateString()}</span> 
    },
    { 
      key: 'actions', 
      header: 'Actions', 
      className: 'text-right', 
      render: (r) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => viewDialog.open(r)}>
            <Eye className="h-4 w-4" />
          </Button>
          {showActionButtons && (
            <>
              <Button variant="ghost" size="icon" onClick={() => openActionDialog(r, 'approve')}>
                <CheckCircle className="h-4 w-4 text-success" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => openActionDialog(r, 'reject')}>
                <XCircle className="h-4 w-4 text-destructive" />
              </Button>
            </>
          )}
        </div>
      )
    },
  ], [viewDialog, openActionDialog, showActionButtons]);

  const columns = renderCustomColumns ? renderCustomColumns() : defaultColumns;

  return (
    <DashboardLayout title={title} subtitle={subtitle}>
      {stats && stats.length > 0 && <StatsGrid stats={stats} columns={Math.min(stats.length, 4)} />}

      <FilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by student name or ID..."
        filters={[{ value: filterValue, onChange: setFilterValue, options: filterOptions, placeholder: 'Status' }]}
      />

      {/* Desktop Table */}
      <div className="hidden md:block">
        <DataTable 
          data={filteredData} 
          columns={columns} 
          title={`${title} (${filteredData.length})`} 
          keyExtractor={(r) => r.id} 
          emptyMessage="No requests found" 
        />
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filteredData.map(item => (
          <MobileCard
            key={item.id}
            header={
              <div className="min-w-0">
                <p className="font-mono text-xs text-muted-foreground">{item.id}</p>
                <p className="font-medium truncate">{item.studentName}</p>
                <p className="text-xs text-muted-foreground">{item.semester}</p>
              </div>
            }
            badges={<StatusBadge status={item.status} size="sm" />}
            footer={<span className="text-xs text-muted-foreground">{item.submittedAt.toLocaleDateString()}</span>}
            actions={
              <>
                <DropdownMenuItem onClick={() => viewDialog.open(item)}>View Details</DropdownMenuItem>
                {showActionButtons && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => openActionDialog(item, 'approve')} className="text-success">
                      Approve
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openActionDialog(item, 'reject')} className="text-destructive">
                      Reject
                    </DropdownMenuItem>
                  </>
                )}
              </>
            }
          />
        ))}
      </div>

      {/* View Dialog - uses renderViewContent if provided */}
      {viewDialog.data && renderViewContent && (
        <div className="hidden">
          {/* Dialog is controlled externally via renderViewContent */}
        </div>
      )}

      {/* Action Dialog */}
      <ConfirmDialog 
        open={actionDialog.isOpen} 
        onOpenChange={(open) => !open && actionDialog.close()} 
        title={`${actionType === 'approve' ? 'Approve' : 'Reject'} Request`}
        onConfirm={handleAction} 
        confirmLabel={actionType === 'approve' ? 'Approve' : 'Reject'} 
        variant={actionType === 'approve' ? 'default' : 'destructive'}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <AlertCircle className={`h-5 w-5 ${actionType === 'approve' ? 'text-success' : 'text-destructive'}`} />
            <div>
              <p className="font-medium text-sm">{actionDialog.data?.id}</p>
              <p className="text-xs text-muted-foreground">{actionDialog.data?.studentName}</p>
            </div>
          </div>
          <div>
            <Label>Comment (optional)</Label>
            <Textarea 
              value={actionComment} 
              onChange={(e) => setActionComment(e.target.value)} 
              rows={3} 
              className="mt-1" 
              placeholder="Add any comments or feedback..."
            />
          </div>
        </div>
      </ConfirmDialog>
    </DashboardLayout>
  );
}
