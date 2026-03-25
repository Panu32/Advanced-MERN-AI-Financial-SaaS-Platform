import { Request, Response } from "express";
import { HTTPSTATUS } from "../config/http.config";
import { asyncHandler } from "../middlewares/asyncHandler.middlerware";
import { BadRequestException } from "../utils/app-error";
import axios from "axios";

export const handleChat = asyncHandler(async (req: Request, res: Response) => {
  const { message, history } = req.body;
  const userId = req.user?._id;

  if (!userId) {
    throw new BadRequestException("User not found");
  }

  if (!message) {
    throw new BadRequestException("Message is required");
  }

  try {
    const aiResponse = await axios.post("http://127.0.0.1:8001/chat", {
      userId: userId.toString(),
      history: history || [],
      message: message
    });
    
    res.status(HTTPSTATUS.OK).json({
      message: "Success",
      data: {
        reply: aiResponse.data.data.reply
      }
    });

  } catch (error: any) {
    console.error("Python AI Service Error:", error.message);
    const errMessage = error.response?.data?.detail || "Error connecting to AI service. Please ensure the Python microservice is running.";
    res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
       message: errMessage
    });
  }
});
