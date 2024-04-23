import Post from "../models/Post.js";
import User from "../models/User.js";

/*CREATE */
export const createPost = async (req, res) => {
  try {
    const { userId, description, picturePath } = req.body;
    const user = await User.findById(userId);
    const newPost = new Post({
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      location: user.location,
      description,
      userPicturePath: user.picturePath,
      picturePath,
      likes: {},
      comments: [],
    });
    await newPost.save();
    const post = await Post.find();
    res.status(201).json(post);
  } catch (err) {
    res.status(409).json({ mesage: err.message });
  }
};

/*READ */

export const getFeedPosts = async (req, res) => {
  try {
    const post = await Post.find();
    res.status(200).json(post);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const post = await Post.find({ userId });
    res.status(200).json(post);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/*UPDATE */
export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const post = await Post.findById({ id });
    const isLiked = post.likes.get({ userId });

    if (isLiked) {
      post.likes.delete(userId);
    } else {
      post.likes.set(userId, true);
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { likes: post.likes },
      { new: true }
    );

    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, comment } = req.body;

    // Fetch user data to get userName and userImage
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.comments.push({
      userId,
      userName: `${user.firstName} ${user.lastName}`,
      userImage: user.picturePath,
      comment,
    });
    await post.save();

    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    // const { id } = req.params; // Post ID
    // const { commentId } = req.body; // Comment ID

    const { id, commentId } = req.params; // Post ID and Comment ID

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Find the index of the comment in the comments array
    const commentIndex = post.comments.findIndex(
      (comment) => comment._id === commentId
    );

    // Check if the comment exists
    if (commentIndex === -1) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if the user trying to delete the comment is the author of the comment
    if (post.comments[commentIndex].userId !== req.user._id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Remove the comment from the comments array
    post.comments.splice(commentIndex, 1);
    await post.save();

    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* SEARCH */
/* SEARCH */
export const searchUsers = async (req, res) => {
  try {
    const { firstName, lastName } = req.query;
    const user = await User.findOne({ firstName, lastName });
    if (user) {
      res.status(200).json({ userId: user._id });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
