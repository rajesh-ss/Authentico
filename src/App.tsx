import { lazy, Suspense } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { GenerationProvider } from '@/contexts/GenerationContext';
import { GeneratingOverlay } from '@/components/generation/GeneratingOverlay';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Loader2 } from 'lucide-react';

// Lazy load all pages for better performance
const Index = lazy(() => import('./pages/Index'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/auth/Login'));
const IssuanceFlow = lazy(() => import('./pages/IssuanceFlow'));
const GenerationStatus = lazy(() => import('./pages/GenerationStatus'));
const BatchDetails = lazy(() => import('./pages/BatchDetails'));
const RequestReEvaluation = lazy(() => import('./pages/RequestReEvaluation'));
const MyReEvaluations = lazy(() => import('./pages/MyReEvaluations'));
const MyMarksCards = lazy(() => import('./pages/MyMarksCards'));
const VerifyCertificate = lazy(() => import('./pages/VerifyCertificate'));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const ReEvaluationsAdmin = lazy(() => import('./pages/ReEvaluationsAdmin'));
const PendingApprovals = lazy(() => import('./pages/approver/PendingApprovals'));
const ApprovedRequests = lazy(() => import('./pages/approver/ApprovedRequests'));
const RejectedRequests = lazy(() => import('./pages/approver/RejectedRequests'));
const UpdateMarks = lazy(() => import('./pages/updater/UpdateMarks'));
const CompletedUpdates = lazy(() => import('./pages/updater/CompletedUpdates'));
const PendingSignatures = lazy(() => import('./pages/approver/PendingSignatures'));
const SignedRecords = lazy(() => import('./pages/approver/SignedRecords'));
const MakerDetailsApprovals = lazy(() => import('./pages/maker/MakerDetailsApprovals'));
const MakerApproved = lazy(() => import('./pages/maker/MakerApproved'));
const MakerRejected = lazy(() => import('./pages/maker/MakerRejected'));
const Analytics = lazy(() => import('./pages/admin/Analytics'));
const Templates = lazy(() => import('./pages/issuer/Templates'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Inbox = lazy(() => import('./pages/workflow/Inbox'));
const PublicMarksheet = lazy(() => import('./pages/PublicMarksheet'));

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

import { Roles } from '@/types/auth';

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
                <Route path="/auth/login" element={<Login />} />
                <Route path="/verify" element={<VerifyCertificate />} />
                <Route path="/certificate/:rollNo" element={<PublicMarksheet />} />

                {/* Protected Dashboard - All authenticated users */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Maker Routes */}
                <Route
                  element={
                    <ProtectedRoute allowedRoles={[Roles.MAKER]}>
                      <Inbox />
                    </ProtectedRoute>
                  }
                  path="/maker/approvals"
                />

                {/* Checker Routes */}
                <Route
                  element={
                    <ProtectedRoute allowedRoles={[Roles.CHECKER]}>
                      <Inbox />
                    </ProtectedRoute>
                  }
                  path="/checker/approvals"
                />

                {/* Approver Routes */}
                <Route
                  element={
                    <ProtectedRoute allowedRoles={[Roles.APPROVER]}>
                      <Inbox />
                    </ProtectedRoute>
                  }
                  path="/approver/pending"
                />

                {/* Issuer Routes */}
                <Route
                  path="/issue/*"
                  element={
                    <ProtectedRoute allowedRoles={[Roles.ISSUER]}>
                      <IssuanceFlow />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/generation-status"
                  element={
                    <ProtectedRoute allowedRoles={[Roles.ISSUER]}>
                      <GenerationStatus />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/batch/:batchId"
                  element={
                    <ProtectedRoute allowedRoles={[Roles.ISSUER]}>
                      <BatchDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/templates"
                  element={
                    <ProtectedRoute allowedRoles={[Roles.ISSUER]}>
                      <Templates />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cards"
                  element={
                    <ProtectedRoute allowedRoles={[Roles.ISSUER, Roles.ADMIN]}>
                      <MyMarksCards />
                    </ProtectedRoute>
                  }
                />

                {/* Student Routes */}
                <Route
                  path="/my-cards"
                  element={
                    <ProtectedRoute allowedRoles={[Roles.STUDENT]}>
                      <MyMarksCards />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-reevaluations"
                  element={
                    <ProtectedRoute allowedRoles={[Roles.STUDENT]}>
                      <MyReEvaluations />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/request-reevaluation"
                  element={
                    <ProtectedRoute allowedRoles={[Roles.STUDENT]}>
                      <RequestReEvaluation />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/users"
                  element={
                    <ProtectedRoute allowedRoles={[Roles.ADMIN]}>
                      <UserManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reevaluations"
                  element={
                    <ProtectedRoute allowedRoles={[Roles.ADMIN, Roles.CHECKER]}>
                      <ReEvaluationsAdmin />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute allowedRoles={[Roles.ADMIN]}>
                      <Analytics />
                    </ProtectedRoute>
                  }
                />

                {/* Maker Routes */}
                <Route
                  path="/maker/approvals"
                  element={
                    <ProtectedRoute allowedRoles={[Roles.MAKER]}>
                      <Inbox />
                    </ProtectedRoute>
                  }
                />

                {/* Checker Routes */}
                <Route
                  path="/checker/approvals"
                  element={
                    <ProtectedRoute allowedRoles={[Roles.CHECKER]}>
                      <Inbox />
                    </ProtectedRoute>
                  }
                />

                {/* Approver Routes */}
                <Route
                  path="/approver/pending"
                  element={
                    <ProtectedRoute allowedRoles={[Roles.APPROVER]}>
                      <Inbox />
                    </ProtectedRoute>
                  }
                />

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
