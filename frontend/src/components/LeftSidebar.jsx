import { Heart, Home, LogOut, MessageCircle, PlusSquare, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import React, { useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthUser } from '@/redux/authSlice';
import CreatePost from './CreatePost';
import { setPosts, setSelectedPost } from '@/redux/postSlice';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { markLikesAsRead, markMessagesAsRead } from '@/redux/rtnSlice';

function LeftSidebar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const { likeNotification = [], messageNotification = [] } =
    useSelector((store) => store.realTimeNotification || {});

  //  Use environment 
  const API_URL = import.meta.env.VITE_API_URL;

  const logoutHandle = async () => {
    try {
      const res = await axios.get(`${API_URL}/user/logout`, {
        withCredentials: true,
      });

      if (res.data.success) {
        dispatch(setAuthUser(null));
        dispatch(setSelectedPost(null));
        dispatch(setPosts([]));
        navigate('/login');
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  };

  const sidebarHandler = (textType) => {
    switch (textType) {
      case 'Logout':
        logoutHandle();
        break;
      case 'Create':
        setOpen(true);
        break;
      case 'Profile':
        navigate(`/profile/${user?._id}`);
        break;
      case 'Home':
        navigate('/');
        break;
      case 'Messages':
        navigate('/chat');
        break;
      case 'Notifications':
        dispatch(markLikesAsRead());
        dispatch(markMessagesAsRead());
        navigate('/notifications');
        break;
      case 'Search':
        navigate('/search');
        break;
      default:
        break;
    }
  };

  const sidebarItems = [
    { icon: <Home />, text: 'Home' },
    { icon: <Search />, text: 'Search' },
    { icon: <MessageCircle />, text: 'Messages' },
    { icon: <Heart />, text: 'Notifications' },
    { icon: <PlusSquare />, text: 'Create' },
    {
      icon: (
        <Avatar className="w-6 h-6">
          <AvatarImage src={user?.profilePicture} alt={user?.username || 'User'} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      ),
      text: 'Profile',
    },
    { icon: <LogOut />, text: 'Logout' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex fixed top-0 left-0 z-10 h-screen w-[16%] px-4 border-r border-gray-300 bg-white flex-col">
<h1
  onClick={() => sidebarHandler('Home')}
  className="my-8 pl-3 font-extrabold text-3xl text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-blue-700 cursor-pointer tracking-tight"
  style={{ fontFamily: "'Inter', sans-serif" }}
>
  InstaVibe
</h1>
        <div className="flex flex-col flex-1">
          {sidebarItems.map((item, index) => (
            <div
              key={index}
              onClick={() => sidebarHandler(item.text)}
              className="flex items-center gap-3 hover:bg-gray-100 cursor-pointer rounded-lg p-3 my-2 relative"
            >
              <div className="relative flex items-center">
                {item.icon}

                {/* Notification badge (likes) */}
                {item.text === 'Notifications' &&
                  likeNotification.filter((n) => n.isNew).length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                      {likeNotification.filter((n) => n.isNew).length}
                    </span>
                  )}

                {/* Notification badge (messages) */}
                {item.text === 'Messages' &&
                  messageNotification.filter((m) => m.isNew).length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                      {messageNotification.filter((m) => m.isNew).length}
                    </span>
                  )}

                {/* Like notifications popover */}
                {item.text === 'Notifications' && likeNotification.length > 0 && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <div className="absolute inset-0 cursor-pointer"></div>
                    </PopoverTrigger>
                    <PopoverContent className="w-64">
                      {likeNotification.length === 0 ? (
                        <p>No new notifications</p>
                      ) : (
                        likeNotification.map((n) => (
                          <div key={n.userId} className="flex items-center gap-2 my-2">
                            <Avatar>
                              <AvatarImage src={n.profilePic} />
                              <AvatarFallback>
                                {n.username?.[0]?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <p className="text-sm">
                              <span className="font-bold">{n.username}</span> liked your
                              post
                            </p>
                          </div>
                        ))
                      )}
                    </PopoverContent>
                  </Popover>
                )}
              </div>

              <span>{item.text}</span>
            </div>
          ))}
        </div>

        <CreatePost open={open} setOpen={setOpen} />
      </div>

      {/* Mobile Bottom Navbar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-300 flex justify-around items-center h-14 px-4">
        {sidebarItems.map((item, index) => (
          <div
            key={index}
            onClick={() => sidebarHandler(item.text)}
            className="relative flex flex-col items-center justify-center cursor-pointer"
          >
            {item.icon}

            {/* Badges for mobile view */}
            {item.text === 'Notifications' &&
              likeNotification.filter((n) => n.isNew).length > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                  {likeNotification.filter((n) => n.isNew).length}
                </span>
              )}
            {item.text === 'Messages' &&
              messageNotification.filter((m) => m.isNew).length > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                  {messageNotification.filter((m) => m.isNew).length}
                </span>
              )}
          </div>
        ))}
      </div>
    </>
  );
}

export default LeftSidebar;
