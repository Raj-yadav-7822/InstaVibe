import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './ui/select';
import { Loader2 } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { setAuthUser } from '@/redux/authSlice';

const EditProfile = () => {
  const imageRef = useRef();
  const { user } = useSelector((store) => store.auth);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState({
    profilePhoto: user?.profilePicture,
    bio: user?.bio || '',
    gender: user?.gender || ''
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ✅ Use your .env API base
  const API = import.meta.env.VITE_API_URL;

  // ✅ File change handler
  const fileChangeHandler = (e) => {
    const file = e.target.files?.[0];
    if (file) setInput({ ...input, profilePhoto: file });
  };

  // ✅ Gender select handler
  const selectChangeHandler = (value) => {
    setInput({ ...input, gender: value });
  };

  // ✅ Submit handler
  const editProfileHandler = async () => {
    const formData = new FormData();
    formData.append('bio', input.bio);
    formData.append('gender', input.gender);
    if (input.profilePhoto) formData.append('profilePhoto', input.profilePhoto);

    try {
      setLoading(true);
      const res = await axios.post(`${API}/user/profile/edit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });

      if (res.data.success) {
        const updatedUserData = {
          ...user,
          bio: res.data.user?.bio,
          profilePicture: res.data.user?.profilePicture,
          gender: res.data.user?.gender
        };
        dispatch(setAuthUser(updatedUserData));
        navigate(`/profile/${user?._id}`);
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row max-w-3xl mx-auto w-full p-4 md:p-10 gap-6">
      <section className="flex-1 flex flex-col gap-6 w-full">
        <h1 className="font-bold text-xl">Edit Profile</h1>

        {/* Profile Photo */}
        <div className="flex flex-col md:flex-row items-center justify-between bg-gray-100 rounded-xl p-4 gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Avatar className="w-20 h-20 md:w-24 md:h-24">
              <AvatarImage src={input.profilePhoto} alt="profile_image" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden w-full">
              <h1 className="font-bold text-sm md:text-lg truncate">{user?.username}</h1>
              
              {/* ✅ Responsive long bio */}
              <span className="text-gray-600 text-xs md:text-sm break-words max-w-full whitespace-pre-wrap">
                {user?.bio || 'Bio here...'}
              </span>
            </div>
          </div>

          <input
            ref={imageRef}
            onChange={fileChangeHandler}
            type="file"
            className="hidden"
          />
          <Button
            onClick={() => imageRef?.current.click()}
            className="bg-[#0095F6] h-8 md:h-10 hover:bg-[#318bc7] w-full md:w-auto"
          >
            Change photo
          </Button>
        </div>

        {/* Bio Section */}
        <div>
          <h1 className="font-bold text-xl mb-2">Bio</h1>
          <Textarea
            value={input.bio}
            onChange={(e) => setInput({ ...input, bio: e.target.value })}
            name="bio"
            className="focus-visible:ring-transparent w-full"
            placeholder="Write something about yourself..."
          />
        </div>

        {/* Gender Section */}
        <div>
          <h1 className="font-bold mb-2">Gender</h1>
          <Select defaultValue={input.gender} onValueChange={selectChangeHandler}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          {loading ? (
            <Button className="w-full md:w-auto bg-[#0095F6] hover:bg-[#2a8ccd] flex items-center justify-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
            </Button>
          ) : (
            <Button
              onClick={editProfileHandler}
              className="w-full md:w-auto bg-[#0095F6] hover:bg-[#2a8ccd]"
            >
              Submit
            </Button>
          )}
        </div>
      </section>
    </div>
  );
};

export default EditProfile;
