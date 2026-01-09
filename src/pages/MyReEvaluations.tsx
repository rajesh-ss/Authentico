import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RequestsList, RequestDetails } from '@/components/reevaluation/RequestsList';
import { mockReEvaluations } from '@/data';
import { ReEvaluationRequest } from '@/types/blockchain';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

// Convert mock data to match expected format
const requests: ReEvaluationRequest[] = mockReEvaluations.map(item => ({
  id: item.id,
  marksCardId: item.marksCardId,
  studentId: item.studentId,
  studentName: item.studentName,
  type: 'details_update' as const,
  subjects: item.subjects,
  reason: item.reason,
  supportingDocuments: [],
  status: item.status,
  timeline: [
    {
      id: '1',
      status: item.status,
      timestamp: item.submittedAt,
      actor: item.studentName,
      actorRole: 'Student',
    },
  ],
  createdAt: item.submittedAt,
  updatedAt: item.updatedAt,
}));

export default function MyReEvaluations() {
  const [selectedRequest, setSelectedRequest] = useState<ReEvaluationRequest | null>(null);

  return (
    <DashboardLayout
      title="My Details Updates"
      subtitle="Track your details update requests"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header Actions */}
        {!selectedRequest && (
          <div className="flex justify-end mb-6">
            <Button asChild>
              <Link to="/request-reevaluation">
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Link>
            </Button>
          </div>
        )}

        {/* Content */}
        {selectedRequest ? (
          <RequestDetails
            request={selectedRequest}
            onClose={() => setSelectedRequest(null)}
          />
        ) : (
          <RequestsList
            requests={requests}
            onViewDetails={setSelectedRequest}
          />
        )}
      </div>
    </DashboardLayout>
  );
}