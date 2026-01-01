import React, { useContext, useEffect, useRef, useState } from "react"; // Added useContext
import assets from "../assets/assets";
import { formatMessageTime } from "../lib/utils";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";

const ChatContainer = () => {
  const { messages, selectedUser, setSelectedUser, sendMessage, getMessages } =
    useContext(ChatContext);
  const { authUser, onlineUsers } = useContext(AuthContext);

  const scrollEnd = useRef();
  const [input, setInput] = useState("");

  const handleSendMessage = async (e) => {
    e.preventDefault(); 
    if (input.trim() === "") return; 
    await sendMessage({ text: input.trim() });
    setInput("");
  };

  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Select an image file");
      return;
    }
    const reader = new FileReader();

    reader.onloadend = async () => {
      await sendMessage({ image: reader.result });
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser, getMessages]);

  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return selectedUser ? (
    <div className="h-full overflow-hidden relative backdrop-blur-lg flex flex-col">
      {/* Chat Header */}
      <div className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500">
        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          alt="profile-pic"
          className="w-8 h-8 rounded-full object-cover"
        />
        <div className="flex-1">
          <p className="text-lg text-white flex items-center gap-2">
            {selectedUser.fullName}
            {onlineUsers?.includes(selectedUser._id) && (
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
            )}
          </p>
        </div>
        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt="back"
          className="md:hidden w-7 cursor-pointer"
        />
        <img src={assets.help_icon} alt="help" className="hidden md:block w-5" />
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 pb-6 custom-scrollbar">
        {Array.isArray(messages) && messages.map((msg, index) => (
          <div
            key={msg._id || index}
            className={`flex items-end gap-2 mb-4 ${
              msg.senderId === authUser._id ? "flex-row justify-end" : "flex-row-reverse justify-end"
            }`}
          >
            <div className={`flex flex-col ${msg.senderId === authUser._id ? "items-end" : "items-start"}`}>
              {msg.image ? (
                <img
                  src={msg.image}
                  alt="sent-content"
                  className="max-w-62.5 border border-gray-700 rounded-lg overflow-hidden mb-1"
                />
              ) : (
                <p
                  className={`p-3 max-w-62.5 md:text-sm font-light rounded-2xl mb-1 wrap-break-word text-white ${
                    msg.senderId === authUser._id
                      ? "bg-violet-600 rounded-tr-none"
                      : "bg-zinc-800 rounded-tl-none"
                  }`}
                >
                  {msg.text}
                </p>
              )}
              <span className="text-[10px] text-gray-400 px-1">
                {formatMessageTime(msg.createdAt)}
              </span>
            </div>
            
            <img
              src={
                msg.senderId === authUser._id
                  ? authUser?.profilePic || assets.avatar_icon
                  : selectedUser?.profilePic || assets.avatar_icon
              }
              alt="avatar"
              className="w-8 h-8 rounded-full object-cover border border-gray-600"
            />
          </div>
        ))}
        <div ref={scrollEnd}></div>
      </div>

      {/* Chat Input */}
      <div className="p-4 bg-transparent">
        <form onSubmit={handleSendMessage} className="flex items-center bg-zinc-800/50 rounded-full px-4 py-1 border border-white/10">
          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            type="text"
            placeholder="Type a message..."
            className="flex-1 text-sm py-3 bg-transparent border-none outline-none text-white placeholder-gray-500"
          />
          <input 
            onChange={handleSendImage} 
            type="file" 
            id="image-upload" 
            accept="image/*" 
            hidden 
          />
          <label htmlFor="image-upload" className="cursor-pointer p-2 hover:bg-white/5 rounded-full transition">
            <img
              src={assets.gallery_icon}
              alt="gallery"
              className="w-5 opacity-70"
            />
          </label>
          <button type="submit" className="p-2 hover:scale-110 transition active:scale-95">
            <img
              src={assets.send_button}
              alt="send"
              className="w-8"
            />
          </button>
        </form>
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
      <div className="w-20 h-20 bg-violet-500/10 rounded-3xl flex items-center justify-center mb-2">
        <img src={assets.logo_icon} alt="logo" className="w-12 opacity-50" />
      </div>
      <h2 className="text-2xl font-semibold text-white">Welcome back!</h2>
      <p className="text-gray-500 max-w-xs">Select a conversation from the sidebar to start chatting.</p>
    </div>
  );
};

export default ChatContainer;