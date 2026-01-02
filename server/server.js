import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { connectDB } from "./lib/db.js";

// 1. DEFINE AND EXPORT FIRST (Prevents circular dependency crash)
const app = express();
const server = http.createServer(app);

export const io = new Server(server, { 
  cors: { origin: "*" } 
});

export const userSocketMap = {}; 

// 2. NOW IMPORT ROUTES (They can now safely access exports above)
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

// 3. Middleware
app.use(express.json({ limit: "10mb" })); 
app.use(cors());

// 4. API Routes
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// 5. Database Connection (Non-blocking for Vercel)
connectDB().catch(err => console.error("MongoDB Error:", err));

// 6. Local Server Start
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => console.log(`Server running on: ${PORT}`));
}

// 7. Vercel Export
export default app;