
import "dotenv/config";
import mongoose from "mongoose";
import UserModel from "../models/user.model";
import ReportSettingModel from "../models/report-setting.model";
import { Env } from "../config/env.config";

const listUsers = async () => {
    try {
        await mongoose.connect(Env.MONGO_URI);
        console.log("Connected to MongoDB");

        const users = await UserModel.find({});
        console.log("\n--- Users ---");
        users.forEach(u => console.log(`ID: ${u._id}, Email: ${u.email}, Name: ${u.name}`));

        const settings = await ReportSettingModel.find({}).populate("userId");
        console.log("\n--- Report Settings ---");
        let enabledCount = 0;
        settings.forEach(s => {
            const u = s.userId as any;
            console.log(`Setting ID: ${s._id}, User ID: ${u._id}, User Email: ${u.email}, Enabled: ${s.isEnabled}`);
            if (s.isEnabled) enabledCount++;
        });
        console.log(`\nTotal Enabled Settings: ${enabledCount}`);

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

listUsers();
