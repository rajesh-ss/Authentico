import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { FilterBar, DataTable, FormDialog, MobileCard, StatsGrid, type Column } from '@/components/shared';
import { useDialog } from '@/hooks/useDialog';
import { useSearch } from '@/hooks/useSearch';
import { Shield, CheckCircle2, Eye, Calendar, Link as LinkIcon } from 'lucide-react';
import { format } from 'date-fns';

interface SignedRecord {
  id: string;
  studentName: string;
  regNo: string;
  subject: string;
  oldMarks: number;
  newMarks: number;
  signedAt: Date;
  transactionHash: string;
  blockNumber: number;
  signatures: Array<{
    adminName: string;
    timestamp: Date;
  }>;
}

const signedRecords: SignedRecord[] = [
  { 
    id: 'SIG-2024-042', studentName: 'Amit Kumar', regNo: '2021CS1012', 
    subject: 'Operating Systems', oldMarks: 45, newMarks: 52, 
    signedAt: new Date(Date.now() - 86400000), 
    transactionHash: '0x8f4a2c1e9b3d7f0a6c8e2b5d4f1a9c7e3b0d6f8a2c4e6b0d8f2a4c6e8b0d2f4a',
    blockNumber: 18945672,
    signatures: [
      { adminName: 'Dr. Emily Davis', timestamp: new Date(Date.now() - 172800000) },
      { adminName: 'Prof. Robert Chen', timestamp: new Date(Date.now() - 129600000) },
      { adminName: 'Dr. Michael Brown', timestamp: new Date(Date.now() - 86400000) },
    ]
  },
  { 
    id: 'SIG-2024-041', studentName: 'Sneha Reddy', regNo: '2021CS1078', 
    subject: 'Software Engineering', oldMarks: 38, newMarks: 44, 
    signedAt: new Date(Date.now() - 172800000), 
    transactionHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    blockNumber: 18944521,
    signatures: [
      { adminName: 'Dr. Emily Davis', timestamp: new Date(Date.now() - 259200000) },
      { adminName: 'Prof. Robert Chen', timestamp: new Date(Date.now() - 216000000) },
      { adminName: 'Dr. Michael Brown', timestamp: new Date(Date.now() - 172800000) },
    ]
  },
  { 
    id: 'SIG-2024-040', studentName: 'Karan Malhotra', regNo: '2021CS1034', 
    subject: 'Web Development', oldMarks: 55, newMarks: 62, 
    signedAt: new Date(Date.now() - 259200000), 
    transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    blockNumber: 18943210,
    signatures: [
      { adminName: 'Dr. Emily Davis', timestamp: new Date(Date.now() - 345600000) },
      { adminName: 'Prof. Robert Chen', timestamp: new Date(Date.now() - 302400000) },
      { adminName: 'Dr. Michael Brown', timestamp: new Date(Date.now() - 259200000) },
    ]
  },
];

export default function SignedRecords() {
  const [records] = useState(signedRecords);
  const viewDialog = useDialog<SignedRecord>();

  const { searchQuery, setSearchQuery, filteredData } = useSearch({
    data: records,
    searchFields: ['studentName', 'regNo', 'id', 'subject'],
  });

  const stats = [
    { icon: Shield, value: records.length, label: 'Verified Records', color: 'success' as const },
    { icon: CheckCircle2, value: records.reduce((acc, r) => acc + r.signatures.length, 0), label: 'Total Signatures', color: 'primary' as const },
    { icon: Calendar, value: records.filter(r => {
      const today = new Date();
      return r.signedAt.toDateString() === today.toDateString();
    }).length, label: 'Verified Today', color: 'accent' as const },
  ];

  const columns: Column<SignedRecord>[] = [
    { key: 'id', header: 'ID', render: (r) => <span className="font-mono text-sm">{r.id}</span> },
    { key: 'student', header: 'Student', render: (r) => <div><p className="font-medium">{r.studentName}</p><p className="text-xs text-muted-foreground">{r.regNo}</p></div> },
    { key: 'subject', header: 'Subject', render: (r) => r.subject },
    { key: 'marks', header: 'Marks', render: (r) => (
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">{r.oldMarks}</span>
        <span>→</span>
        <span className="text-success font-medium">{r.newMarks}</span>
      </div>
    )},
    { key: 'hash', header: 'Tx Hash', render: (r) => (
      <span className="font-mono text-xs text-accent">{r.transactionHash.slice(0, 10)}...</span>
    )},
    { key: 'signed', header: 'Verified', render: (r) => <span className="text-muted-foreground">{format(r.signedAt, 'MMM d, yyyy')}</span> },
    { key: 'actions', header: 'Actions', className: 'text-right', render: (r) => (
      <Button variant="ghost" size="icon" onClick={() => viewDialog.open(r)}><Eye className="h-4 w-4" /></Button>
    )},
  ];

  return (
    <DashboardLayout title="Signed Records" subtitle="View blockchain-verified records">
      <StatsGrid stats={stats} columns={3} />

      <FilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search verified records..."
      />

      {/* Desktop Table */}
      <div className="hidden md:block">
        <DataTable data={filteredData} columns={columns} title="Verified Records" keyExtractor={(r) => r.id} emptyMessage="No verified records" />
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filteredData.map(record => (
          <MobileCard
            key={record.id}
            header={
              <div className="min-w-0">
                <p className="font-mono text-xs text-muted-foreground">{record.id}</p>
                <p className="font-medium truncate">{record.studentName}</p>
                <p className="text-xs text-muted-foreground">{record.subject}</p>
              </div>
            }
            badges={<Badge variant="success"><Shield className="h-3 w-3 mr-1" />Verified</Badge>}
            footer={<span className="text-xs text-muted-foreground">{format(record.signedAt, 'MMM d, yyyy')}</span>}
            actions={<DropdownMenuItem onClick={() => viewDialog.open(record)}>View Details</DropdownMenuItem>}
          />
        ))}
      </div>

      {/* View Dialog */}
      <FormDialog open={viewDialog.isOpen} onOpenChange={(open) => !open && viewDialog.close()} title="Verified Record" description={`ID: ${viewDialog.data?.id}`} onSubmit={viewDialog.close} submitLabel="Close" maxWidth="lg">
        {viewDialog.data && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-xs text-muted-foreground">Student</Label><p className="font-medium text-sm">{viewDialog.data.studentName}</p></div>
              <div><Label className="text-xs text-muted-foreground">Registration No</Label><p className="font-mono text-sm">{viewDialog.data.regNo}</p></div>
            </div>
            <div><Label className="text-xs text-muted-foreground">Subject</Label><p className="font-medium text-sm">{viewDialog.data.subject}</p></div>
            
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="text-center flex-1">
                  <Label className="text-xs text-muted-foreground">Previous</Label>
                  <p className="text-2xl font-bold">{viewDialog.data.oldMarks}</p>
                </div>
                <div className="text-center flex-1">
                  <Label className="text-xs text-muted-foreground">Updated</Label>
                  <p className="text-2xl font-bold text-success">{viewDialog.data.newMarks}</p>
                </div>
                <div className="text-center flex-1">
                  <Label className="text-xs text-muted-foreground">Change</Label>
                  <p className="text-2xl font-bold text-accent">+{viewDialog.data.newMarks - viewDialog.data.oldMarks}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-5 w-5 text-success" />
                <span className="font-medium text-success">Blockchain Verified</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Transaction Hash</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs">{viewDialog.data.transactionHash.slice(0, 20)}...</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6"><LinkIcon className="h-3 w-3" /></Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Block Number</span>
                  <span className="font-mono">{viewDialog.data.blockNumber}</span>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Signatures ({viewDialog.data.signatures.length})</Label>
              <div className="mt-2 space-y-2">
                {viewDialog.data.signatures.map((sig, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                    <span className="font-medium text-sm">{sig.adminName}</span>
                    <span className="text-xs text-muted-foreground">{format(sig.timestamp, 'MMM d, h:mm a')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </FormDialog>
    </DashboardLayout>
  );
}
