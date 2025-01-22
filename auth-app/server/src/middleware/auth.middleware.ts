import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables (Auth Middleware)');
}

export interface AuthRequest extends Request {
    user?: any;
  }

export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }
  
      const decoded = jwt.verify(token, JWT_SECRET);
      (req as AuthRequest).user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Invalid or expired token' });
      return;
    }
  };