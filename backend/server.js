import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import { notFound, errorHandler } from "./middlware/errorMiddleware.js";
import userRoutes from "./routes/userRoute.js";
import postRoutes from "./routes/postRoutes.js";
import chatBot from "./routes/chatBot.js";
import conncetDB from "./config/db.js";
import cors from "cors";
const port = process.env.PORT;
const app = express();
app.use(cookieParser());
app.use(
  cors({
    origin: ["https://eyoelm5.github.io", "http://localhost:5173"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Set-Cookie"],
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
conncetDB();

app.use("/api/users", userRoutes);
app.use("/api/vents", postRoutes);
app.use("/api/chatbot", chatBot);
app.get("/", (req, res) => {
  res.status(200).json({ message: "Successfully Deployed" });
});

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => console.log(`Server running of port ${port}`));
