import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { DB } from '../db/database';
import { User } from '../types/database';
import { AuthRequest } from '../middleware/auth.middleware';

import dotenv from 'dotenv';
import path from 'path';
// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });


const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables (Auth Controller)');
}

export class AuthController {
    static async register(req: Request, res: Response) {
        const db = DB.getInstance();
        const { email, password, firstName, lastName } = req.body;

        try {
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

    static async login(req: Request, res: Response) {
        const db = DB.getInstance();
        const { email, password } = req.body;

        try {
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


    //Might be used for sessions
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