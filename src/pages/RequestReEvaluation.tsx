import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ReEvaluationForm } from '@/components/reevaluation/ReEvaluationForm';
import { useReEvaluation } from '@/hooks/useReEvaluation';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function RequestReEvaluation() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { marksCards, submitRequest, isLoading } = useReEvaluation();
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const handleSubmit = async (data: Parameters<typeof submitRequest>[0]) => {
    try {
      const request = await submitRequest(data);
      setSubmittedId(request.id);
      toast({
        title: "Request Submitted Successfully",
        description: `Your re-evaluation request ${request.id} has been submitted.`,
      });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your request. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (submittedId) {
    return (
      <DashboardLayout
        title="Re-Evaluation Request"
        subtitle="Request submitted successfully"
      >
        <Card className="max-w-2xl mx-auto border-success/50 bg-gradient-to-br from-success/5 to-success/10">
          <CardContent className="py-12 text-center">
            <div className="h-20 w-20 mx-auto rounded-full bg-success/20 flex items-center justify-center mb-6">
              <CheckCircle className="h-10 w-10 text-success" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Request Submitted!</h2>
            <p className="text-muted-foreground mb-6">
              Your re-evaluation request has been submitted successfully.
              <br />
              Request ID: <span className="font-mono font-bold">{submittedId}</span>
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button variant="outline" asChild>
                <Link to="/my-reevaluations">
                  Track Request
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button asChild>
                <Link to="/dashboard">
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Request Re-Evaluation"
      subtitle="Submit a request to re-evaluate your marks"
    >
      <div className="max-w-3xl mx-auto">
        <ReEvaluationForm
          marksCards={marksCards}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </DashboardLayout>
  );
}
