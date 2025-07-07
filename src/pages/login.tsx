import React, { useState, useEffect } from "react";
import { Box, Button, Input, Page, Text, useNavigate } from "zmp-ui";
import bg from "@/static/bg.svg";
import { login, isAuthenticated } from "@/services/auth";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Check if user is already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/");
    }
  }, [navigate]);

  const handleLogin = async () => {
    try {
      // Validate inputs
      if (!email || !password) {
        setError("Vui lòng nhập email và mật khẩu");
        return;
      }

      setIsLoading(true);
      setError("");

      const response = await login({ email, password });

      setToastMessage(response.message || "Đăng nhập thành công");
      setShowToast(true);

      // Navigate to dashboard after successful login
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error?.message || "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Implement Google login logic here
    setToastMessage("Tính năng đăng nhập bằng Google đang được phát triển");
    setShowToast(true);
  };

  const handleRegister = () => {
    // Implement registration navigation
    setToastMessage("Tính năng đăng ký đang được phát triển");
    setShowToast(true);
  };

  return (
    <Page
      className="flex flex-col items-center justify-center bg-white min-h-screen py-8"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      hideScrollbar={false}
    >
      <Box className="w-full max-w-md px-6 bg-white bg-opacity-90 rounded-lg py-6">
        {/* App Name */}
        <Box className="flex items-center justify-center mb-8">
          <Text className="text-blue-600 text-2xl font-bold">Ôn Thi Pro</Text>
        </Box>

        {/* Login Header */}
        <Box className="text-center mb-8">
          <Text className="text-2xl font-bold">Đăng nhập</Text>
          <Text className="text-gray-500 mt-1 text-sm">
            Nhập thông tin đăng nhập của bạn để tiếp tục
          </Text>
        </Box>

        <Box className="space-y-5">
          {/* Email Field */}
          <Box>
            <Text className="block mb-2 text-sm">Email</Text>
            <Input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-blue-50 border-none"
            />
          </Box>

          {/* Password Field */}
          <Box>
            <Box className="flex justify-between mb-2">
              <Text className="text-sm">Mật khẩu</Text>
              <Text className="text-blue-600 text-sm cursor-pointer">
                Quên mật khẩu?
              </Text>
            </Box>
            <Box className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg bg-blue-50 border-none"
              />
              <Box
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" />
                  <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
                </svg>
              </Box>
            </Box>
          </Box>

          {/* Remember Me Checkbox */}
          <Box className="flex items-center">
            <input
              type="checkbox"
              id="remember-me"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-blue-600"
            />
            <label htmlFor="remember-me" className="ml-2 text-sm text-gray-700">
              Ghi nhớ đăng nhập
            </label>
          </Box>

          {/* Login Button */}
          {error && (
            <Box className="bg-red-50 text-red-600 p-2 rounded-lg text-sm mb-2">
              {error}
            </Box>
          )}

          <Button
            variant="primary"
            fullWidth
            onClick={handleLogin}
            className="h-12 rounded-lg font-medium"
            loading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? "Đang xử lý..." : "Đăng nhập"}
          </Button>

          {/* Divider */}
          <Box className="relative my-4">
            <Box className="absolute inset-0 flex items-center">
              <Box className="w-full border-t border-gray-300"></Box>
            </Box>
            <Box className="relative flex justify-center text-sm">
              <Box className="px-2 bg-white text-gray-500">
                HOẶC ĐĂNG NHẬP VỚI
              </Box>
            </Box>
          </Box>

          {/* Google Login Button */}
          <Button
            variant="secondary"
            fullWidth
            onClick={handleGoogleLogin}
            className="h-12 rounded-lg border border-gray-300 bg-white text-black flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 48 48"
            >
              <path
                fill="#FFC107"
                d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
              ></path>
              <path
                fill="#FF3D00"
                d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
              ></path>
              <path
                fill="#4CAF50"
                d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
              ></path>
              <path
                fill="#1976D2"
                d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
              ></path>
            </svg>
            <Text className="ml-2">Đăng nhập với Google</Text>
          </Button>

          {/* Register Link */}
          <Box className="text-center mt-6">
            <Text className="text-sm">
              Chưa có tài khoản?{" "}
              <Text
                className="text-blue-600 font-medium cursor-pointer"
                onClick={handleRegister}
              >
                Đăng ký
              </Text>
            </Text>
          </Box>
        </Box>
      </Box>

      {/* Footer */}
      <Box className="mt-auto pb-4 text-center text-gray-500 text-xs">
        © 2025 Ôn Thi Pro. All rights reserved.
      </Box>

      {/* Toast notification */}
      {showToast && (
        <Box className="fixed bottom-10 left-0 right-0 mx-auto w-4/5 bg-gray-800 text-white p-3 rounded-lg text-center z-50">
          {toastMessage}
        </Box>
      )}
    </Page>
  );
}

export default LoginPage;
