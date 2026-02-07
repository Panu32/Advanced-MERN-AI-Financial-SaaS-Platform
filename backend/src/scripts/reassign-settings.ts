
import "dotenv/config";
import mongoose from "mongoose";
import ReportSettingModel from "../models/report-setting.model";
import UserModel from "../models/user.model";
import { Env } from "../config/env.config";

const reassignSettings = async () => {
    try {
        await mongoose.connect(Env.MONGO_URI);
        console.log("Connected to MongoDB");

        const targetEmail = "pranavvaidya2005@gmail.com";
        const correctUser = await UserModel.findOne({ email: targetEmail });

        if (!correctUser) {
            console.log(`❌ Target user ${targetEmail} NOT FOUND.`);
            return;
        }

        console.log(`✅ Found target user: ${correctUser._id} (${correctUser.email})`);

        // Find the setting we've been using (or all settings) and update them
        const setting = await ReportSettingModel.findOne({});

        if (setting) {
            console.log(`Current setting belongs to: ${setting.userId}`);
            setting.userId = correctUser._id as any;
            await setting.save();
            console.log(`✅ Updated report setting to point to user ${correctUser._id}`);
        } else {
            // Create a new setting if none exists
            console.log("No setting found, creating one...");
            await ReportSettingModel.create({
                userId: correctUser._id,
                isEnabled: true,
                frequency: "MONTHLY",
                nextReportDate: new Date()
            });
            console.log("✅ Created new report setting.");
        }

    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await mongoose.disconnect();
    }
};

reassignSettings();
