import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { GenerationProvider } from "@/contexts/GenerationContext";
import { GeneratingOverlay } from "@/components/generation/GeneratingOverlay";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Loader2 } from "lucide-react";

// Lazy load all pages for better performance
const Index = lazy(() => import("./pages/Index"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const IssuanceFlow = lazy(() => import("./pages/IssuanceFlow"));
const GenerationStatus = lazy(() => import("./pages/GenerationStatus"));
const BatchDetails = lazy(() => import("./pages/BatchDetails"));
const RequestReEvaluation = lazy(() => import("./pages/RequestReEvaluation"));
const MyReEvaluations = lazy(() => import("./pages/MyReEvaluations"));
const MyMarksCards = lazy(() => import("./pages/MyMarksCards"));
const VerifyCertificate = lazy(() => import("./pages/VerifyCertificate"));
const UserManagement = lazy(() => import("./pages/UserManagement"));
const ReEvaluationsAdmin = lazy(() => import("./pages/ReEvaluationsAdmin"));
const PendingApprovals = lazy(() => import("./pages/approver/PendingApprovals"));
const ApprovedRequests = lazy(() => import("./pages/approver/ApprovedRequests"));
const RejectedRequests = lazy(() => import("./pages/approver/RejectedRequests"));
const UpdateMarks = lazy(() => import("./pages/updater/UpdateMarks"));
const CompletedUpdates = lazy(() => import("./pages/updater/CompletedUpdates"));
const PendingSignatures = lazy(() => import("./pages/verifier/PendingSignatures"));
const SignedRecords = lazy(() => import("./pages/verifier/SignedRecords"));
const TeacherApprovals = lazy(() => import("./pages/teacher/TeacherApprovals"));
const TeacherApproved = lazy(() => import("./pages/teacher/TeacherApproved"));
const TeacherRejected = lazy(() => import("./pages/teacher/TeacherRejected"));
const Analytics = lazy(() => import("./pages/admin/Analytics"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
  },
});

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <GenerationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <GeneratingOverlay />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/verify" element={<VerifyCertificate />} />
                
                {/* Protected Dashboard - All authenticated users */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                
                {/* Issuer Routes */}
                <Route path="/issue/*" element={
                  <ProtectedRoute allowedRoles={['issuer']}>
                    <IssuanceFlow />
                  </ProtectedRoute>
                } />
                <Route path="/generation-status" element={
                  <ProtectedRoute allowedRoles={['issuer']}>
                    <GenerationStatus />
                  </ProtectedRoute>
                } />
                <Route path="/batch/:batchId" element={
                  <ProtectedRoute allowedRoles={['issuer']}>
                    <BatchDetails />
                  </ProtectedRoute>
                } />
                <Route path="/cards" element={
                  <ProtectedRoute allowedRoles={['issuer', 'college_admin']}>
                    <MyMarksCards />
                  </ProtectedRoute>
                } />
              
              {/* Student Routes */}
              <Route path="/my-cards" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <MyMarksCards />
                </ProtectedRoute>
              } />
              <Route path="/my-reevaluations" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <MyReEvaluations />
                </ProtectedRoute>
              } />
              <Route path="/request-reevaluation" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <RequestReEvaluation />
                </ProtectedRoute>
              } />
              
              {/* Admin Routes */}
              <Route path="/users" element={
                <ProtectedRoute allowedRoles={['college_admin']}>
                  <UserManagement />
                </ProtectedRoute>
              } />
              <Route path="/reevaluations" element={
                <ProtectedRoute allowedRoles={['college_admin', 'reevaluation_approver', 'reevaluation_updater']}>
                  <ReEvaluationsAdmin />
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute allowedRoles={['college_admin']}>
                  <Analytics />
                </ProtectedRoute>
              } />
              
              {/* Approver Routes */}
              <Route path="/approvals" element={
                <ProtectedRoute allowedRoles={['reevaluation_approver']}>
                  <PendingApprovals />
                </ProtectedRoute>
              } />
              <Route path="/approved" element={
                <ProtectedRoute allowedRoles={['reevaluation_approver']}>
                  <ApprovedRequests />
                </ProtectedRoute>
              } />
              <Route path="/rejected" element={
                <ProtectedRoute allowedRoles={['reevaluation_approver']}>
                  <RejectedRequests />
                </ProtectedRoute>
              } />
              
              {/* Updater Routes */}
              <Route path="/update-marks" element={
                <ProtectedRoute allowedRoles={['reevaluation_updater']}>
                  <UpdateMarks />
                </ProtectedRoute>
              } />
              <Route path="/completed" element={
                <ProtectedRoute allowedRoles={['reevaluation_updater']}>
                  <CompletedUpdates />
                </ProtectedRoute>
              } />
              
                {/* Verifier Routes */}
                <Route path="/signatures" element={
                  <ProtectedRoute allowedRoles={['verifying_admin']}>
                    <PendingSignatures />
                  </ProtectedRoute>
                } />
                <Route path="/signed" element={
                  <ProtectedRoute allowedRoles={['verifying_admin']}>
                    <SignedRecords />
                  </ProtectedRoute>
                } />
                
                {/* Teacher Routes */}
                <Route path="/teacher/approvals" element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <TeacherApprovals />
                  </ProtectedRoute>
                } />
                <Route path="/teacher/approved" element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <TeacherApproved />
                  </ProtectedRoute>
                } />
                <Route path="/teacher/rejected" element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <TeacherRejected />
                  </ProtectedRoute>
                } />
                
              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </GenerationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
