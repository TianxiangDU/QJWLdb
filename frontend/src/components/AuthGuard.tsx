import { Navigate, useLocation } from 'react-router-dom';
import { isLoggedIn } from '../utils/auth';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const location = useLocation();
  
  if (!isLoggedIn()) {
    // 未登录，重定向到登录页，保存当前路径
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}


