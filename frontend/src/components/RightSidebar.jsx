import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom';
import SuggestedUsers from './SuggestedUsers';
import { UserPlus } from 'lucide-react';

const RightSidebar = () => {
  const { user } = useSelector(store => store.auth);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop Right Sidebar */}
      <div className='hidden md:flex w-fit my-10 pr-32 flex-col'>
        <div className='flex items-center gap-2 mb-4'>
          <Link to={`/profile/${user?._id}`}>
            <Avatar>
              <AvatarImage src={user?.profilePicture} alt="profile_image" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </Link>
          <div className='max-w-[180px]'>
            <h1 className='font-semibold text-sm truncate'>
              <Link to={`/profile/${user?._id}`}>{user?.username}</Link>
            </h1>
            {/* Responsive multi-line bio */}
            <span className='text-gray-600 text-sm break-words whitespace-pre-wrap block'>
              {user?.bio || 'Bio here...'}
            </span>
          </div>
        </div>
        <SuggestedUsers />
      </div>

      {/* Mobile Toggle Button */}
      <div className='fixed bottom-6 right-4 md:hidden z-50'>
        <button 
          onClick={() => setMobileOpen(!mobileOpen)} 
          className='bg-blue-500 p-3 rounded-full shadow-lg text-white mb-10'
        >
          <UserPlus className='w-6 h-6' />
        </button>
      </div>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className='fixed top-0 right-0 w-full h-full bg-white shadow-lg z-50 p-4 overflow-y-auto md:hidden'>
          <button 
            onClick={() => setMobileOpen(false)} 
            className='absolute top-4 right-4 text-gray-600 font-bold text-xl'
          >
            ✕
          </button>

          <div className='flex flex-col mt-10'> 
            <h1 className='font-bold text-lg mb-4'>Your Profile</h1>

            <div className='flex items-center gap-2 mb-4'>
              <Link to={`/profile/${user?._id}`} onClick={() => setMobileOpen(false)}>
                <Avatar>
                  <AvatarImage src={user?.profilePicture} alt="profile_image" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </Link>
              <div className='max-w-[250px]'>
                <h1 className='font-semibold text-sm truncate'>
                  <Link to={`/profile/${user?._id}`} onClick={() => setMobileOpen(false)}>
                    {user?.username}
                  </Link>
                </h1>
                {/*  Multi-line responsive bio on mobile */}
                <span className='text-gray-600 text-sm break-words whitespace-pre-wrap block'>
                  {user?.bio || 'Bio here...'}
                </span>
              </div>
            </div>

            <SuggestedUsers />
          </div>
        </div>
      )}
    </>
  )
}

export default RightSidebar;
