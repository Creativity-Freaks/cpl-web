import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import AboutPage from "./pages/About";
import Gallery from "./pages/Gallery";
import TournamentPage from "./pages/TournamentPage";
import TournamentDetails from "./pages/TournamentDetails";
import Matches from "./pages/Matches";
import ErrorBoundary from "@/components/ErrorBoundary";
import MatchCenter from "./pages/MatchCenter";
import Team from "./pages/Team";
import TeamDepartment from "./pages/TeamDepartment";
import ContactPage from "./pages/ContactPage";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/RegisterPage";
import ForgotPassword from "./pages/ForgotPassword";
import Settings from "./pages/Settings";
import ChangePassword from "./pages/ChangePassword";
import Admin from "./pages/Admin";
import PlayerDashboard from "./pages/PlayerDashboard";
import Auction from "./pages/Auction";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import Rules from "./pages/Rules";



const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/tournament" element={<TournamentPage />} />
            <Route path="/tournament/:id" element={<TournamentDetails />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/match/:tournamentId/:matchId" element={<MatchCenter />} />
            <Route path="/team" element={<Team />} />
            <Route path="/team/:dept" element={<TeamDepartment />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/rules" element={<Rules />} />

            <Route path="/admin/*" element={<Admin />} />
            <Route path="/dashboard" element={<PlayerDashboard />} />
            <Route path="/auction" element={<Auction />} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </ErrorBoundary>
        </BrowserRouter>
      
    </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
