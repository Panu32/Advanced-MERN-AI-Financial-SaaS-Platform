
import "dotenv/config";
import mongoose from "mongoose";
import { processReportJob } from "../src/cron/jobs/report.job";
import ReportSettingModel from "../src/models/report-setting.model";
import { Env } from "../src/config/env.config";
import "../src/models/user.model";
import "../src/models/transaction.model";
import "../src/models/report.model";

const run = async () => {
    try {
        await mongoose.connect(Env.MONGO_URI);
        console.log("Connected to MongoDB");

        // Force a user to be ready for report
        const settings = await ReportSettingModel.findOne({});
        if (settings) {
            console.log(`Found setting for user: ${settings.userId}`);
            settings.nextReportDate = new Date(new Date().getTime() - 10000); // 10 seconds ago
            settings.isEnabled = true;
            await settings.save();
            console.log("Updated report setting to force run");

            // Run the job
            console.log("Starting job...");
            await processReportJob();

            // Check report
            const ReportModel = mongoose.model("Report");
            const report = await ReportModel.findOne({ userId: settings.userId }).sort({ createdAt: -1 });
            console.log("Latest Report BudgetPlan:", JSON.stringify(report?.toObject().budgetPlan, null, 2));

        } else {
            console.log("No report settings found. Please ensure there is at least one user with report settings.");
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
};

run();
