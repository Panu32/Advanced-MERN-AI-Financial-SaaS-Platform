
import "dotenv/config";
import mongoose from "mongoose";
import { processReportJob } from "../cron/jobs/report.job";
import ReportSettingModel from "../models/report-setting.model";
import { Env } from "../config/env.config";
import "../models/user.model";
import "../models/transaction.model";
import "../models/report.model";

const forceReport = async () => {
    try {
        await mongoose.connect(Env.MONGO_URI);
        console.log("Connected to MongoDB");

        // Force a user to be ready for report
        const settings = await ReportSettingModel.findOne({}).populate("userId");
        if (settings) {
            const user = settings.userId as any;
            console.log(`Checking settings for user: ${user.email} (${user.name})`);
            console.log(`>>> TARGET EMAIL: ${user.email} <<<`);

            // Force it to be due NOW
            // We set it to 1 minute ago to ensure the query { nextReportDate: { $lte: now } } picks it up
            const now = new Date();
            const pastDate = new Date(now.getTime() - 60000);

            settings.nextReportDate = pastDate;
            settings.isEnabled = true;
            await settings.save();
            console.log(`✅ FORCE UPDATE: Report set to be due at ${pastDate.toISOString()}`);

            // Run the job
            console.log("🚀 Starting report generation job...");

            // Override to current month (February)
            const from = new Date();
            from.setDate(1); // 1st of current month
            from.setHours(0, 0, 0, 0);

            const to = new Date(); // Current date/time is fine for end, or end of month

            console.log(`Generating report for: ${from.toISOString()} - ${to.toISOString()}`);

            const result = await processReportJob(from, to);
            console.log("Job Result:", JSON.stringify(result, null, 2));

            if (result.success && (result as any).processedCount > 0) {
                console.log("✅ SUCCESS: Report generated and email sent!");
            } else {
                console.log("⚠️ WARNING: Job finished but processed 0 reports. Check logs.");
            }

        } else {
            console.log("❌ ERROR: No report settings found in database.");
        }

    } catch (error) {
        console.error("❌ CRITICAL ERROR:", error);
    } finally {
        await mongoose.disconnect();
    }
};

forceReport();
