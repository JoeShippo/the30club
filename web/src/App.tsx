import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ProtectedRoute } from './components/ProtectedRoute';
import { OnboardingModal } from './components/OnboardingModal';
import { useOnboarding } from './hooks/useOnboarding';
import { useAuth } from './auth/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { HomePage } from './pages/HomePage';
import { AddPlantPage } from './pages/AddPlantPage';
//import { LeaderboardPage } from './pages/LeaderboardPage';
import { ProfilePage } from './pages/ProfilePage';
//import { LeaguesPage } from './pages/LeaguesPage';
import { LeagueDetailPage } from './pages/LeagueDetailPage';
//import { ChallengesPage } from './pages/ChallengesPage';
import { ClubPage } from './pages/ClubPage';
import { StatsPage } from './pages/StatsPage';
import { NotFoundPage } from './pages/NotFoundPage';

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from './services/analytics';

function AppRoutes() {
  const { currentUser } = useAuth();
  const { showOnboarding, checking, completeOnboarding } = useOnboarding(currentUser); // ← Changed from currentUser?.id to currentUser
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  if (checking) return null;

  return (
    <>
      {currentUser && showOnboarding && (
        <OnboardingModal
          onComplete={(name, avatarId) =>
            completeOnboarding(name, avatarId, currentUser.id)
          }
        />
      )}

      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* Protected routes */}
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
  <Route path="/add" element={<ProtectedRoute><AddPlantPage /></ProtectedRoute>} />
  <Route path="/stats" element={<ProtectedRoute><StatsPage /></ProtectedRoute>} />
  <Route path="/club" element={<ProtectedRoute><ClubPage /></ProtectedRoute>} /> {/* ← New */}
  <Route path="/club/leagues/:leagueId" element={<ProtectedRoute><LeagueDetailPage /></ProtectedRoute>} />
  <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
  
  {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;