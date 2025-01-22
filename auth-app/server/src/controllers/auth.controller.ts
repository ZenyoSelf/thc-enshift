import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { DB } from '../db/database';
import { User } from '../types/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { EmailService } from '../services/email.service';
import crypto from "node:crypto"
import dotenv from 'dotenv';
import path from 'path';
// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });


const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables (Auth Controller)');
}


export class AuthController {


    static isMailValid(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email)
    }

    static isPasswordValid(password: string) {
        return password.length >= 2;
    }

    static register = (req: Request, res: Response) => {
        const db = DB.getInstance();
        const { email, password, firstName, lastName } = req.body;


        try {

            //Check if the mail is valid
            if (!this.isMailValid(email)) {
                res.status(400).json({ message: 'Invalid email format' });
                return;
            }
            //Check the password strength (2 char as put in the frontend)
            if (!this.isPasswordValid(password)) {
                res.status(400).json({ message: 'Password must be at least 2 characters long' });
                return;
            }

            if (!email || !password || !firstName || !lastName) {
                res.status(400).json({ message: 'Missing data' });
                return;
            }

            // Check if user exists
            db.get('SELECT email FROM users WHERE email = ?', [email], async (err, row) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ message: 'Internal server error' });
                }

                if (row) {
                    return res.status(400).json({ message: 'User already exists' });
                }

                // Hash password
                const hashedPassword = await bcrypt.hash(password, 12);

                // Insert new user
                db.run(
                    'INSERT INTO users (email, password, firstName, lastName) VALUES (?, ?, ?, ?)',
                    [email, hashedPassword, firstName, lastName],
                    function (err) {
                        if (err) {
                            console.error('Registration error:', err);
                            return res.status(500).json({ message: 'Internal server error' });
                        }

                        // Generate JWT
                        const token = jwt.sign(
                            { id: this.lastID, email },
                            JWT_SECRET!,
                            { expiresIn: '24h' }
                        );

                        res.status(201).json({
                            message: 'User created successfully',
                            token,
                            user: {
                                id: this.lastID,
                                email,
                                firstName,
                                lastName
                            }
                        });
                    }
                );
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }


    
    static login = (req: Request, res: Response) => {
        const db = DB.getInstance();
        const { email, password } = req.body;

        try {

            if (!this.isMailValid(email)) {
                console.log(email)
                res.status(400).json({ message: 'Invalid email format' });
                return;
            }
            if (!this.isPasswordValid(password)) {
                console.log(password)
                res.status(400).json({ message: 'Password must be at least 2 characters long' });
                return;
            }
            db.get(
                'SELECT * FROM users WHERE email = ?',
                [email],
                async (err, user: User) => {
                    if (err) {
                        console.error('Login error:', err);
                        return res.status(500).json({ message: 'Internal server error' });
                    }

                    if (!user) {
                        return res.status(401).json({ message: 'Invalid credentials' });
                    }

                    const isValidPassword = await bcrypt.compare(password, user.password);
                    if (!isValidPassword) {
                        return res.status(401).json({ message: 'Invalid credentials' });
                    }

                    const token = jwt.sign(
                        { id: user.id, email: user.email },
                        JWT_SECRET!,
                        { expiresIn: '24h' }
                    );

                    res.json({
                        message: 'Login successful',
                        token,
                        user: {
                            id: user.id,
                            email: user.email,
                            firstName: user.firstName,
                            lastName: user.lastName
                        }
                    });
                }
            );
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async forgotPassword(req: Request, res: Response) {
        const { email } = req.body;
        const db = DB.getInstance();

        try {
            // Check if user exists
            db.get('SELECT id FROM users WHERE email = ?', [email], async (err, user) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ message: 'Internal server error' });
                }

                if (!user) {
                    return res.status(404).json({ message: 'No user found with this email' });
                }

                const resetToken = crypto.randomBytes(32).toString('hex');
                const resetTokenExpiry = Date.now() + 3600000; // 1 hour

                db.run(
                    'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?',
                    [resetToken, resetTokenExpiry, email],
                    async function (err) {
                        if (err) {
                            console.error('Reset token update error:', err);
                            return res.status(500).json({ message: 'Internal server error' });
                        }

                        try {
                            await EmailService.sendPasswordResetEmail(email, resetToken);
                            res.json({ message: 'Password reset instructions sent to your email' });
                        } catch (error) {
                            console.error('Email sending error:', error);
                            res.status(500).json({ message: 'Failed to send reset email' });
                        }
                    }
                );
            });
        } catch (error) {
            console.error('Forgot password error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async resetPassword(req: Request, res: Response) {
        const { token, newPassword } = req.body;
        const db = DB.getInstance();

        try {
            const hashedPassword = await bcrypt.hash(newPassword, 12);

            db.run(
                `UPDATE users 
             SET password = ?, 
                 reset_token = NULL, 
                 reset_token_expiry = NULL 
             WHERE reset_token = ? 
             AND reset_token_expiry > ?`,
                [hashedPassword, token, Date.now()],
                function (err) {
                    if (err) {
                        console.error('Password reset error:', err);
                        return res.status(500).json({ message: 'Internal server error' });
                    }

                    if (this.changes === 0) {
                        return res.status(400).json({ message: 'Invalid or expired reset token' });
                    }

                    res.json({ message: 'Password successfully reset' });
                }
            );
        } catch (error) {
            console.error('Reset password error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async getProfile(req: Request, res: Response) {
        const db = DB.getInstance();
        const userId = (req as AuthRequest).user.id;

        db.get(
            'SELECT id, email, firstName, lastName FROM users WHERE id = ?',
            [userId],
            (err, user) => {
                if (err) {
                    console.error('Profile fetch error:', err);
                    return res.status(500).json({ message: 'Internal server error' });
                }

                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }

                res.json({ user });
            }
        );
    }
}



