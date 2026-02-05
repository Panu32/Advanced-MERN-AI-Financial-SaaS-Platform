
import "dotenv/config";
import mongoose from "mongoose";
import ReportSettingModel from "../models/report-setting.model";
import UserModel from "../models/user.model";
import { Env } from "../config/env.config";

const listUsers = async () => {
    try {
        await mongoose.connect(Env.MONGO_URI);
        console.log("Connected to MongoDB");

        const users = await UserModel.find({});
        console.log(`\nfound ${users.length} users in database:`);
        users.forEach(u => console.log(`- ID: ${u._id}, Name: ${u.name}, Email: '${u.email}'`));

        const settings = await ReportSettingModel.find({}).populate("userId");
        console.log(`\nfound ${settings.length} report settings:`);
        settings.forEach(s => {
            const u = s.userId as any;
            if (u) {
                console.log(`- Setting Enabled: ${s.isEnabled}, Next Date: ${s.nextReportDate}, User Email: '${u.email}'`);
            } else {
                console.log(`- Setting Enabled: ${s.isEnabled}, User: NULL/DELETED`);
            }
        });

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

listUsers();
