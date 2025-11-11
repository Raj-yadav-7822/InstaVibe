import React from "react";
import { useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Link } from "react-router-dom";

const SuggestedUsers = () => {
  
  const suggestedUsers = useSelector((state) => state.auth.suggestedUsers);

  
  if (!Array.isArray(suggestedUsers)) {
    return (
      <div className="mt-6">
        <h3 className="font-semibold text-sm mb-2">Suggested for you</h3>
        <p className="text-gray-500 text-xs">Loading suggestions...</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
<div className='flex items-center justify-between text-sm mt-6  gap-6 '>
                <h1 className='font-semibold text-gray-600 mt-3'>Suggested for you</h1>
                <span className='font-medium cursor-pointer mt-3'>See All</span>
            </div>
      {suggestedUsers.length > 0 ? (
        suggestedUsers.map((user) => (
          <div key={user._id} className="flex items-center justify-between mb-3 mt-4">
            <div className="flex items-center gap-3">
              <Link to={`/profile/${user._id}`}>
                <Avatar className="w-8 h-8">
                  <AvatarImage
                    src={user.profilePicture || "/default-avatar.png"}
                    alt={user.username}
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </Link>
              <div>
                <h4 className="text-sm font-medium leading-none">
                  <Link to={`/profile/${user._id}`}>{user.username}</Link>
                </h4>
                <p className="text-xs text-gray-500">
                  {user.bio || "No bio yet"}
                </p>
              </div>
            </div>
            <button className="text-xs font-semibold text-blue-500 hover:underline">
              Follow
            </button>
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-xs">No suggestions available</p>
      )}
    </div>
  );
};

export default SuggestedUsers;
