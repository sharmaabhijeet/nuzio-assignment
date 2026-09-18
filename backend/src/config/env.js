export function getConfig() {
  return {
    port: Number(process.env.PORT || 3001),
    mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nuzio',
    frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
    production: process.env.NODE_ENV === 'production',
  };
}
