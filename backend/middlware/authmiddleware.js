import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";

const protect = asyncHandler(async (req, res, next) => {
  let token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.userId).select("-password");

      next();
    } catch (error) {
      res.status(401).json({ message: "Not authorized, Invalid token" });
      return;
    }
  } else {
    res.status(401).json({ message: "Not authorized, No token" });
    return; // Ensure no further code execution
  }
});

export { protect };
