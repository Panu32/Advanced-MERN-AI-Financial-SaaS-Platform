
import "dotenv/config";
import mongoose from "mongoose";
import ReportSettingModel from "../models/report-setting.model";
import { Env } from "../config/env.config";
import "../models/user.model";

const checkEmail = async () => {
    try {
        await mongoose.connect(Env.MONGO_URI);
        console.log("Connected to MongoDB");

        const settings = await ReportSettingModel.findOne({}).populate("userId");
        if (settings && settings.userId) {
            const user = settings.userId as any;
            console.log(`\n🔍 CURRENT SETUP:`);
            console.log(`The system is trying to send the report to: '${user.email}'`);
            console.log(`User Name: ${user.name}`);
            console.log(`User ID: ${user._id}`);
            console.log(`\nIf '${user.email}' is NOT your verified Resend email, the email will fail in Sandbox mode.`);
        } else {
            console.log("No user found with report settings.");
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
};

checkEmail();
