
import "dotenv/config";
import mongoose from "mongoose";
import { processReportJob } from "../cron/jobs/report.job";
import ReportSettingModel from "../models/report-setting.model";
import { Env } from "../config/env.config";
import "../models/user.model";
import "../models/transaction.model";
import "../models/report.model";

const run = async () => {
    try {
        await mongoose.connect(Env.MONGO_URI);
        console.log("Connected to MongoDB for Email Trigger");

        // Force a user to be ready for report
        const settings = await ReportSettingModel.findOne({});
        if (settings) {
            console.log(`Found setting for user: ${settings.userId}`);
            // Force it to be due NOW
            settings.nextReportDate = new Date(new Date().getTime() - 10000);
            settings.isEnabled = true;
            await settings.save();
            console.log("Updated report setting to force run now.");

            // Run the job
            console.log("Starting report generation job...");
            const result = await processReportJob();
            console.log("Job Result:", result);

            if (result.success && (result as any).processedCount > 0) {
                console.log("✅ Report generated and email should have been sent!");
            } else {
                console.log("⚠️ Job finished but might not have processed any reports (check logs).");
            }

        } else {
            console.log("No report settings found.");
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
};

run();
