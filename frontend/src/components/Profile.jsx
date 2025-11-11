import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import useGetUserProfile from '@/hooks/useGetUserProfile';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AtSign, Heart, MessageCircle } from 'lucide-react';

const Profile = () => {
  const params = useParams();
  const userId = params.id;
  useGetUserProfile(userId);
  const [activeTab, setActiveTab] = useState('posts');

  const { userProfile, user } = useSelector(store => store.auth);
  const isLoggedInUserProfile = user?._id === userProfile?._id;
  const isFollowing = false;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  }

  const displayedPost = activeTab === 'posts' ? userProfile?.posts : userProfile?.bookmarks;

  return (
    <div className='flex justify-center w-full'>
      <div className='flex flex-col max-w-5xl w-full p-4 md:p-8 gap-10'>
        {/* Profile Header */}
        <div className='flex flex-col md:flex-row md:items-center gap-6 md:gap-10'>
          {/* Profile Image */}
          <section className='flex justify-center md:justify-start'>
            <Avatar className='h-32 w-32 md:h-36 md:w-36'>
              <AvatarImage src={userProfile?.profilePicture} alt="profilephoto" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </section>

          {/* User Info */}
          <section className='flex flex-col flex-1 gap-4'>
            <div className='flex flex-col md:flex-row md:items-center md:gap-4 gap-2'>
              <span className='text-lg md:text-2xl font-semibold'>{userProfile?.username}</span>
              {
                isLoggedInUserProfile ? (
                  <div className='flex flex-wrap gap-2'>
                    <Link to="/account/edit">
                      <Button variant='secondary' className='hover:bg-gray-200 h-8'>Edit profile</Button>
                    </Link>
                    <Button variant='secondary' className='hover:bg-gray-200 h-8'>View archive</Button>
                    <Button variant='secondary' className='hover:bg-gray-200 h-8'>Ad tools</Button>
                  </div>
                ) : (
                  isFollowing ? (
                    <div className='flex gap-2'>
                      <Button variant='secondary' className='h-8'>Unfollow</Button>
                      <Button variant='secondary' className='h-8'>Message</Button>
                    </div>
                  ) : (
                    <Button className='bg-[#0095F6] hover:bg-[#3192d2] h-8'>Follow</Button>
                  )
                )
              }
            </div>

            {/* Stats */}
            <div className='flex gap-4 text-sm md:text-base flex-wrap'>
              <p><span className='font-semibold'>{userProfile?.posts.length}</span> posts</p>
              <p><span className='font-semibold'>{userProfile?.followers.length}</span> followers</p>
              <p><span className='font-semibold'>{userProfile?.following.length}</span> following</p>
            </div>

            {/* Bio */}
            <div className='flex flex-col gap-1 text-sm md:text-base'>
              <span className='font-semibold'>{userProfile?.bio || 'bio here...'}</span>
              <Badge className='w-fit' variant='secondary'>
                <AtSign /> <span className='pl-1'>{userProfile?.username}</span>
              </Badge>
              <span>Hi, I am Pawan</span>
              <span>Ma ek teacher hu</span>
              {/* <span>DM for collaboration</span> */}
            </div>
          </section>
        </div>

        {/* Tabs */}
        <div className='border-t border-t-gray-200'>
          <div className='flex items-center justify-center gap-4 md:gap-10 text-sm md:text-base overflow-x-auto'>
            <span className={`py-3 cursor-pointer whitespace-nowrap ${activeTab === 'posts' ? 'font-bold' : ''}`} onClick={() => handleTabChange('posts')}>
              POSTS
            </span>
            <span className={`py-3 cursor-pointer whitespace-nowrap ${activeTab === 'saved' ? 'font-bold' : ''}`} onClick={() => handleTabChange('saved')}>
              SAVED
            </span>
            {/* <span className='py-3 cursor-pointer whitespace-nowrap'>REELS</span>
            <span className='py-3 cursor-pointer whitespace-nowrap'>TAGS</span> */}
          </div>

          {/* Posts Grid */}
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1 mt-4'>
            {
              displayedPost?.map((post) => (
                <div key={post?._id} className='relative group cursor-pointer w-full'>
                  <img src={post.image} alt='postimage' className='rounded-sm w-full aspect-square object-cover' />
                  <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-sm'>
                    <div className='flex items-center text-white space-x-4'>
                      <button className='flex items-center gap-2 hover:text-gray-300'>
                        <Heart />
                        <span>{post?.likes.length}</span>
                      </button>
                      <button className='flex items-center gap-2 hover:text-gray-300'>
                        <MessageCircle />
                        <span>{post?.comments.length}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile;
