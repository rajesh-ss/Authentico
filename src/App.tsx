import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { GenerationProvider } from "@/contexts/GenerationContext";
import { GeneratingOverlay } from "@/components/generation/GeneratingOverlay";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import IssuanceFlow from "./pages/IssuanceFlow";
import GenerationStatus from "./pages/GenerationStatus";
import RequestReEvaluation from "./pages/RequestReEvaluation";
import MyReEvaluations from "./pages/MyReEvaluations";
import MyMarksCards from "./pages/MyMarksCards";
import VerifyCertificate from "./pages/VerifyCertificate";
import UserManagement from "./pages/UserManagement";
import ReEvaluationsAdmin from "./pages/ReEvaluationsAdmin";
import PendingApprovals from "./pages/approver/PendingApprovals";
import ApprovedRequests from "./pages/approver/ApprovedRequests";
import RejectedRequests from "./pages/approver/RejectedRequests";
import UpdateMarks from "./pages/updater/UpdateMarks";
import CompletedUpdates from "./pages/updater/CompletedUpdates";
import PendingSignatures from "./pages/verifier/PendingSignatures";
import SignedRecords from "./pages/verifier/SignedRecords";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <GenerationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <GeneratingOverlay />
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
              
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </TooltipProvider>
      </GenerationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
