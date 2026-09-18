import { createApp } from './app.js';
import { getConfig } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';

try {
  await connectDatabase();
  const { port } = getConfig();
  const server = createApp().listen(port, () => console.log(`Nuzio API running on port ${port}`));
  
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, () => {
      server.close(async () => {
        await disconnectDatabase();
        process.exit(0);
      });
    });
  }
} catch (error) {
  console.error('Could not start API. Check MONGODB_URI and that MongoDB is running.', error.message);
  process.exitCode = 1;
}
