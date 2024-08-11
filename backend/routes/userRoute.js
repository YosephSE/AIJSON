import express from "express";
import {
  status,
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  allAuthors,
} from "../controllers/userController.js";
import { protect } from "../middlware/authmiddleware.js";

const Router = express.Router();

Router.post("/", registerUser);
Router.get("/status", status)
Router.post("/auth", authUser);
Router.post("/logout", logoutUser);
Router.get("/profile", protect, getUserProfile);
Router.put("/profile", protect, updateUserProfile);
Router.get("/authors", allAuthors);

export default Router;
