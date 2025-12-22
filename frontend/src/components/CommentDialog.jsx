import { Dialog, DialogContent } from './ui/dialog';
import React, { useEffect, useState } from 'react';
import { AvatarImage } from './ui/avatar';
import { Avatar, AvatarFallback } from '@radix-ui/react-avatar';
import { Link } from 'react-router-dom';
import { MoreHorizontal } from 'lucide-react';
import { DialogTrigger } from '@radix-ui/react-dialog';
import { Button } from './ui/button';
import { useDispatch, useSelector } from 'react-redux';
import Comment from './Comment';
import axios from 'axios';
import { toast } from 'sonner';
import { setPosts } from '@/redux/postSlice';

const CommentDialog = ({ open, setOpen }) => {
  const [text, setText] = useState('');
  const { selectedPost, posts } = useSelector(store => store.post);
  const [comment, setComment] = useState([]);
  const dispatch = useDispatch();
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (selectedPost) setComment(selectedPost.comments);
  }, [selectedPost]);

  const changeEventHandler = e => {
    const inputText = e.target.value;
    setText(inputText.trim() ? inputText : '');
  };

  const sendMessageHandler = async () => {
    if (!text.trim()) return;
    try {
      const res = await axios.post(
        `${API_BASE_URL}/post/${selectedPost?._id}/comment`,
        { text },
        { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
      );
      if (res.data.success) {
        const updatedCommentData = [...comment, res.data.comment];
        setComment(updatedCommentData);
        const updatedPostData = posts.map(p =>
          p._id === selectedPost._id ? { ...p, comments: updatedCommentData } : p
        );
        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
        setText('');
      }
    } catch (error) {
      console.error('Error sending comment:', error);
      toast.error(error.response?.data?.message || 'Failed to add comment');
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        onInteractOutside={() => setOpen(false)}
        className="flex flex-col md:flex-row max-w-4xl w-full md:h-[600px] h-[80vh] rounded-lg overflow-hidden"
      >
        {/* Left: Image */}
        <div className="w-full md:w-1/2 h-64 md:h-auto">
          <img
            src={selectedPost?.image}
            alt="post_image"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right: Comments Section */}
        <div className="w-full md:w-1/2 flex flex-col justify-between bg-white">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b">
            <div className="flex gap-2 items-center">
              <Link>
                <Avatar>
                  <AvatarImage
                    src={selectedPost?.author?.profilePicture}
                    alt={selectedPost?.author?.username}
                    className="w-10 h-10 object-cover rounded-full"
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </Link>
              <Link className="font-semibold text-sm">
                {selectedPost?.author?.username}
              </Link>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <MoreHorizontal className="cursor-pointer" />
              </DialogTrigger>
              <DialogContent className="flex flex-col items-center text-sm text-center">
                <div className="cursor-pointer text-[#ED4956] font-bold">Unfollow</div>
                <div className="cursor-pointer">Add to favorites</div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Comments */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {comment.map(c => (
              <Comment key={c._id} comment={c} />
            ))}
          </div>

          {/* Add Comment */}
          <div className="p-3 border-t flex items-center gap-2">
            <input
              value={text}
              onChange={changeEventHandler}
              placeholder="Add a comment..."
              className="flex-1 p-2 border rounded outline-none text-sm"
            />
            <Button
              onClick={sendMessageHandler}
              disabled={!text.trim()}
              variant="outline"
            >
              Send
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentDialog;
