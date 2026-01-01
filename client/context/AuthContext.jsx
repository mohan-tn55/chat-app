import { createContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // 1. Improved Socket Connection Logic
  const connectSocket = (user) => {
    // Prevent multiple connections
    if (!user || (socket && socket.connected)) return;
    
    const newSocket = io(backendUrl, {
      query: { userId: user._id },
    });
    
    setSocket(newSocket);

    newSocket.on("getOnlineUsers", (userIds) => {
      setOnlineUsers(userIds);
    });
  };

  // 2. Check Authentication Status on Page Load
  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/auth/check");
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      }
    } catch (error) {
      console.log("Error in checkAuth:", error.message);
      setAuthUser(null);
      // If token is invalid, clear it
      localStorage.removeItem("token");
    } finally {
      setIsCheckingAuth(false);
    }
  };

  // 3. Login/Signup Logic
  const login = async (type, credentials) => {
    try {
      const { data } = await axios.post(`/api/auth/${type}`, credentials);
      if (data.success) {
        setAuthUser(data.userData);
        setToken(data.token);
        localStorage.setItem("token", data.token);
        
        // Apply token to axios immediately
        axios.defaults.headers.common["token"] = data.token;
        
        connectSocket(data.userData);
        toast.success(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  // 4. FIXED: Profile Update Function (Crucial for ProfilePage)
  const updateProfile = async (updateData) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", updateData);
      if (data.success) {
        setAuthUser(data.user); // Immediately updates UI with new photo/bio
        toast.success("Profile updated!");
        return true;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
      return false;
    }
  };

  // 5. Logout Logic
  const logout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["token"];
    if (socket) socket.disconnect();
    setSocket(null);
    setAuthUser(null);
    setToken(null);
    setOnlineUsers([]);
    toast.success("Logged out successfully");
  };

  // 6. Init Effect
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      axios.defaults.headers.common["token"] = savedToken;
      checkAuth();
    } else {
      setIsCheckingAuth(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ 
      authUser, 
      token, 
      onlineUsers, 
      socket, 
      login, 
      logout, 
      updateProfile, // Shared with ProfilePage
      isCheckingAuth, 
      axios 
    }}>
      {children}
    </AuthContext.Provider>
  );
};