import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Services from "./pages/Services";
import Works from "./pages/Works";
import Templates from "./pages/Templates";
import TemplateSuccess from "./pages/TemplateSuccess";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import BlogArticle from "./pages/BlogArticle";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import DashboardProjects from "./pages/DashboardProjects";
import DashboardProfile from "./pages/DashboardProfile";
import DashboardPurchases from "./pages/DashboardPurchases";
import DashboardInvoices from "./pages/DashboardInvoices";
import Admin from "./pages/Admin";
import AdminProjects from "./pages/AdminProjects";
import AdminBlog from "./pages/AdminBlog";
import AdminTemplates from "./pages/AdminTemplates";
import ProjectChat from "./pages/ProjectChat";
import Builder from "./pages/Builder";
import BuilderEditor from "./pages/BuilderEditor";
import PublishedProject from "./pages/PublishedProject";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/services" element={<Services />} />
                <Route path="/works" element={<Works />} />
                <Route path="/templates" element={<Templates />} />
                <Route path="/templates/success" element={<TemplateSuccess />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogArticle />} />
                <Route path="/auth" element={<Auth />} />
                
                {/* Protected dashboard routes */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/dashboard/projects" element={<ProtectedRoute><DashboardProjects /></ProtectedRoute>} />
                <Route path="/dashboard/profile" element={<ProtectedRoute><DashboardProfile /></ProtectedRoute>} />
                <Route path="/dashboard/purchases" element={<ProtectedRoute><DashboardPurchases /></ProtectedRoute>} />
                <Route path="/dashboard/invoices" element={<ProtectedRoute><DashboardInvoices /></ProtectedRoute>} />
                <Route path="/dashboard/project/:projectId/chat" element={<ProtectedRoute><ProjectChat /></ProtectedRoute>} />
                
                {/* Builder routes */}
                <Route path="/builder" element={<ProtectedRoute><Builder /></ProtectedRoute>} />
                <Route path="/builder/:projectId" element={<ProtectedRoute><BuilderEditor /></ProtectedRoute>} />
                
                {/* Published projects (public) */}
                <Route path="/p/:subdomain" element={<PublishedProject />} />
                
                {/* Admin only routes */}
                <Route path="/admin" element={<ProtectedRoute requireAdmin><Admin /></ProtectedRoute>} />
                <Route path="/admin/projects" element={<ProtectedRoute requireAdmin><AdminProjects /></ProtectedRoute>} />
                <Route path="/admin/blog" element={<ProtectedRoute requireAdmin><AdminBlog /></ProtectedRoute>} />
                <Route path="/admin/templates" element={<ProtectedRoute requireAdmin><AdminTemplates /></ProtectedRoute>} />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </HelmetProvider>
);

export default App;
