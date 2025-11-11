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

  const API_BASE_URL = import.meta.env.VITE_API_URL; // ✅ use env base URL

  // ✅ Load comments when post changes
  useEffect(() => {
    if (selectedPost) {
      setComment(selectedPost.comments);
    }
  }, [selectedPost]);

  // ✅ Input change handler
  const changeEventHandler = (e) => {
    const inputText = e.target.value;
    setText(inputText.trim() ? inputText : '');
  };

  // ✅ Send Comment Handler
  const sendMessageHandler = async () => {
    if (!text.trim()) return;

    try {
      const res = await axios.post(
        `${API_BASE_URL}/post/${selectedPost?._id}/comment`,
        { text },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        const updatedCommentData = [...comment, res.data.comment];
        setComment(updatedCommentData);

        const updatedPostData = posts.map((p) =>
          p._id === selectedPost._id
            ? { ...p, comments: updatedCommentData }
            : p
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
        className='max-w-5xl p-0 flex flex-col'
      >
        <div className='flex flex-1'>
          {/* Left: Image */}
          <div className='w-1/2'>
            <img
              src={selectedPost?.image}
              alt='post_image'
              className='w-full h-full object-cover rounded-l-lg'
            />
          </div>

          {/* Right: Comments Section */}
          <div className='w-1/2 flex flex-col justify-between'>
            {/* Header */}
            <div className='flex items-center justify-between p-4'>
              <div className='flex gap-3 items-center'>
                <Link>
                  <Avatar>
                    <AvatarImage
                      className='object-cover rounded-full h-10 w-10'
                      src={selectedPost?.author?.profilePicture}
                    />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </Link>
                <div>
                  <Link className='font-semibold text-xs'>
                    {selectedPost?.author?.username}
                  </Link>
                </div>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <MoreHorizontal className='cursor-pointer' />
                </DialogTrigger>
                <DialogContent className='flex flex-col items-center text-sm text-center'>
                  <div className='cursor-pointer text-[#ED4956] font-bold'>
                    Unfollow
                  </div>
                  <div className='cursor-pointer'>Add to favorites</div>
                </DialogContent>
              </Dialog>
            </div>

            <hr />

            {/* Comments */}
            <div className='flex-1 overflow-y-auto max-h-96 p-4'>
              {comment.map((c) => (
                <Comment key={c._id} comment={c} />
              ))}
            </div>

            {/* Add Comment */}
            <div className='p-4'>
              <div className='flex items-center gap-2'>
                <input
                  onChange={changeEventHandler}
                  value={text}
                  type='text'
                  placeholder='Add a comment...'
                  className='w-full outline-none border border-gray-300 p-2 rounded'
                />
                <Button
                  disabled={!text.trim()}
                  onClick={sendMessageHandler}
                  variant='outline'
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentDialog;
