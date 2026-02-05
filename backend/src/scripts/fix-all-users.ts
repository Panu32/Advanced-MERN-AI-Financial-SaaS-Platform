
import "dotenv/config";
import mongoose from "mongoose";
import ReportSettingModel from "../models/report-setting.model";
import UserModel from "../models/user.model";
import { Env } from "../config/env.config";

const fixAll = async () => {
    try {
        await mongoose.connect(Env.MONGO_URI);

        // Update ALL users to the verified email
        const result = await UserModel.updateMany(
            {},
            { $set: { email: "pranavvaidya2005@gmail.com" } }
        );

        console.log(`✅ Updated ${result.modifiedCount} users to 'pranavvaidya2005@gmail.com'.`);
        console.log("All accounts in the database now use your verified email.");

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

fixAll();
