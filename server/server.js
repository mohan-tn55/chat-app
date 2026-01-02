import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { connectDB } from "./lib/db.js";

// // 1. IMPORTANT: Define and export these BEFORE importing routes to prevent circular dependency crashes
const app = express();
const server = http.createServer(app);

export const io = new Server(server, { 
  cors: { origin: "*" } 
});

export const userSocketMap = {}; 

// // 2. IMPORTANT: Routes are imported AFTER exports so messageController can access io and userSocketMap
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId && userId !== "undefined" && userId !== "null") {
    userSocketMap[userId] = socket.id;
  }
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    if (userId && userSocketMap[userId]) {
      delete userSocketMap[userId];
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// // 3. Middleware configuration
app.use(express.json({ limit: "10mb" })); 
app.use(cors());

// // 4. API Route definitions
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// // 5. IMPORTANT: Database connection must be called for Vercel functions to work
connectDB();

// // 6. IMPORTANT: server.listen only runs in development; Vercel handles the port in production
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => console.log(`Server running on: ${PORT}`));
}

// // 7. CRITICAL FOR VERCEL: You must export app as the default export
export default app;