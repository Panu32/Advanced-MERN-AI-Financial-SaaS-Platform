
import "dotenv/config";
import mongoose from "mongoose";
import { generateReportService } from "../services/report.service";
import TransactionModel from "../models/transaction.model";
import UserModel from "../models/user.model";
import { Env } from "../config/env.config";
import { subDays } from "date-fns";

const verifyReportContent = async () => {
    try {
        await mongoose.connect(Env.MONGO_URI);
        console.log("Connected to MongoDB");

        // Find a user with transactions
        const transaction = await TransactionModel.findOne();
        if (!transaction) {
            console.log("❌ No transactions found in the database. Cannot test report generation.");
            return;
        }

        const userId = transaction.userId;
        const user = await UserModel.findById(userId);
        console.log(`Testing report generation for user: ${user?.email || userId}`);

        const endDate = new Date();
        const startDate = subDays(endDate, 30);

        console.log(`Generating report for period: ${startDate.toISOString()} - ${endDate.toISOString()}`);

        const report = await generateReportService(
            userId.toString(),
            startDate,
            endDate
        );

        if (!report) {
            console.log("❌ Report generation returned null (likely no data for period).");
        } else {
            console.log("✅ Report generated successfully.");
            console.log("--- Insights ---");
            console.log(JSON.stringify(report.insights, null, 2));
            console.log("--- Budget Plan ---");
            console.log(JSON.stringify(report.budgetPlan, null, 2));

            if (report.insights && report.insights.length > 0) {
                console.log("✅ Insights are populated.");
            } else {
                console.log("⚠️ Insights are EMPTY.");
            }

            if (report.budgetPlan && report.budgetPlan.length > 0) {
                console.log("✅ Budget Plan is populated.");
            } else {
                console.log("⚠️ Budget Plan is EMPTY.");
            }
        }

    } catch (error) {
        console.error("❌ Error during verification:", error);
    } finally {
        await mongoose.disconnect();
    }
};

verifyReportContent();
