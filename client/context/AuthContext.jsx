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

// Check if user is authenticated on initial load , set the user data and connect the socket

    const checkAuth = async () => {
        try {
            const { data } = await axios.get("/api/auth/check");
            if (data.success) {
                setAuthUser(data.user);
                connectSocket(data.user);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };    

// Login function to handle user authentication and socket connection
    const login = async (state, credentials) => {
        try {
            
        } catch (error) {
            
        }
    }

    // Connect socket function to handle socket connection and online users update
    const connectSocket = () => {
        if (!userData || socket?.connected) return;
        const newSocket = io(backendUrl, {
            query: {
                userId: userData._id,
            }
        });
        newSocket.connect();
        setSocket(newSocket);

        newSocket.on("online-users", (userIds) => {
            setOnlineUsers(userIds);
        });
    };

    useEffect (() => {
        if (token) {
            axios.defaults.headers.common["token"] = token;
        }
        checkAuth();
    }, [])

    const value = {
        axios, 
        authUser,
        onlineUsers,
        socket,
        
    }; // Add your auth-related values and functions here

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )

}