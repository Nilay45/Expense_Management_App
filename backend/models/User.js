import mongoose from "mongoose";

const schema = new mongoose.Schema({
    name: {
        type: String,
        requied: true,
    },
    email: {
        type: String,
        requied: true,
        unique: true
    },
    password: {
        type: String,
        requied: true,
        select: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export const User = mongoose.model("User", schema);