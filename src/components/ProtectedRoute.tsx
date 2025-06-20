import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // For now, we'll just render the children without authentication check
  // In a real app, you'd check authentication status here
  return <>{children}</>;
};

export default ProtectedRoute;
