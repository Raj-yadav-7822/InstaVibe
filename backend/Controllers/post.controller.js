import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../model/post.model.js";
import { User } from "../model/user.model.js";
import { Comment } from "../model/comment.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import wrapAsyncHandler from "../utils/wrapAsync.js";
import jwt from "jsonwebtoken";
// Add New Post
export const addNewPost = wrapAsyncHandler(async (req, res) => {
  const { caption } = req.body;
  const image = req.file;

  
  if (!image) {
    return res
      .status(400)
      .json({ message: "Image required", success: false });
  }


  const token = req.cookies.token; 
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  let authorId;
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    authorId = decoded.userId;
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }

  
  const optimizedImageBuffer = await sharp(image.buffer)
    .resize({ width: 800, height: 800, fit: "inside" })
    .toFormat("jpeg", { quality: 80 })
    .toBuffer();

  const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString(
    "base64"
  )}`;

  let cloudResponse;
  try {
    cloudResponse = await cloudinary.uploader.upload(fileUri);
  } catch (err) {
    console.error("Cloudinary upload failed:", err);
    return res
      .status(500)
      .json({ success: false, message: "Image upload failed" });
  }

  const post = await Post.create({
    caption,
    image: cloudResponse.secure_url,
    author: authorId, // ✅ required field filled
  });

  const user = await User.findById(authorId);
  if (user) {
    user.posts.push(post._id);
    await user.save();
  }


  await post.populate({ path: "author", select: "-password" });


  return res.status(201).json({
    message: "New post added",
    post,
    success: true,
  });
});

//  Get All Posts
export const getAllPost = wrapAsyncHandler(async (req, res) => {
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .populate({ path: "author", select: "username profilePicture" })
    .populate({
      path: "comments",
      sort: { createdAt: -1 },
      populate: {
        path: "author",
        select: "username profilePicture",
      },
    });

  return res.status(200).json({
    posts,
    success: true,
  });
});

// Get User’s Own Posts
export const getUserPost = wrapAsyncHandler(async (req, res) => {
  const authorId = req.id;

  const posts = await Post.find({ author: authorId })
    .sort({ createdAt: -1 })
    .populate({
      path: "author",
      select: "username profilePicture",
    })
    .populate({
      path: "comments",
      sort: { createdAt: -1 },
      populate: {
        path: "author",
        select: "username profilePicture",
      },
    });

  return res.status(200).json({
    posts,
    success: true,
  });
});

// Like Post
export const likePost = wrapAsyncHandler(async (req, res) => {
  const likeKrneWalaUserKiId = req.id;
  const postId = req.params.id;

  const post = await Post.findById(postId);
  if (!post)
    return res.status(404).json({ message: "Post not found", success: false });

  await post.updateOne({ $addToSet: { likes: likeKrneWalaUserKiId } });
  await post.save();

  const user = await User.findById(likeKrneWalaUserKiId).select(
    "username profilePicture"
  );

  const postOwnerId = post.author.toString();

  if (postOwnerId !== likeKrneWalaUserKiId) {
    const notification = {
      type: "like",
      userId: likeKrneWalaUserKiId,
      userDetails: user,
      postId,
      message: "Your post was liked",
    };
    const postOwnerSocketId = getReceiverSocketId(postOwnerId);
    if (postOwnerSocketId)
      io.to(postOwnerSocketId).emit("notification", notification);
  }

  return res.status(200).json({ message: "Post liked", success: true });
});

//  Dislike Post
export const dislikePost = wrapAsyncHandler(async (req, res) => {
  const likeKrneWalaUserKiId = req.id;
  const postId = req.params.id;

  const post = await Post.findById(postId);
  if (!post)
    return res.status(404).json({ message: "Post not found", success: false });

  await post.updateOne({ $pull: { likes: likeKrneWalaUserKiId } });
  await post.save();

  const user = await User.findById(likeKrneWalaUserKiId).select(
    "username profilePicture"
  );
  const postOwnerId = post.author.toString();

  if (postOwnerId !== likeKrneWalaUserKiId) {
    const notification = {
      type: "dislike",
      userId: likeKrneWalaUserKiId,
      userDetails: user,
      postId,
      message: "Your post was disliked",
    };
    const postOwnerSocketId = getReceiverSocketId(postOwnerId);
    if (postOwnerSocketId)
      io.to(postOwnerSocketId).emit("notification", notification);
  }

  return res.status(200).json({ message: "Post disliked", success: true });
});

// Add Comment
export const addComment = wrapAsyncHandler(async (req, res) => {
  try {
    const postId = req.params.id;
    const commentKrneWalaUserKiId = req.id; 
    const { text } = req.body;

    // Validation
    if (!text) {
      return res
        .status(400)
        .json({ message: "Text is required", success: false });
    }

    if (!commentKrneWalaUserKiId) {
      return res
        .status(401)
        .json({ message: "User not authenticated", success: false });
    }

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ message: "Post not found", success: false });
    }

    // Create comment
    const comment = await Comment.create({
      text,
      author: commentKrneWalaUserKiId,
      post: postId,
    });

    // Populate author info
    await comment.populate({
      path: "author",
      select: "username profilePicture",
    });

    // Add comment to post
    post.comments.push(comment._id);
    await post.save();

    return res.status(201).json({
      message: "Comment Added",
      comment,
      success: true,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", success: false });
  }
});


// Get Comments of a Post
export const getCommentsOfPost = wrapAsyncHandler(async (req, res) => {
  const postId = req.params.id;

  const comments = await Comment.find({ post: postId }).populate(
    "author",
    "username profilePicture"
  );

  if (!comments.length)
    return res
      .status(404)
      .json({ message: "No comments found for this post", success: false });

  return res.status(200).json({ success: true, comments });
});

//  Delete Post
export const deletePost = wrapAsyncHandler(async (req, res) => {
  const postId = req.params.id;
  const authorId = req.id;

  const post = await Post.findById(postId);
  if (!post)
    return res.status(404).json({ message: "Post not found", success: false });

  if (post.author.toString() !== authorId)
    return res.status(403).json({ message: "Unauthorized" });

  await Post.findByIdAndDelete(postId);

  const user = await User.findById(authorId);
  user.posts = user.posts.filter((id) => id.toString() !== postId);
  await user.save();

  await Comment.deleteMany({ post: postId });

  return res.status(200).json({
    success: true,
    message: "Post deleted",
  });
});

//  Bookmark Post
export const bookmarkPost = wrapAsyncHandler(async (req, res) => {
  const postId = req.params.id;
  const authorId = req.id;

  const post = await Post.findById(postId);
  if (!post)
    return res.status(404).json({ message: "Post not found", success: false });

  const user = await User.findById(authorId);

  if (user.bookmarks.includes(post._id)) {
    await user.updateOne({ $pull: { bookmarks: post._id } });
    await user.save();
    return res.status(200).json({
      type: "unsaved",
      message: "Post removed from bookmark",
      success: true,
    });
  } else {
    await user.updateOne({ $addToSet: { bookmarks: post._id } });
    await user.save();
    return res.status(200).json({
      type: "saved",
      message: "Post bookmarked",
      success: true,
    });
  }
});
