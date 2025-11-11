import { createSlice } from "@reduxjs/toolkit";

const rtnSlice = createSlice({
  name: "realTimeNotification",
  initialState: {
    likeNotification: [],       
    messageNotification: []     //  Messages
  },
  reducers: {
    //  Like Notification
    setLikeNotification: (state, action) => {
      const { type, userId, username, profilePic, time } = action.payload;
      if (type === "like") {
        const exists = state.likeNotification.some(item => item.userId === userId);
        if (!exists) {
          state.likeNotification.unshift({
            userId,
            username,
            profilePic,
            type,
            time: time || new Date().toISOString(),
            isNew: true  
          });
        }
      } else if (type === "dislike") {
        state.likeNotification = state.likeNotification.filter(item => item.userId !== userId);
      }
    },

    //  Message Notification
    setMessageNotification: (state, action) => {
      const { senderId, text, senderName, senderProfile, time } = action.payload;
      const exists = state.messageNotification.some(msg => msg.senderId === senderId);
      if (!exists) {
        state.messageNotification.unshift({
          senderId,
          senderName,
          senderProfile,
          text,
          time: time || new Date().toISOString(),
          isNew: true
        });
      }
    },

    
    markLikesAsRead: (state) => {
      state.likeNotification.forEach(n => n.isNew = false);
    },

    
    markMessagesAsRead: (state) => {
      state.messageNotification.forEach(m => m.isNew = false);
    }
  }
});

export const {
  setLikeNotification,
  setMessageNotification,
  markLikesAsRead,
  markMessagesAsRead
} = rtnSlice.actions;

export default rtnSlice.reducer;
