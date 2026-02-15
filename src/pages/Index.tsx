import { memo } from 'react';
// import { useAuth } from '@/contexts/AuthContext';
// import { Navigate } from 'react-router-dom';
import Login from './auth/Login';

const Index = memo(function Index() {
  // const { isAuthenticated, user } = useAuth();

  // if (isAuthenticated && user && ['ADMIN'].includes(user.role)) {
  //   return <Navigate to="/admin/dashboard" replace />;
  // }

  return <Login />;
});

export default Index;
