import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

import forgotPasswordRoute from './routes/forgot-password.js';
import itemsRouter from './routes/items.js';
import authRouter from './routes/auth.js';
import resetPasswordRoute from './routes/reset-password.js';
import conversationRoutes from './routes/conversationRoutes.js';
import messagesRoute from './routes/messagesRoute.js';
import updatePointsRoute from './routes/updatePoints.js';
import userRoutes from './routes/ManageUsersRoute.js';


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.send('ReUseCampusHub backend is running!');
});

app.use('/api', authRouter);
app.use('/api', forgotPasswordRoute);
app.use('/api', resetPasswordRoute);
app.use('/api/items', itemsRouter);
app.use('/api', conversationRoutes);
app.use('/api', messagesRoute);
app.use('/api/updatePoints', updatePointsRoute);
app.use('/api/users', userRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});