
import "dotenv/config";
import mongoose from "mongoose";
import ReportSettingModel from "../models/report-setting.model";
import UserModel from "../models/user.model";
import { Env } from "../config/env.config";

const updateEmail = async () => {
    try {
        await mongoose.connect(Env.MONGO_URI);
        console.log("Connected to MongoDB");

        // Find the user associated with report settings
        const settings = await ReportSettingModel.findOne({});
        if (settings) {
            const userId = settings.userId;
            console.log(`Updating email for user ID: ${userId}`);

            const updatedUser = await UserModel.findByIdAndUpdate(
                userId,
                { email: "pranavvaidya2005@gmail.com" },
                { new: true }
            );

            if (updatedUser) {
                console.log(`✅ User email updated successfully to: ${updatedUser.email}`);
            } else {
                console.log("❌ User not found.");
            }
        } else {
            console.log("❌ No report settings found to identify user.");
        }

    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await mongoose.disconnect();
    }
};

updateEmail();
