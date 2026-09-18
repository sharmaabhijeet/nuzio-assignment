import mongoose from 'mongoose';
import { categories, topics } from '../content.js';

const articleSchema = new mongoose.Schema({
  slug: { type: String, unique: true, required: true },
  category: { type: String, enum: categories.map(item => item.label), index: true },
  title: { type: String, required: true },
  summary: { type: String, required: true },
  content: { type: String, required: true },
  topic: { type: String, enum: topics, required: true },
  source: { type: String, default: 'Nuzio demo editorial' },
  audioUrl: { type: String },
  readMinutes: { type: Number, default: 3 },
  publishedAt: { type: Date, default: Date.now },
  demo: { type: Boolean, default: true },
});

export const Article = mongoose.model('Article', articleSchema);
