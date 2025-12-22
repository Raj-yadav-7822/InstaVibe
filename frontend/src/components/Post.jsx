import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { Bookmark, MessageCircle, MoreHorizontal, Send } from 'lucide-react';
import { Button } from './ui/button';
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { Badge } from './ui/badge';
import CommentDialog from './CommentDialog';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { setPosts, setSelectedPost } from '@/redux/postSlice';
import api from '@/utils/api';   

function Post({ post }) {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);

  const { user } = useSelector(store => store.auth);
  const { posts } = useSelector(store => store.post);

  const [liked, setLiked] = useState(
    post.likes.includes(user?._id) || false
  );
  const [comment, setComment] = useState(post.comments);

  const dispatch = useDispatch();

  const changeEventHandler = (e) => {
    const value = e.target.value;
    setText(value.trim() ? value : "");
  };

  //  Like / Dislike
  const likeOrDislikeHandler = async () => {
    try {
      const action = liked ? "dislike" : "like";
      const res = await api.get(`/post/${post._id}/${action}`);

      if (res.data.success) {
        setLiked(!liked);

        const updatedPosts = posts.map(p =>
          p._id === post._id
            ? {
                ...p,
                likes: liked
                  ? p.likes.filter(id => id !== user._id)
                  : [...p.likes, user._id],
              }
            : p
        );

        dispatch(setPosts(updatedPosts));
        toast.success(res.data.message);
      }
    } catch (err) {
      console.log(err);
    }
  };

  //  Comment
  const commentHandler = async () => {
    try {
      const res = await api.post(`/post/${post._id}/comment`, { text });

      if (res.data.success) {
        const updatedComments = [...comment, res.data.comment];
        setComment(updatedComments);

        const updatedPosts = posts.map(p =>
          p._id === post._id
            ? { ...p, comments: updatedComments }
            : p
        );

        dispatch(setPosts(updatedPosts));
        toast.success(res.data.message);
        setText("");
      }
    } catch (err) {
      console.log(err);
    }
  };

  // 🗑 Delete Post
  const deletePostHandler = async () => {
    try {
      const res = await api.delete(`/post/delete/${post._id}`);

      if (res.data.success) {
        dispatch(setPosts(posts.filter(p => p._id !== post._id)));
        toast.success(res.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message);
    }
  };

  //  Bookmark
  const bookmarkHandler = async () => {
    try {
      const res = await api.get(`/post/${post._id}/bookmark`);
      if (res.data.success) toast.success(res.data.message);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="my-4 w-full sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto border rounded-md bg-white">
      
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.author?.profilePicture} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>

          <div>
            <h1 className="font-semibold text-sm">{post.author?.username}</h1>
            {user?._id === post.author?._id && (
              <Badge variant="secondary">Author</Badge>
            )}
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <MoreHorizontal className="cursor-pointer" />
          </DialogTrigger>

          <DialogContent className="flex flex-col items-center">
            {user?._id === post.author?._id && (
              <Button onClick={deletePostHandler} variant="ghost">
                Delete
              </Button>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Image */}
      <img src={post.image} className="w-full aspect-square object-cover" />

      {/* Actions */}
      <div className="flex justify-between px-3 py-2">
        <div className="flex gap-4">
          {liked ? (
            <FaHeart onClick={likeOrDislikeHandler} className="text-red-500 cursor-pointer" />
          ) : (
            <FaRegHeart onClick={likeOrDislikeHandler} className="cursor-pointer" />
          )}

          <MessageCircle
            onClick={() => {
              dispatch(setSelectedPost(post));
              setOpen(true);
            }}
            className="cursor-pointer"
          />
        </div>

        <Bookmark onClick={bookmarkHandler} className="cursor-pointer" />
      </div>

      <span className="px-3 font-medium">{post.likes.length} likes</span>

      <p className="px-3">
        <b>{post.author?.username}</b> {post.caption}
      </p>

      {comment.length > 0 && (
        <span
          className="px-3 text-sm text-gray-400 cursor-pointer"
          onClick={() => setOpen(true)}
        >
          View all {comment.length} comments
        </span>
      )}

      <CommentDialog open={open} setOpen={setOpen} />

      {/* Add Comment */}
      <div className="flex gap-2 px-3 py-2 border-t">
        <input
          value={text}
          onChange={changeEventHandler}
          placeholder="Add a comment..."
          className="flex-1 outline-none"
        />
        {text && (
          <span onClick={commentHandler} className="text-blue-500 cursor-pointer">
            Post
          </span>
        )}
      </div>
    </div>
  );
}

export default Post;
