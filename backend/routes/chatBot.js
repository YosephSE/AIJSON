import { protect } from "../middlware/authmiddleware.js";
import express from "express";
const Router = express.Router();

Router.post("/",protect, (req, res) => {
  res.json({ message: "Success post" });
});

export default Router;
