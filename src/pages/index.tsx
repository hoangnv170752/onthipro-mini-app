import React, { useState, useEffect } from "react";
import { Box, Button, Page, Text, useNavigate } from "zmp-ui";
import Logo from "@/components/logo";
import bg from "@/static/bg.svg";
import { getCurrentUser, formatJoinDate, logout } from "@/services/auth";
import Clock from "@/components/clock";

function HomePage() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<{
    name: string;
    joinDate: string;
    registeredExams: number;
    avatarUrl?: string;
  }>({
    name: "",
    joinDate: "",
    registeredExams: 0,
    avatarUrl: ""
  });

  // Get time of day for greeting
  const hour = new Date().getHours();
  let greeting = "";
  if (hour < 12) {
    greeting = "Chào buổi sáng";
  } else if (hour < 18) {
    greeting = "Chào buổi chiều";
  } else {
    greeting = "Chào buổi tối";
  }

  useEffect(() => {
    // Get user data from authentication service
    const user = getCurrentUser();
    if (user) {
      // Extract display name from email if available
      const displayName = user.email.split('@')[0];
      
      setUserData({
        name: displayName.charAt(0).toUpperCase() + displayName.slice(1),
        joinDate: formatJoinDate(user.created_at),
        registeredExams: 0, // This would come from an API in a real app
        avatarUrl: "",
      });
    }
  }, []);
  
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Page
      className="flex flex-col bg-cover bg-center bg-no-repeat bg-white dark:bg-black"
      style={{
        backgroundImage: `url(${bg})`,
      }}
    >
      {/* User info section */}
      <Box className="w-full px-4 py-6 flex items-center justify-between">
        <Box className="flex items-center">
          {/* User avatar */}
          <Box className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold">
            {userData.name.charAt(0)}
          </Box>
          {/* User details */}
          <Box className="ml-4">
            <Text className="text-xl font-bold">{greeting}, {userData.name}!</Text>
            <Text className="text-sm text-gray-500">
              Thành viên từ {userData.joinDate}
            </Text>
          </Box>
        </Box>
        
        {/* Logout button */}
        <Button 
          onClick={handleLogout}
          className="px-3 py-1 text-sm"
          variant="secondary"
        >
          Đăng xuất
        </Button>
      </Box>

      {/* Dashboard stats */}
      <Box className="p-4">
        <Box className="bg-blue-50 rounded-xl p-4 mb-4">
          <Text className="text-sm text-gray-500 mb-1">Bài thi đã đăng ký</Text>
          <Box className="flex items-center">
            <Text className="text-2xl font-bold mr-2">{userData.registeredExams}</Text>
            <Box className="text-blue-600 text-xl">📄</Box>
          </Box>
        </Box>

        {/* Quick actions */}
        <Text className="font-bold text-lg mb-3">Thao tác nhanh</Text>
        <Box className="grid grid-cols-3 gap-3">
          <Box className="bg-white rounded-xl p-3 shadow-sm flex flex-col items-center justify-center">
            <Box className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2">
              <Box className="text-blue-600 text-xl">🔍</Box>
            </Box>
            <Text className="text-xs text-center">Tìm bài thi</Text>
          </Box>
          <Box className="bg-white rounded-xl p-3 shadow-sm flex flex-col items-center justify-center">
            <Box className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <Box className="text-green-600 text-xl">📅</Box>
            </Box>
            <Text className="text-xs text-center">Lịch thi</Text>
          </Box>
          <Box className="bg-white rounded-xl p-3 shadow-sm flex flex-col items-center justify-center">
            <Box className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-2">
              <Box className="text-purple-600 text-xl">⭐</Box>
            </Box>
            <Text className="text-xs text-center">Kết quả</Text>
          </Box>
        </Box>
      </Box>

      {/* Recent exams */}
      <Box className="p-4">
        <Text className="font-bold text-lg mb-3">Bài thi gần đây</Text>
        <Box className="bg-white rounded-xl p-4 shadow-sm mb-3">
          <Box className="flex justify-between items-center mb-2">
            <Text className="font-medium">Toán học cơ bản</Text>
            <Text className="text-xs text-blue-600 font-medium">10/07/2025</Text>
          </Box>
          <Text className="text-sm text-gray-500 mb-2">Thời gian: 90 phút</Text>
          <Box className="flex justify-between">
            <Text className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">Đã đăng ký</Text>
            <Button size="small" variant="primary">Xem chi tiết</Button>
          </Box>
        </Box>
        <Box className="bg-white rounded-xl p-4 shadow-sm">
          <Box className="flex justify-between items-center mb-2">
            <Text className="font-medium">Tiếng Anh giao tiếp</Text>
            <Text className="text-xs text-blue-600 font-medium">15/07/2025</Text>
          </Box>
          <Text className="text-sm text-gray-500 mb-2">Thời gian: 60 phút</Text>
          <Box className="flex justify-between">
            <Text className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">Đã đăng ký</Text>
            <Button size="small" variant="primary">Xem chi tiết</Button>
          </Box>
        </Box>
      </Box>

      <Logo className="mx-auto my-4" />
    </Page>
  );
}

export default HomePage;
