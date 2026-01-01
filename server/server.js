import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

// 1. Socket.io Configuration
export const io = new Server(server, { 
  cors: { origin: "*" } 
});

// Map to track online users: { userId: socketId }
export const userSocketMap = {}; 

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  // FIXED: Prevent "undefined" or "null" strings from polluting the online list
  if (userId && userId !== "undefined" && userId !== "null") {
    userSocketMap[userId] = socket.id;
    console.log(`User connected: ${userId}`);
  }

  // Broadcast the list of online user IDs to all clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    // Only delete if the userId exists in the map to prevent logic errors
    if (userId && userSocketMap[userId]) {
      delete userSocketMap[userId];
      console.log(`User disconnected: ${userId}`);
    }
    // Update all clients with the new online list
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// 2. Middleware
// IMPORTANT: limit is high enough for Base64 profile pictures from Cloudinary
app.use(express.json({ limit: "10mb" })); 
app.use(cors());

// 3. API Routes
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// 4. Server Initialization
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`Server running on port: ${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

startServer();