import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import jwt from "jsonwebtoken";

const status = asyncHandler(async (req, res) => {
  const token = req.cookies.jwt;
  if (!token) {
    return res.json({ loggedIn: false });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    res.json({ loggedIn: true, user: user.name, userId: user._id });
  } catch (error) {
    res.json({ loggedIn: false });
  }
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id);
    res.status(200).json({ _id: user._id, name: user.name, email: user.email });
  } else {
    res.status(401);
    throw new Error("Invalid Email or Password");
  }
});

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, profilePicture } = req.body;
  console.log(name, email, password, profilePicture);
  if (!name || !email || !password || !profilePicture) {
    res.status(400).json({ message: "Incomplete Data" });
  }
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User Already Exists");
  }

  const user = await User.create({ name, email, password, profilePicture });

  if (user) {
    generateToken(res, user._id);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
    });
  } else {
    throw new Error("Invalid user Data");
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: process.env.ENV !== dev,
    expires: new Date(0),
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });
  res.status(200).json({ message: "User LoggedOut Successfully" });
});

const getUserProfile = asyncHandler(async (req, res) => {
  const user = {
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    profilePicture: req.user.profilePicture,
  };
  res.status(200).json(user);
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.profilePicture = req.body.profilePicture || user.profilePicture;

    if (req.body.password) {
      user.password = req.body.password;
    }
    const updatedUser = await user.save();
    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      profilePicture: updatedUser.profilePicture,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
  res.status(200).json({ message: "update User Profile" });
});

const allAuthors = async (req, res) => {
  try {
    const authors = await User.aggregate([
      {
        $lookup: {
          from: "posts",
          localField: "_id",
          foreignField: "authorId",
          as: "posts",
        },
      },
      {
        $project: {
          name: 1,
          profilePicture: 1,
          count: { $size: "$posts" },
        },
      },
    ]);

    res.status(200).json(authors);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export {
  status,
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  allAuthors,
};
