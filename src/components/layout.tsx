import { getSystemInfo } from "zmp-sdk";
import {
  AnimationRoutes,
  App,
  Route,
  ZMPRouter,
  useNavigate,
  useLocation,
} from "zmp-ui";
import { AppProps } from "zmp-ui/app";
import { useEffect } from "react";

import HomePage from "@/pages/index";
import LoginPage from "@/pages/login";
import { isAuthenticated } from "@/services/auth";

// Authentication guard component
const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated() && location.pathname !== "/login") {
      // Redirect to login page if not authenticated
      navigate("/login");
    }
  }, [navigate, location]);

  return <>{children}</>;
};

const Layout = () => {
  return (
    <App theme={getSystemInfo().zaloTheme as AppProps["theme"]}>
      <ZMPRouter>
        <AnimationRoutes>
          <Route 
            path="/" 
            element={
              <AuthGuard>
                <HomePage />
              </AuthGuard>
            }
          />
          <Route path="/login" element={<LoginPage />} />
        </AnimationRoutes>
      </ZMPRouter>
    </App>
  );
};
export default Layout;
