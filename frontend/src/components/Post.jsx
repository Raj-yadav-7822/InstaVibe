import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { Bookmark, MessageCircle, MoreHorizontal, Send } from 'lucide-react';
import { Button } from './ui/button';
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { Badge } from './ui/badge';
import CommentDialog from './CommentDialog';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'sonner';
import { setPosts, setSelectedPost } from '@/redux/postSlice';

function Post({ post }) {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const { user } = useSelector(store => store.auth);
  const { posts } = useSelector(store => store.post);
  const [liked, setLiked] = useState(post.likes.includes(user?._id) || false);
  const [comment, setComment] = useState(post.comments);
  const dispatch = useDispatch();

  // ✅ Base API URL from .env
  const API_URL = import.meta.env.VITE_API_URL;

  const changeEventHandler = (e) => {
    const inputText = e.target.value;
    setText(inputText.trim() ? inputText : "");
  };

  const likeOrDislikeHandler = async () => {
    try {
      const action = liked ? 'dislike' : 'like';
      const res = await axios.get(`${API_URL}/post/${post._id}/${action}`, { withCredentials: true });
      if (res.data.success) {
        setLiked(!liked);
        const updatedPostData = posts.map(p =>
          p._id === post._id
            ? { ...p, likes: liked ? p.likes.filter(id => id !== user._id) : [...p.likes, user._id] }
            : p
        );
        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const commentHandler = async () => {
    try {
      const res = await axios.post(
        `${API_URL}/post/${post._id}/comment`,
        { text },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        const updatedCommentData = [...comment, res.data.comment];
        setComment(updatedCommentData);
        const updatedPostData = posts.map(p =>
          p._id === post._id ? { ...p, comments: updatedCommentData } : p
        );
        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
        setText("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const deletePostHandler = async () => {
    try {
      const res = await axios.delete(`${API_URL}/post/delete/${post?._id}`, {
        withCredentials: true,
      });
      if (res.data.success) {
        const updatedPostData = posts.filter(p => p?._id !== post?._id);
        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message);
    }
  };

  const bookmarkHandler = async () => {
    try {
      const res = await axios.get(`${API_URL}/post/${post?._id}/bookmark`, { withCredentials: true });
      if (res.data.success) toast.success(res.data.message);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className='my-4 w-full sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto border rounded-md shadow-sm bg-white'>
      {/* Header */}
      <div className='flex items-center justify-between px-3 py-2'>
        <div className='flex items-center gap-2'>
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={post.author?.profilePicture}
              alt="post_image"
              className="object-cover h-full w-full rounded-full"
            />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className='flex flex-col'>
            <h1 className='font-semibold text-sm'>{post.author?.username}</h1>
            {user?._id === post.author._id && <Badge variant="secondary">Author</Badge>}
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <MoreHorizontal className='cursor-pointer' />
          </DialogTrigger>
          <DialogContent className="flex flex-col items-center text-sm text-center">
            {post?.author?._id !== user?._id && (
              <Button variant='ghost' className="w-fit text-[#ED4956]">
                Unfollow
              </Button>
            )}
            <Button variant='ghost' className="w-fit">Add to favourite</Button>
            {user && user?._id === post?.author._id && (
              <Button onClick={deletePostHandler} variant='ghost' className="w-fit">
                Delete
              </Button>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Post Image */}
      <div className="w-full relative overflow-hidden">
        <img className='w-full aspect-square object-cover' src={post.image} alt="post_image" />
      </div>

      {/* Actions */}
      <div className='flex justify-between items-center px-3 py-2'>
        <div className='flex items-center gap-4'>
          {liked
            ? <FaHeart onClick={likeOrDislikeHandler} className='text-red-600 cursor-pointer' size={24} />
            : <FaRegHeart onClick={likeOrDislikeHandler} className='cursor-pointer hover:text-gray-600' size={22} />}
          <MessageCircle
            onClick={() => { dispatch(setSelectedPost(post)); setOpen(true); }}
            className='cursor-pointer hover:text-gray-600'
          />
          <Send className='cursor-pointer hover:text-gray-600' />
        </div>
        <Bookmark onClick={bookmarkHandler} className='cursor-pointer hover:text-gray-600' />
      </div>

      {/* Likes */}
      <span className='font-medium block px-3 text-sm md:text-base'>{post.likes.length} likes</span>

      {/* Caption */}
      <p className='px-3 text-sm md:text-base'>
        <span className='font-medium mr-2'>{post.author?.username}</span>
        {post.caption}
      </p>

      {/* Comments */}
      {comment.length > 0 && (
        <span
          onClick={() => { dispatch(setSelectedPost(post)); setOpen(true); }}
          className='cursor-pointer text-gray-400 text-sm px-3'
        >
          View all {comment.length} comments
        </span>
      )}

      <CommentDialog open={open} setOpen={setOpen} />

      {/* Add Comment */}
      <div className='flex items-center gap-2 px-3 py-2 border-t mt-2'>
        <input
          type="text"
          value={text}
          onChange={changeEventHandler}
          placeholder='Add a comment...'
          className='flex-1 text-sm md:text-base outline-none'
        />
        {text && (
          <span
            onClick={commentHandler}
            className='text-[#3BADF8] cursor-pointer font-semibold text-sm md:text-base'
          >
            Post
          </span>
        )}
      </div>
    </div>
  );
}

export default Post;
