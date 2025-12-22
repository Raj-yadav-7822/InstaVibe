import { setPosts } from "@/redux/postSlice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import api from "@/utils/api";

const useGetAllPost = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchAllPost = async () => {
      try {
        const res = await api.get("/post/all");
        if (res.data.success) {
          dispatch(setPosts(res.data.posts));
        }
      } catch (error) {
        console.log(error.response?.data || error.message);
      }
    };

    fetchAllPost();
  }, [dispatch]);
};

export default useGetAllPost;
