import { Dialog, DialogContent, DialogHeader } from './ui/dialog'
import React, { useRef, useState } from 'react'
import { Textarea } from './ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { readFileAsDataURL } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { setPosts } from '@/redux/postSlice'

const CreatePost = ({ open, setOpen }) => {
  const imageRef = useRef()
  const [file, setFile] = useState(null)
  const [caption, setCaption] = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const [loading, setLoading] = useState(false)

  const { user } = useSelector(store => store.auth)
  const dispatch = useDispatch()
  const { posts } = useSelector(store => store.post)

  // File selection handler
  const fileChangeHandler = async e => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return
    setFile(selectedFile)
    const dataUrl = await readFileAsDataURL(selectedFile)
    setImagePreview(dataUrl)
  }

  // Create Post handler
  const createPostHandler = async e => {
    e.preventDefault()

    if (loading) return

    if (!caption.trim() || !file) {
      toast.error('Caption and image are required!')
      return
    }

    const formData = new FormData()
    formData.append('caption', caption.trim())
    formData.append('image', file)

    try {
      setLoading(true)
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/post/addpost`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        }
      )

      if (res.data.success) {
        dispatch(setPosts([res.data.post, ...posts]))
        toast.success(res.data.message)

        // Reset form
        setOpen(false)
        setCaption('')
        setFile(null)
        setImagePreview('')
        if (imageRef.current) imageRef.current.value = ''
      }
    } catch (error) {
      console.error('CreatePost Error:', error)
      toast.error(error.response?.data?.message || 'Something went wrong!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open}>
      <DialogContent
        onInteractOutside={() => setOpen(false)}
        className="max-w-lg w-full p-6 rounded-lg sm:max-w-xl md:max-w-2xl"
      >
        <DialogHeader className="text-center font-semibold text-lg">
          Create New Post
        </DialogHeader>

        {/* User Info */}
        <div className="flex items-center gap-3 mt-3">
          <Avatar>
            <AvatarImage
              src={user?.profilePicture || '/default-avatar.png'}
              alt={user?.username || 'User avatar'}
            />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="flex flex-col max-w-[70%]">
            <h1 className="font-semibold text-sm">{user?.username}</h1>
            <span className="text-gray-600 text-xs break-words">
              {user?.bio || 'Bio here...'}
            </span>
          </div>
        </div>

        {/* Caption Input */}
        <Textarea
          value={caption}
          onChange={e => setCaption(e.target.value)}
          className="mt-4 focus-visible:ring-transparent border border-gray-200 rounded-md text-sm"
          placeholder="Write a caption..."
        />

        {/* Image Preview */}
        {imagePreview && (
          <div className="w-full h-64 flex items-center justify-center mt-4">
            <img
              src={imagePreview}
              alt="preview_img"
              className="object-cover h-full w-full rounded-md"
            />
          </div>
        )}

        {/* File Upload */}
        <input
          ref={imageRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={fileChangeHandler}
        />
        <Button
          onClick={() => imageRef.current?.click()}
          className="w-fit mx-auto mt-4 bg-[#0095F6] hover:bg-[#258bcf]"
        >
          Select from device
        </Button>

        {/* Post Button */}
        {file && (
          <div className="mt-4">
            <Button
              onClick={createPostHandler}
              className="w-full flex items-center justify-center"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Please wait...' : 'Post'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default CreatePost
