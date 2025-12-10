import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NotFound from "./pages/NotFound";
import { useAuth } from "@/context/AuthContext";
import { LoginScreen } from "@/components/atm/LoginScreen";
import { Dashboard } from "@/components/atm/Dashboard";
import RegisterUser from "@/pages/RegisterUser";
import Admin from "@/pages/Admin";

const queryClient = new QueryClient();

function RoutesWithAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Dashboard /> : <LoginScreen />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterUser />} />
      <Route path="/admin" element={isAuthenticated ? <Admin /> : <Navigate to="/" replace />} />
      <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <RoutesWithAuth />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
