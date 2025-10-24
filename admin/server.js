// server.js
import express from 'express';
import cors from 'cors';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Sample route
app.get('/', (req, res) => {
  res.send('Reuse Campus Hub Backend is running!');
});

// Function to start server with fallback ports
const startServer = async (port, maxRetries = 5) => {
  let currentPort = port;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const server = app.listen(currentPort, () => {
        console.log(`✅ Server is running on port ${currentPort}`);
      });

      // Exit loop if server starts successfully
      return;
    } catch (err) {
      if (err.code === 'EADDRINUSE') {
        console.warn(`⚠️ Port ${currentPort} is in use. Trying port ${currentPort + 1}...`);
        currentPort++;
      } else {
        console.error('❌ Unexpected server error:', err);
        break;
      }
    }
  }

  console.error(`❌ Failed to start server after ${maxRetries + 1} attempts.`);
};

// Start server on port 5000
startServer(5001);