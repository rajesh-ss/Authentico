import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ReEvaluationForm } from '@/components/reevaluation/ReEvaluationForm';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { MarksCardOption, ReEvaluationFormData } from '@/types/reevaluation';

// Mock marks cards data for the form
const marksCards: MarksCardOption[] = [
  {
    id: '1',
    semester: 'Semester 6',
    academicYear: '2023-24',
    studentName: 'John Doe',
    rollNo: '101',
    registrationNo: 'REG2024001',
    subjects: [
      { code: 'CS601', name: 'Machine Learning', currentMarks: 72, maxMarks: 100, grade: 'A' },
      { code: 'CS602', name: 'Data Structures', currentMarks: 65, maxMarks: 100, grade: 'B+' },
      { code: 'CS603', name: 'Algorithms', currentMarks: 58, maxMarks: 100, grade: 'B' },
      { code: 'CS604', name: 'Database Systems', currentMarks: 78, maxMarks: 100, grade: 'A' },
      { code: 'CS605', name: 'Computer Networks', currentMarks: 70, maxMarks: 100, grade: 'A' },
    ],
  },
  {
    id: '2',
    semester: 'Semester 5',
    academicYear: '2023-24',
    studentName: 'John Doe',
    rollNo: '101',
    registrationNo: 'REG2024001',
    subjects: [
      { code: 'CS501', name: 'Operating Systems', currentMarks: 68, maxMarks: 100, grade: 'B+' },
      { code: 'CS502', name: 'Software Engineering', currentMarks: 75, maxMarks: 100, grade: 'A' },
      { code: 'CS503', name: 'Web Technologies', currentMarks: 82, maxMarks: 100, grade: 'A+' },
      { code: 'CS504', name: 'Compiler Design', currentMarks: 55, maxMarks: 100, grade: 'B' },
    ],
  },
];

export default function RequestReEvaluation() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const handleSubmit = async (data: ReEvaluationFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const requestId = `REV-2024-${Math.floor(Math.random() * 1000)}`;
      setSubmittedId(requestId);
      toast({
        title: "Request Submitted Successfully",
        description: `Your details update request ${requestId} has been submitted.`,
      });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
      title="Request Details Update"
      subtitle="Submit a request to update your personal details"
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