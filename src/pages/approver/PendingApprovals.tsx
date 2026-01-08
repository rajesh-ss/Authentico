import { useState } from 'react';
import { ApprovalList, type ApprovalItem } from '@/components/approvals';
import { mockReEvaluations, type ReEvaluationItem } from '@/data';
import { Clock, AlertCircle } from 'lucide-react';

export default function PendingApprovals() {
  const [requests, setRequests] = useState<ReEvaluationItem[]>(
    mockReEvaluations.filter(r => r.status === 'submitted' || r.status === 'under_review')
  );

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
    <ApprovalList
      title="Pending Approvals"
      subtitle="Review and approve re-evaluation requests"
      data={requests as (ReEvaluationItem & ApprovalItem)[]}
      setData={setRequests as any}
      stats={stats}
      filterOptions={filterOptions}
    />
  );
}
