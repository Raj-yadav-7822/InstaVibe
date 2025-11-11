import { Conversation } from "../model/conversation.model.js";
import { Message } from "../model/message.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import wrapAsyncHandler from "../utils/wrapAsync.js";

export const sendMessage = wrapAsyncHandler(async (req, res) => {
  const senderId = req.id;
  const receiverId = req.params.id;
  const { textMessage: message } = req.body;

  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  }).populate("messages");

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [senderId, receiverId],
    });
  }

  const newMessage = await Message.create({
    senderId,
    receiverId,
    message,
  });

  conversation.messages.push(newMessage._id);
  await Promise.all([conversation.save(), newMessage.save()]);

  const receiverSocketId = getReceiverSocketId(receiverId);
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("newMessage", newMessage);
    io.to(receiverSocketId).emit("getMessageNotification", {
      senderId,
      text: message,
    });
  }

  return res.status(201).json({
    success: true,
    newMessage,
  });
});

export const getMessage = wrapAsyncHandler(async (req, res) => {
  const senderId = req.id;
  const receiverId = req.params.id;

  const conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  }).populate("messages");

  if (!conversation) {
    return res.status(200).json({ success: true, messages: [] });
  }

  return res.status(200).json({
    success: true,
    messages: conversation.messages,
  });
});
