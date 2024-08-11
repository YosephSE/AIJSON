import Post from "../models/postModel.js";
import mongoose from "mongoose";

const deletePost = async (req, res) => {
  const postId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ message: "Invalid post ID" });
  }

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.authorId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "User not authorized to delete this post" });
    }

    await post.deleteOne();

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const createPost = async (req, res) => {
  try {
    const authorId = req.user._id;
    const { title, content, category, image } = req.body;

    if (!title || !content || !authorId || !category || !image) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(authorId)) {
      return res.status(400).json({ message: "Invalid authorId format" });
    }

    const newPost = new Post({
      title,
      content,
      authorId,
      category,
      image,
    });

    const savedPost = await newPost.save();

    res.status(201).json(savedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const allPosts = async (req, res) => {
  try {
    let posts = await Post.find()
      .select("-authorId")
      .select("-comments.authorId");

    res.json(posts);
  } catch (err) {
    console.error("Error retrieving posts:", err);
    res.status(500).json({ error: "An error occurred while retrieving posts" });
  }
};

const singlePost = async (req, res) => {
  const postId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ error: "Invalid post ID" });
  }

  try {
    const vent = await Post.findOne({ _id: postId })
      .select("-authorId")
      .select("-comments.authorId");

    if (!vent) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.status(200).json({ vent });
  } catch (err) {
    console.error("Error retrieving post:", err);
    res
      .status(500)
      .json({ error: "An error occurred while retrieving the post" });
  }
};

const editPost = async (req, res) => {
  const postId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ message: "Invalid post ID" });
  }

  const { title, content, category, image } = req.body;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.authorId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "User not authorized to update this post" });
    }

    if (title) post.title = title;
    if (content) post.content = content;
    if (category) post.category = category;
    if (image) post.image = image;

    const updatedPost = await post.save();

    res.status(200).json(updatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const addComment = async (req, res) => {
  const postId = req.params.postId;

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ message: "Invalid postId format" });
  }

  const authorId = req.user._id;
  const { content } = req.body;
  if (!authorId || !content) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const newComment = {
      authorId: authorId,
      content: content,
    };
    post.comments.push(newComment);
    const updatedPost = await post.save();
    res.status(201).json(updatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteComment = async (req, res) => {
  const { postId, commentId } = req.params;
  const newCommentId = new mongoose.Types.ObjectId(commentId);

  // if (
  //   !mongoose.Types.ObjectId.isValid(postId) ||
  //   !mongoose.Types.ObjectId.isValid(commentId)
  // ) {
  //   return res
  //     .status(400)
  //     .json({ message: "Invalid postId or commentId format" });
  // }

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const commentIndex = post.comments.findIndex((comment) =>
      comment._id.equals(newCommentId)
    );

    if (commentIndex === -1) {
      return res.status(404).json({ message: "Comment not found" });
    }

    post.comments.splice(commentIndex, 1);

    await post.save();

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const myPosts = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      return res.status(404).json({ message: "User Not Found" });
    }

    const userPosts = await Post.find({
      authorId: userId,
    });

    if (userPosts.length === 0) {
      return res.status(200).json({ message: "No posts found for this user" });
    }

    res.status(200).json(userPosts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export {
  deletePost,
  createPost,
  editPost,
  singlePost,
  allPosts,
  addComment,
  deleteComment,
  myPosts,
};
