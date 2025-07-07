import React, { useState, useEffect } from "react";
import { Box, Button, Page, Text, useNavigate, Spinner } from "zmp-ui";
import Logo from "@/components/logo";
import bg from "@/static/bg.svg";
import { getCurrentUser, formatJoinDate, logout } from "@/services/auth";
import { getUserExams, formatExamDate, Exam } from "@/services/exams";
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
  
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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

  // Fetch user data and exams
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get user data from authentication service
        const user = getCurrentUser();
        if (user) {
          // Extract display name from email if available
          const displayName = user.email.split('@')[0];
          
          setUserData({
            name: displayName.charAt(0).toUpperCase() + displayName.slice(1),
            joinDate: formatJoinDate(user.created_at),
            registeredExams: 0, // Will be updated after fetching exams
            avatarUrl: "",
          });
        }

        // Fetch exams
        setIsLoading(true);
        setError("");
        const examData = await getUserExams();
        setExams(examData);
        
        // Update registered exams count
        setUserData(prev => ({
          ...prev,
          registeredExams: examData.length
        }));
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);
  
  const handleLogout = async () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      try {
        await logout();
        navigate("/login");
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
  };

  return (
    <Page
      className="flex flex-col bg-cover bg-center bg-no-repeat bg-white dark:bg-black min-h-screen"
      style={{
        backgroundImage: `url(${bg})`,
      }}
      hideScrollbar={false}
    >
      {/* User info section - with safe area padding */}
      <Box className="w-full px-4 pt-8 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
        
        {/* Logout button - improved styling */}
        <Button 
          onClick={handleLogout}
          className="px-4 py-2 text-sm rounded-lg flex items-center gap-2"
          variant="secondary"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
            <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
          </svg>
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
        
        {isLoading && (
          <Box className="flex justify-center items-center py-8">
            <Spinner />
          </Box>
        )}
        
        {error && (
          <Box className="bg-red-50 text-red-600 p-4 rounded-lg mb-3">
            {error}
          </Box>
        )}
        
        {!isLoading && !error && exams.length === 0 && (
          <Box className="bg-gray-50 p-4 rounded-lg text-center">
            <Text className="text-gray-500">Chưa có bài thi nào được đăng ký</Text>
          </Box>
        )}
        
        {!isLoading && exams.map((exam) => (
          <Box key={exam.id} className="bg-white rounded-xl p-4 shadow-sm mb-3">
            <Box className="flex justify-between items-center mb-2">
              <Text className="font-medium">{exam.title}</Text>
              <Text className="text-xs text-blue-600 font-medium">{formatExamDate(exam.exam_date)}</Text>
            </Box>
            <Text className="text-sm text-gray-500 mb-2">
              {exam.description}
            </Text>
            <Text className="text-sm text-gray-500 mb-2">Thời gian: {exam.duration} phút</Text>
            <Box className="flex justify-between">
              <Text 
                className={`text-xs px-2 py-1 rounded-full ${exam.status === 'completed' 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-blue-100 text-blue-600'}`}
              >
                {exam.status === 'registered' ? 'Đã đăng ký' : 
                 exam.status === 'completed' ? 'Đã hoàn thành' : 'Sắp diễn ra'}
              </Text>
              <Button size="small" variant="primary">Xem chi tiết</Button>
            </Box>
            {exam.score !== undefined && (
              <Box className="mt-2 pt-2 border-t border-gray-100">
                <Text className="text-sm font-medium">Điểm số: <Text className="text-blue-600">{exam.score}/10</Text></Text>
              </Box>
            )}
          </Box>
        ))}
      </Box>

      <Logo className="mx-auto my-4" />
    </Page>
  );
}

export default HomePage;
