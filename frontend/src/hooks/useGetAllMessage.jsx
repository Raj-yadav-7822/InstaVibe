import { setMessages } from "@/redux/chatSlice";
import { setPosts } from "@/redux/postSlice";
import api from "@/utils/api";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const useGetAllMessage = () => {
    const dispatch = useDispatch();
    const {selectedUser} = useSelector(store=>store.auth);
    useEffect(() => {
          if (!selectedUser?._id) return; 
          
        const fetchAllMessage = async () => {
            try {
                const res = await api.get(`/message/all/${selectedUser._id}`, { withCredentials: true });
                if (res.data.success) {  
                    dispatch(setMessages(res.data.messages));
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchAllMessage();
    }, [selectedUser,dispatch]);
};
export default useGetAllMessage;