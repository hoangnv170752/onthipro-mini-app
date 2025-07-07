// ZaUI stylesheet
import "zmp-ui/zaui.css";
// Tailwind stylesheet
import "@/css/tailwind.scss";
// Your stylesheet
import "@/css/app.scss";

// React core
import React from "react";
import { createRoot } from "react-dom/client";

// Zalo Mini App SDK
import { getSystemInfo, login as zmpLogin } from "zmp-sdk";

// Mount the app
import Layout from "@/components/layout";

// Expose app configuration
import appConfig from "../app-config.json";

// Error handling
const handleError = (error: any) => {
  console.error("App initialization error:", error);
  const errorElement = document.getElementById("app-error");
  if (errorElement) {
    errorElement.style.display = "block";
    errorElement.innerText = `Lỗi khởi tạo: ${error.message || "Không xác định"}`;
  }
};

// Initialize app
const initializeApp = async () => {
  try {
    // Set global config
    if (!window.APP_CONFIG) {
      window.APP_CONFIG = appConfig as any;
    }
    
    // Get system info
    const systemInfo = await getSystemInfo();
    console.log("System info:", systemInfo);
    
    // Initialize Zalo Mini App login
    await zmpLogin();
    console.log("ZMP login initialized");
    
    // Render the app
    const appElement = document.getElementById("app");
    if (appElement) {
      const root = createRoot(appElement);
      root.render(React.createElement(Layout));
      console.log("App rendered successfully");
      
      // Hide loading screen
      const loadingElement = document.getElementById("app-loading");
      if (loadingElement) {
        setTimeout(() => {
          appElement.style.display = "block";
          loadingElement.style.display = "none";
        }, 500);
      }
    } else {
      throw new Error("App element not found");
    }
  } catch (error) {
    handleError(error);
  }
};

// Start the app
initializeApp();
