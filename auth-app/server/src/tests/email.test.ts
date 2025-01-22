import { expect } from 'chai';
import request from 'supertest';
import { app } from '../index';
import { DB } from '../db/database';

describe('Password Reset Flow', () => {
    let resetToken: string;

    describe('POST /api/auth/forgot-password', () => {
        it('should send reset token for existing user', async () => {
            const res = await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'test@example.com' });

            expect(res.status).to.equal(200);
            expect(res.body.message).to.equal('Password reset instructions sent to your email');

            // Get token from database for next tests
            const db = DB.getInstance();
            await new Promise((resolve) => {
                db.get(
                    'SELECT reset_token FROM users WHERE email = ?',
                    ['test@example.com'],
                    (err,  row: { reset_token: string }) => {
                        resetToken = row.reset_token;
                        resolve(null);
                    }
                );
            });
        });

        it('should return 404 for non-existing user', async () => {
            const res = await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'nonexistent@example.com' });

            expect(res.status).to.equal(404);
            expect(res.body.message).to.equal('No user found with this email');
        });
    });

    describe('POST /api/auth/reset-password', () => {
        it('should reset password with valid token', async () => {
            const res = await request(app)
                .post('/api/auth/reset-password')
                .send({
                    token: resetToken,
                    newPassword: 'newpassword123'
                });

            expect(res.status).to.equal(200);
            expect(res.body.message).to.equal('Password successfully reset');

            // Verify new password works
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'newpassword123'
                });

            expect(loginRes.status).to.equal(200);
        });

        it('should reject invalid token', async () => {
            const res = await request(app)
                .post('/api/auth/reset-password')
                .send({
                    token: 'invalid-token',
                    newPassword: 'newpassword123'
                });

            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal('Invalid or expired reset token');
        });

        it('should reject expired token', async () => {
            // Set token expiry to past
            const db = DB.getInstance();
            await new Promise((resolve) => {
                db.run(
                    'UPDATE users SET reset_token_expiry = ? WHERE email = ?',
                    [Date.now() - 3600000, 'test@example.com'],
                    () => resolve(null)
                );
            });

            const res = await request(app)
                .post('/api/auth/reset-password')
                .send({
                    token: resetToken,
                    newPassword: 'newpassword123'
                });

            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal('Invalid or expired reset token');
        });
    });
});