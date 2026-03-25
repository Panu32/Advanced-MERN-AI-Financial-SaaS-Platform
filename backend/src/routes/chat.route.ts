import { Router } from "express";
import { handleChat } from "../controllers/chat.controller";

const chatRoutes = Router();

chatRoutes.post("/", handleChat);

export default chatRoutes;
