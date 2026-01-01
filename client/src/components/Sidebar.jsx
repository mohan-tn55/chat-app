import React, { useContext, useEffect, useState } from "react";
import assets from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";

const Sidebar = () => {
  // Destructure accurately from ChatContext
  const { 
    getUsers, 
    users, 
    selectedUser, 
    setSelectedUser, 
    unseenMessages, 
    setUnseenMessages 
  } = useContext(ChatContext);
  
  const { logout, onlineUsers } = useContext(AuthContext);
  const [searchInput, setSearchInput] = useState("");
  const navigate = useNavigate();

  const filteredUsers = users ? users.filter((user) =>
    user.fullName.toLowerCase().includes(searchInput.toLowerCase())
  ) : [];

  useEffect(() => {
    // Check if function exists before calling to avoid crash
    if (getUsers) {
      getUsers();
    }
  }, []);

  return (
    <div className={`bg-[#8185B2]/10 h-full p-5 overflow-y-scroll text-white ${selectedUser ? "max-md:hidden" : ""}`}>
      <div className="pb-5">
        <div className="flex justify-between items-center">
          <img src={assets.logo} alt="logo" className="max-w-40" />
          <div className="relative py-2 group">
            <img src={assets.menu_icon} alt="menu" className="max-h-5 cursor-pointer" />
            <div className="absolute top-full right-0 z-20 w-32 p-5 rounded-md bg-[#282142] border border-gray-600 hidden group-hover:block">
              <p onClick={() => navigate("/profile")} className="cursor-pointer text-sm mb-2">Edit Profile</p>
              <hr className="my-2 border-t border-gray-500" />
              <p onClick={logout} className="cursor-pointer text-sm">Logout</p>
            </div>
          </div>
        </div>

        <div className="bg-[#282142] rounded-full flex items-center gap-2 py-3 px-4 mt-5">
          <img src={assets.search_icon} alt="Search" className="w-3" />
          <input
            onChange={(e) => setSearchInput(e.target.value)}
            value={searchInput}
            type="text"
            className="bg-transparent border-none outline-none text-white text-xs flex-1"
            placeholder="Search User..."
          />
        </div>
      </div>

      <div className="flex flex-col">
        {filteredUsers.map((user) => (
          <div
            key={user._id}
            onClick={() => {
              setSelectedUser(user);
              setUnseenMessages(prev => ({ ...prev, [user._id]: 0 }));
            }}
            className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer ${selectedUser?._id === user._id ? "bg-[#282142]/50" : ""}`}
          >
            <div className="relative">
                <img src={user?.profilePic || assets.avatar_icon} className="w-10 h-10 rounded-full object-cover" alt="" />
                {onlineUsers.includes(user._id) && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-zinc-900 rounded-full"></span>}
            </div>
            <div className="flex flex-col leading-5">
              <p className="font-medium">{user?.fullName}</p>
              <span className={onlineUsers.includes(user._id) ? "text-green-400 text-xs" : "text-neutral-400 text-xs"}>
                {onlineUsers.includes(user._id) ? "Online" : "Offline"}
              </span>
            </div>
            {unseenMessages[user._id] > 0 && (
              <p className="absolute right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-600">
                {unseenMessages[user._id]}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;