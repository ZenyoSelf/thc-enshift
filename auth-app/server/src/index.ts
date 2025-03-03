import express from 'express';
import cors from 'cors';
import { DB } from './db/database';
import authRoutes from './routes/auth.route';
import dotenv from 'dotenv';
import path from 'path';
import { EmailService } from './services/email.service';
dotenv.config({ path: path.resolve(__dirname, '../.env') });


EmailService.createTestAccount()
  .then(() => console.log('Email service initialized'))
  .catch(console.error);
  

const PORT = process.env.PORT;
export const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    // Initialize database connection
    DB.getInstance();
});

// Handle application shutdown
process.on('SIGINT', () => {
    DB.close();
    process.exit(0);
});
