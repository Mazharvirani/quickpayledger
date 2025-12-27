import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { AppProvider } from "@/context/AppContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Inventory from "@/pages/Inventory";
import Invoices from "@/pages/Invoices";
import CreateInvoice from "@/pages/CreateInvoice";
import ViewInvoice from "@/pages/ViewInvoice";
import Settings from "@/pages/Settings";
import Auth from "@/pages/Auth";
import ResetPassword from "@/pages/ResetPassword";
import NotFound from "./pages/NotFound";
import AuthCallback from '@/pages/AuthCallBack';


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <AppProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<Dashboard />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/invoices" element={<Invoices />} />
                <Route path="/invoices/new" element={<CreateInvoice />} />
                <Route path="/invoices/:id" element={<ViewInvoice />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
              <Route path="*" element={<NotFound />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
