
import "dotenv/config";
import mongoose from "mongoose";
import ReportSettingModel from "../models/report-setting.model";
import { Env } from "../config/env.config";
import "../models/user.model";

const checkState = async () => {
    try {
        await mongoose.connect(Env.MONGO_URI);
        const settings = await ReportSettingModel.findOne({}).populate("userId");
        if (settings) {
            console.log("Current Report Settings:");
            console.log(`- User Email: ${(settings.userId as any).email}`);
            console.log(`- Next Report Date: ${settings.nextReportDate}`);
            console.log(`- Is Enabled: ${settings.isEnabled}`);
            console.log(`- Current Time: ${new Date()}`);

            if (!settings.nextReportDate) {
                console.log("⚠️ Result: Next report date is not set.");
            } else if (new Date() < new Date(settings.nextReportDate)) {
                console.log("⚠️ Result: No report is due. The next one is scheduled for the future.");
            } else {
                console.log("✅ Result: A report is due NOW.");
            }
        } else {
            console.log("No settings found.");
        }
    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

checkState();
