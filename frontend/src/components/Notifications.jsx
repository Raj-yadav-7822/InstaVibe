import React from "react";
import { useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useNavigate } from "react-router-dom";

function Notifications() {
  const navigate = useNavigate();
  const { likeNotification = [], messageNotification = [] } = useSelector(
    (store) => store.realTimeNotification || {}
  );

  const handleProfileClick = (userId) => {
    if (userId) navigate(`/profile/${userId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex justify-center py-10 px-4">
      <div className="w-full max-w-2xl bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200">
        {/* Header */}
        <div className="border-b border-gray-100 px-6 py-5 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
            Notifications
          </h1>
        </div>

        <div className="p-6 space-y-10">
          {/*  Likes */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
               Likes
            </h2>

            {likeNotification.length === 0 ? (
              <div className="text-center py-10 text-gray-400 italic">
                No new likes yet
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {likeNotification.map((n, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-4 hover:bg-gray-50 transition-all rounded-xl px-2 cursor-pointer"
                  >
                    <div
                      className="flex items-center gap-4"
                      onClick={() => handleProfileClick(n.userId)}
                    >
                      <Avatar className="h-11 w-11 ring-2 ring-pink-200">
                        <AvatarImage
                          src={n.profilePic}
                          alt={n.username}
                        />
                        <AvatarFallback>
                          {n.username?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm text-gray-800">
                          <span className="font-medium hover:underline">
                            {n.username}
                          </span>{" "}
                          liked your post
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(n.time).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    
                    {n.isNew && (
                      <span className="text-sm bg-pink-100 text-pink-600 font-medium px-3 py-1 rounded-full">
                        New
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/*  Messages */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
               Messages
            </h2>

            {messageNotification.length === 0 ? (
              <div className="text-center py-10 text-gray-400 italic">
                No new messages
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {messageNotification.map((msg, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-4 hover:bg-gray-50 transition-all rounded-xl px-2 cursor-pointer"
                  >
                    <div
                      className="flex items-center gap-4"
                      onClick={() => handleProfileClick(msg.senderId)}
                    >
                      <Avatar className="h-11 w-11 ring-2 ring-blue-200">
                        <AvatarImage
                          src={msg.senderProfile}
                          alt={msg.senderName}
                        />
                        <AvatarFallback>
                          {msg.senderName?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm text-gray-800">
                          <span className="font-medium hover:underline">
                            {msg.senderName}
                          </span>{" "}
                          sent you a message
                        </p>
                        <p className="text-xs text-gray-400 italic truncate max-w-[180px]">
                          “{msg.text}”
                        </p>
                      </div>
                    </div>
                    
                    {msg.isNew && (
                      <span className="text-sm bg-blue-100 text-blue-600 font-medium px-3 py-1 rounded-full">
                        New
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default Notifications;
