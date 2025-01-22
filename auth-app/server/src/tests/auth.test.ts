import { expect } from 'chai';
import request from 'supertest';
import { app } from '../index';
import { DB } from '../db/database';

describe('Auth endpoints', () => {
    before(async () => {
        await new Promise<void>((resolve) => {
            DB.getInstance().run('DELETE FROM users', [], () => resolve());
        });
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'test@example.com',
                    password: '1234',
                    firstName: 'Test',
                    lastName: 'User'
                });

            expect(res.status).to.equal(201);
            expect(res.body).to.have.property('token');
            expect(res.body.user).to.have.property('email', 'test@example.com');
        });


        it('should not register with invalid email', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'invalid-email',
                    password: 'password123',
                    firstName: 'Test',
                    lastName: 'User'
                });

            expect(res.status).to.equal(400);
        });

        it('should not register with no lastName', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'test@example2.com',
                    password: 'password123',
                    firstName: 'Test'
                });

            expect(res.status).to.equal(400);
        });

        it('should not register with no firstName', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'test@example3.com',
                    password: 'password123',
                    lastName: 'User'
                });

            expect(res.status).to.equal(400);
        });


        it('should not register with short password', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'test2@example.com',
                    password: '1'
                });

            expect(res.status).to.equal(400);
        });

        it('should not register duplicate email', async () => {

            await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'test@example6.com',
                    password: '1234',
                    firstName: 'Test',
                    lastName: 'User'
                });

            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'test@example6.com',
                    password: '5678',
                    firstName: 'Test',
                    lastName: 'User'
                });

            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal('User already exists');
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login existing user', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: '1234'
                });

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('token');
        });

        it('should not login inexisting user', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'www@examwwwple.com',
                    password: '12345678'
                });

                expect(res.status).to.equal(401);
                expect(res.body.message).to.equal('Invalid credentials');
        });
    });
});
