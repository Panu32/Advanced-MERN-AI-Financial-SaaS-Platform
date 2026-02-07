
import "dotenv/config";
import mongoose from "mongoose";
import TransactionModel from "../models/transaction.model";
import { Env } from "../config/env.config";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";

const checkTransactions = async () => {
    try {
        await mongoose.connect(Env.MONGO_URI);
        const now = new Date(); // Feb 2026
        // Current month
        const from = startOfMonth(now);
        const to = endOfMonth(now);

        console.log(`Checking transactions from ${from.toISOString()} to ${to.toISOString()}`);

        const count = await TransactionModel.countDocuments({
            date: { $gte: from, $lte: to }
        });

        console.log(`Found ${count} transactions.`);

        // List a sample one to confirm date
        if (count > 0) {
            const sample = await TransactionModel.findOne({ date: { $gte: from, $lte: to } });
            console.log("Sample transaction:", sample);
        }

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

checkTransactions();
