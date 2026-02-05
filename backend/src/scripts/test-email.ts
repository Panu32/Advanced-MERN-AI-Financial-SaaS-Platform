
import "dotenv/config";
import { sendEmail } from "../mailers/mailer";
import mongoose from "mongoose";
import ReportSettingModel from "../models/report-setting.model";
import { Env } from "../config/env.config";
import "../models/user.model";

const testEmail = async () => {
    try {
        await mongoose.connect(Env.MONGO_URI);
        console.log("Connected to MongoDB for Email Test");

        // Find a user email to send to
        const settings = await ReportSettingModel.findOne({}).populate("userId");
        if (settings && settings.userId) {
            const user = settings.userId as any;
            const email = user.email;
            console.log(`Found user email: ${email}`);

            console.log("Attempting to send test email...");
            const result = await sendEmail({
                to: email,
                subject: "Test Email from Finora Debugger",
                text: "This is a test email to verify your Resend configuration.",
                html: "<p>This is a test email to verify your <strong>Resend</strong> configuration.</p>"
            });

            console.log("Email Result:", JSON.stringify(result, null, 2));

            if (result.error) {
                console.error("❌ Email failed to send:", result.error);
            } else {
                console.log("✅ Email sent successfully (check inbox). ID:", result.data?.id);
            }
        } else {
            console.log("No user found to send email to.");
        }

    } catch (error) {
        console.error("❌ Script Error:", error);
    } finally {
        await mongoose.disconnect();
    }
};

testEmail();
