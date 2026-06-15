import { BrowserRouter, Route, Routes, Navigate } from 'react-router';
import Signup from './pages/auth/Signup';
import Login from './pages/auth/Login';
import NotFound from './pages/NotFound';
import PageLayout from './layouts/PageLayout';
import Lobby from './pages/Lobby';
import AuthLayout from './layouts/AuthLayout';
import ProtectedRoute from './components/ProtectedRoute';
import GameLayout from './layouts/GameLayout';
import GamePage from './pages/GamePage';
import ProfilePage from './pages/Profile';
import GameContextProvider from './context/game/GameContextProvider';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/auth/login" replace />} />

        {/* Public Routes */}
        <Route path="auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
        </Route>

        {/* Private Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<PageLayout />}>
            <Route path="lobby" element={<Lobby />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Game Route */}
          <Route element={<GameLayout />}>
            <Route
              path="game/:roomId"
              element={
                <GameContextProvider>
                  <GamePage />
                </GameContextProvider>
              }
            />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
