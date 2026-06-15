import { Navigate, Outlet } from 'react-router';
import { useUser } from '../context/user/UseUser';

const ProtectedRoute = () => {
  const { user } = useUser();
  if (!user) return <Navigate to="/auth/login" replace />;
  return <Outlet />;
};

export default ProtectedRoute;
