import React, { useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import axios from 'axios'
import { toast } from 'sonner'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { setAuthUser } from '@/redux/authSlice'

const Login = () => {
  const [input, setInput] = useState({
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const loginHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/user/login`,
        input,
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        }
      );

      if (res.data.success) {
        dispatch(setAuthUser(res.data.user));
        toast.success(res.data.message);
        navigate("/");
        setInput({ email: "", password: "" });
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex items-center w-screen h-screen justify-center'>
      <form onSubmit={loginHandler} className='shadow-lg flex flex-col gap-5 p-8'>
        <div className='my-4'>
          <h1   className="my-8 pl-3 font-extrabold text-3xl text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-blue-700 cursor-pointer tracking-tight"
  style={{ fontFamily: "'Inter', sans-serif" }}>InstaVibe</h1>
          <p className='text-sm text-center'>Login to see photos & videos from your friends</p>
        </div>

        <div>
          <span className='font-medium'>Email</span>
          <Input
            type="email"
            name="email"
            value={input.email}
            onChange={changeEventHandler}
            className="focus-visible:ring-transparent my-2"
          />
        </div>

        <div>
          <span className='font-medium'>Password</span>
          <Input
            type="password"
            name="password"
            value={input.password}
            onChange={changeEventHandler}
            className="focus-visible:ring-transparent my-2"
          />
        </div>

        {loading ? (
          <Button disabled>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            Please wait...
          </Button>
        ) : (
          <Button type='submit'>Login</Button>
        )}

        <span className='text-center'>
          Don't have an account?{" "}
          <Link to="/signup" className='text-blue-600'>
            Sign Up
          </Link>
        </span>
      </form>
    </div>
  );
};

export default Login;
