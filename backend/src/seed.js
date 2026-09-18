import { connectDatabase, disconnectDatabase } from './config/database.js';
import { insertMissingArticles } from './repositories/article.repository.js';
import { categories, demoStories } from '../../shared/stories.js';

try {
  await connectDatabase();
  const result = await insertMissingArticles(demoStories);
  console.log(`Added ${result.upsertedCount} demo stories. ${demoStories.length} demo stories cover ${categories.length} categories. Existing articles were preserved.`);
} finally {
  await disconnectDatabase();
}
