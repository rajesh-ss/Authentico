import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RequestsList, RequestDetails } from '@/components/reevaluation/RequestsList';
import { useReEvaluation } from '@/hooks/useReEvaluation';
import { ReEvaluationRequest } from '@/types/blockchain';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MyReEvaluations() {
  const { requests } = useReEvaluation();
  const [selectedRequest, setSelectedRequest] = useState<ReEvaluationRequest | null>(null);

  return (
    <DashboardLayout
      title="My Re-Evaluations"
      subtitle="Track your re-evaluation requests"
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
