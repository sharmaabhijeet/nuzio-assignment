import mongoose from 'mongoose';
import { topics } from '../constants/content.js';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  interests: [{ type: String, enum: topics }],
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
