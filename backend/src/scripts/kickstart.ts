
import "dotenv/config";
import mongoose from "mongoose";
import ReportSettingModel from "../models/report-setting.model";
import { Env } from "../config/env.config";
import "../models/user.model";

const kickstart = async () => {
    try {
        await mongoose.connect(Env.MONGO_URI);
        const settings = await ReportSettingModel.findOne({});
        if (settings) {
            console.log(`Current Next Date: ${settings.nextReportDate}`);

            // Set it to 5 minutes ago to ensure it's picked up
            const past = new Date(new Date().getTime() - 5 * 60 * 1000);

            settings.nextReportDate = past;
            settings.isEnabled = true;
            await settings.save();

            console.log(`✅ RESET COMPLETE: Next Date set to ${past.toISOString()}`);
            console.log("The scheduler (running every minute) should pick this up in < 60 seconds.");
        } else {
            console.log("No settings found.");
        }
    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

kickstart();
