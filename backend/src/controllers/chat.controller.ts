import { Request, Response } from "express";
import { HTTPSTATUS } from "../config/http.config";
import { asyncHandler } from "../middlewares/asyncHandler.middlerware";
import { BadRequestException } from "../utils/app-error";
import axios from "axios";
import { Env } from "../config/env.config";

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
    const aiServiceUrl = `${Env.PYTHON_AI_SERVICE_URL}/chat`;
    console.log(`[ChatController] Outgoing request to: ${aiServiceUrl}`);
    console.log(`[ChatController] Request body:`, { userId: userId.toString(), message });

    const aiResponse = await axios.post(aiServiceUrl, {
      userId: userId.toString(),
      history: history || [],
      message: message
    }, {
      timeout: 30000 // Add 30s timeout for Render free tier wake-up
    });

    console.log(`[ChatController] Success from Python AI Service`);

    res.status(HTTPSTATUS.OK).json({
      message: "Success",
      data: {
        reply: aiResponse.data.data.reply
      }
    });

  } catch (error: any) {
    console.error("[ChatController] Python AI Service Error:", {
      message: error.message,
      url: error.config?.url,
      response: error.response?.data
    });

    const errMessage = error.response?.data?.detail || "Error connecting to AI service. Please ensure the Python microservice is running.";
    res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      message: errMessage
    });
  }
});
