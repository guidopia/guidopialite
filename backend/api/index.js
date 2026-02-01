// Vercel serverless function entry point
const app = require('../app');

// Export the Express app for Vercel
module.exports = app;

// For local development, you can also start the server
if (require.main === module) {
  const port = process.env.PORT || 5001;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}
