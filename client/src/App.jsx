import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import LandingPage from "./pages/LandingPage";
import AdminDashboard from "./pages/AdminDashboard";
import SchoolAssessment from "./components/SchoolAssessment";
import GenerateReport from './components/GenerateReport';
import StudentSavedReport from './pages/Student-saved-report';


// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-emerald-600 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

// Public Route Component (redirects if already authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading, isAdmin } = useAuth();
  
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-emerald-600 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }
  
  // If already authenticated, send admins to /admin and students to /landing
  if (isAuthenticated) {
    return <Navigate to={isAdmin() ? "/admin" : "/landing"} replace />;
  }
  
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={
        <PublicRoute>
          <AuthPage />
        </PublicRoute>
      } />
      <Route path="/landing" element={
        <ProtectedRoute>
          <LandingPage />
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/SchoolAssessment" element={<SchoolAssessment/>} />
      <Route path="/generate-report" element={<GenerateReport />} />
      <Route path="/saved-reports" element={<StudentSavedReport />} />

      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
