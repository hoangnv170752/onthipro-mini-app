import { getSystemInfo } from "zmp-sdk";
import {
  AnimationRoutes,
  App,
  Route,
  ZMPRouter,
  useNavigate,
  useLocation,
  Box,
  Text,
  Button
} from "zmp-ui";
import { AppProps } from "zmp-ui/app";
import { useEffect, useState } from "react";

import HomePage from "@/pages/index";
import LoginPage from "@/pages/login";
import { isAuthenticated } from "@/services/auth";
import ErrorBoundary from "@/components/error-boundary";

// Authentication guard component
const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        setIsChecking(true);
        // Check if user is authenticated - now async
        const authenticated = await isAuthenticated();
        if (!authenticated && location.pathname !== "/login") {
          // Redirect to login page if not authenticated
          navigate("/login");
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        // On error, allow access to prevent blank screens
      } finally {
        setIsChecking(false);
      }
    };

    checkAuthentication();
  }, [navigate, location]);

  // Show loading state while checking authentication
  if (isChecking && location.pathname !== "/login") {
    return (
      <Box className="flex items-center justify-center min-h-screen">
        <Text className="text-gray-500">Đang tải...</Text>
      </Box>
    );
  }

  return <>{children}</>;
};

const Layout = () => {
  const [hasError, setHasError] = useState(false);

  // Add global error handler
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // If there's a global error, show fallback UI
  if (hasError) {
    return (
      <App theme={getSystemInfo().zaloTheme as AppProps["theme"]}>
        <Box className="flex flex-col items-center justify-center min-h-screen p-4 bg-white">
          <Box className="w-16 h-16 mb-4 text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </Box>
          <Text className="text-xl font-bold mb-2">Đã xảy ra lỗi</Text>
          <Text className="text-gray-600 text-center mb-6">
            Ứng dụng gặp sự cố. Vui lòng thử lại.
          </Text>
          <Button 
            onClick={() => window.location.reload()}
            className="px-4 py-2"
          >
            Tải lại ứng dụng
          </Button>
        </Box>
      </App>
    );
  }

  return (
    <ErrorBoundary>
      <App theme={getSystemInfo().zaloTheme as AppProps["theme"]}>
        <Box className="min-h-screen flex flex-col">
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
        </Box>
      </App>
    </ErrorBoundary>
  );
};
export default Layout;
