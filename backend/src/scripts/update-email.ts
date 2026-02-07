
import "dotenv/config";
import mongoose from "mongoose";
import ReportSettingModel from "../models/report-setting.model";
import UserModel from "../models/user.model";
import { Env } from "../config/env.config";

const updateEmail = async () => {
    try {
        await mongoose.connect(Env.MONGO_URI);
        console.log("Connected to MongoDB");

        const targetUserId = "692af3992f9d7bf9f9e2a064";
        const user = await UserModel.findById(targetUserId);

        if (!user) {
            console.log(`❌ User not found for ID: ${targetUserId}`);
            return;
        }

        console.log(`Current email for user ${user._id}: ${user.email}`);

        const newEmail = "pranavvaidya2005@gmail.com";
        user.email = newEmail;

        // Mark as modified just in case
        user.markModified('email');

        await user.save();

        // Fetch again to verify
        const updatedUser = await UserModel.findById(targetUserId);
        console.log(`✅ Verified updated email in DB: ${updatedUser?.email}`);

    } catch (error) {
        console.error("❌ Error updating email:", error);
    } finally {
        await mongoose.disconnect();
    }
};

updateEmail();
