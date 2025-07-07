import React, { useState, useEffect } from "react";
import { Box, Text, Button, Page, useNavigate, Spinner, Icon, Sheet, Select, Input } from "zmp-ui";
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

  // Trạng thái cho modal tìm kiếm
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    subject: "",
    examType: "",
    examName: "",
  });
  
  // Dữ liệu mẫu cho các bộ lọc
  const subjects = ["Tiếng Anh", "Toán", "Vật lý", "Hóa học", "Sinh học", "Ngữ văn", "Lịch sử", "Địa lý"];
  const examTypes = ["Chứng chỉ", "Đại học", "THPT", "Ôn tập"];
  const examNames = {
    "Tiếng Anh": {
      "Chứng chỉ": ["IELTS", "TOEIC", "TOEFL"],
      "Đại học": ["Đại học Ngoại ngữ", "Đại học FPT"],
      "THPT": ["THPT Quốc gia"],
      "Ôn tập": ["Ngữ pháp cơ bản", "Từ vựng nâng cao"]
    },
    "Toán": {
      "Đại học": ["Đại học Bách Khoa", "Đại học Tự nhiên"],
      "THPT": ["THPT Quốc gia"],
      "Ôn tập": ["Giải tích", "Đại số"]
    }
    // Có thể thêm dữ liệu cho các môn học khác
  };

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
          <Box 
            className="bg-white rounded-xl p-3 shadow-sm flex flex-col items-center justify-center"
            onClick={() => setShowSearchModal(true)}
          >
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
      
      {/* Modal tìm kiếm bài thi */}
      {/* Sử dụng Sheet thay vì Modal để tránh vấn đề chồng lấp */}
      <Sheet
        visible={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        autoHeight
        mask
        handler
        swipeToClose
      >
        <Box className="p-4 space-y-6">
          {/* Tiêu đề */}
          <Box className="flex justify-between items-center mb-4">
            <Text className="text-lg font-bold">Tìm kiếm bài thi</Text>
            <Button 
              size="small" 
              onClick={() => setShowSearchModal(false)}
              className="p-1"
            >
              ✕
            </Button>
          </Box>
          
          {/* Các trường tìm kiếm */}
          <Box className="space-y-2 mb-6">
            <Text className="text-sm font-medium">Môn thi</Text>
            <Select
              placeholder="Chọn môn thi"
              value={searchFilters.subject}
              onChange={(value) => setSearchFilters(prev => ({
                ...prev,
                subject: value as string,
                examType: "",
                examName: ""
              }))}
              className="w-full"
              style={{ zIndex: 1300 }} /* Tăng z-index cho select */
            >
              {subjects.map((subject) => (
                <Select.Option key={subject} value={subject}>
                  {subject}
                </Select.Option>
              ))}
            </Select>
          </Box>
          
          <Box className="space-y-2 mb-8">
            <Text className="text-sm font-medium">Loại kì thi</Text>
            <Select
              placeholder="Chọn loại kì thi"
              value={searchFilters.examType}
              onChange={(value) => setSearchFilters(prev => ({
                ...prev,
                examType: value as string,
                examName: ""
              }))}
              disabled={!searchFilters.subject}
              className="w-full"
              style={{ zIndex: 1200 }} /* Z-index thấp hơn select đầu tiên */
            >
              {examTypes.map((type) => (
                <Select.Option key={type} value={type}>
                  {type}
                </Select.Option>
              ))}
            </Select>
          </Box>
          
          <Box className="space-y-2 mb-8">
            <Text className="text-sm font-medium">Kì thi</Text>
            <Select
              placeholder="Chọn kì thi"
              value={searchFilters.examName}
              onChange={(value) => setSearchFilters(prev => ({ ...prev, examName: value as string }))}
              disabled={!searchFilters.subject || !searchFilters.examType}
              className="w-full"
              style={{ zIndex: 1100 }} /* Z-index thấp nhất */
            >
              {searchFilters.subject && searchFilters.examType && examNames[searchFilters.subject]?.[searchFilters.examType]?.map((name) => (
                <Select.Option key={name} value={name}>
                  {name}
                </Select.Option>
              ))}
            </Select>
          </Box>
          
          <Box className="pt-4">
            <Text className="text-xs text-gray-500">
              Chọn các bộ lọc để tìm kiếm bài thi phù hợp với nhu cầu của bạn.
            </Text>
          </Box>
          
          {/* Nút tìm kiếm */}
          <Box className="mt-6">
            <Button 
              fullWidth 
              onClick={() => {
                console.log("Tìm kiếm với bộ lọc:", searchFilters);
                // Thực hiện tìm kiếm ở đây
                setShowSearchModal(false);
              }}
            >
              Tìm kiếm
            </Button>
          </Box>
        </Box>
      </Sheet>
    </Page>
  );
}

export default HomePage;
