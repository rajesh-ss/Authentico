import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import IssuanceFlow from "./pages/IssuanceFlow";
import RequestReEvaluation from "./pages/RequestReEvaluation";
import MyReEvaluations from "./pages/MyReEvaluations";
import UserManagement from "./pages/UserManagement";
import ReEvaluationsAdmin from "./pages/ReEvaluationsAdmin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/issue/*" element={<IssuanceFlow />} />
            <Route path="/request-reevaluation" element={<RequestReEvaluation />} />
            <Route path="/my-reevaluations" element={<MyReEvaluations />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/reevaluations" element={<ReEvaluationsAdmin />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
