import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import Signup from "./components/Signup";
import Login from "./components/Login";
import MainLayout from "./components/MainLayout";
import Home from "./components/Home";
import Profile from "./components/Profile";
import EditProfile from "./components/EditProfile";
import ChatPage from "./components/ChatPage";
import Notifications from "./components/Notifications";
import Search from "./components/Search";
import { io } from "socket.io-client";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSocket } from "./redux/socketSlice";
import { setOnlineUsers } from "./redux/chatSlice";
import {
  setLikeNotification,
  setMessageNotification,
  markLikesAsRead,
  markMessagesAsRead,
} from "./redux/rtnSlice";
import ProtectedRoutes from "./components/ProtectedRoutes";

const browserRouter = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoutes> <MainLayout /></ProtectedRoutes>,
    children: [
      { path: "/", element: <ProtectedRoutes><Home /></ProtectedRoutes>  },
      { path: "/profile/:id", element: <ProtectedRoutes><Profile /> </ProtectedRoutes> },
      { path: "/account/edit", element:<ProtectedRoutes><EditProfile /> </ProtectedRoutes> },
      { path: "/chat", element:<ProtectedRoutes><ChatPage /> </ProtectedRoutes> },
      { path: "/notifications", element: <ProtectedRoutes><Notifications /> </ProtectedRoutes>},
       { path: "/search", element:<ProtectedRoutes><Search /> </ProtectedRoutes> },
    ],
  },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
]);

function App() {
  const { user } = useSelector((store) => store.auth);
  const { socket } = useSelector((store) => store.socketio);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      console.log("Connecting socket for user:", user._id);

 const socketio = io(import.meta.env.VITE_SOCKET_URL, {
  query: { userId: user?._id },
  transports: ["websocket"],
});

      dispatch(setSocket(socketio));

      //  Online users
      socketio.on("getOnlineUsers", (onlineUsers) => {
        dispatch(setOnlineUsers(onlineUsers));
      });

      // Like notifications
      socketio.on("notification", (notification) => {
        dispatch(setLikeNotification(notification));
      });

      // Message notifications
      socketio.on("getMessageNotification", ({ senderId, text }) => {
        dispatch(
          setMessageNotification({
            senderId,
            text,
            time: new Date().toISOString(),
          })
        );
      });

      //  Mark notifications read when navigating to /notifications
      const handleRouteChange = () => {
        if (window.location.pathname === "/notifications") {
          dispatch(markLikesAsRead());
          dispatch(markMessagesAsRead());
        }
      };

      window.addEventListener("popstate", handleRouteChange);
      handleRouteChange(); // first check on mount

      // Cleanup
      return () => {
        socketio.close();
        dispatch(setSocket(null));
        window.removeEventListener("popstate", handleRouteChange);
      };
    } else if (socket) {
      socket.close();
      dispatch(setSocket(null));
    }
  }, [user, dispatch]);

  return <RouterProvider router={browserRouter} />;
}

export default App;
