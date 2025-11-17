import express from 'express';
import request from 'supertest';
import pool from '../db.js';
import router from './exchange.js';

/**
 * routes/exchange.test.js
 *
 * Jest + supertest tests for routes/exchange.js
 */


jest.mock('../db.js', () => ({
    __esModule: true,
    default: {
        query: jest.fn()
    }
}));


describe('exchange routes', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use(router);
        pool.query.mockReset();
    });

    describe('GET /status/:itemId', () => {
        test('auto-creates and returns pending when no record exists', async () => {
            pool.query
                .mockResolvedValueOnce({ rows: [] }) // SELECT returns no rows
                .mockResolvedValueOnce({ rowCount: 1 }); // INSERT

            const res = await request(app).get('/status/123');

            expect(res.status).toBe(201);
            expect(res.body).toEqual({ status: 'pending' });
            expect(pool.query).toHaveBeenCalledWith(
                'SELECT status FROM exchanges WHERE item_id = $1',
                ['123']
            );
            expect(pool.query).toHaveBeenCalledWith(
                'INSERT INTO exchanges (item_id, status, updated_at) VALUES ($1, $2, NOW())',
                ['123', 'pending']
            );
        });

        test('returns existing status if present', async () => {
            pool.query.mockResolvedValueOnce({ rows: [{ status: 'approved' }] });

            const res = await request(app).get('/status/abc');

            expect(res.status).toBe(200);
            expect(res.body).toEqual({ status: 'approved' });
            expect(pool.query).toHaveBeenCalledWith(
                'SELECT status FROM exchanges WHERE item_id = $1',
                ['abc']
            );
        });

        test('responds 500 on DB error', async () => {
            pool.query.mockRejectedValueOnce(new Error('db error'));

            const res = await request(app).get('/status/1');

            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Server error' });
        });
    });

    describe('POST /status', () => {
        test('returns 404 when exchange not found', async () => {
            pool.query.mockResolvedValueOnce({ rows: [] }); // SELECT

            const res = await request(app)
                .post('/status')
                .send({ itemId: '1', userId: 'u', status: 'approved' });

            expect(res.status).toBe(404);
            expect(res.body).toEqual({ error: 'Exchange not found' });
            expect(pool.query).toHaveBeenCalledWith(
                'SELECT * FROM exchanges WHERE item_id = $1',
                ['1']
            );
        });

        test('updates status when exchange exists', async () => {
            pool.query
                .mockResolvedValueOnce({ rows: [{ id: 5 }] }) // SELECT found
                .mockResolvedValueOnce({ rowCount: 1 }); // UPDATE

            const res = await request(app)
                .post('/status')
                .send({ itemId: '2', userId: 'u', status: 'rejected' });

            expect(res.status).toBe(200);
            expect(res.body).toEqual({ message: 'Exchange status updated', status: 'rejected' });
            expect(pool.query).toHaveBeenCalledWith(
                'UPDATE exchanges SET status = $1, updated_at = NOW() WHERE item_id = $2',
                ['rejected', '2']
            );
        });

        test('responds 500 on DB error during update', async () => {
            pool.query.mockRejectedValueOnce(new Error('fail'));

            const res = await request(app)
                .post('/status')
                .send({ itemId: '3', userId: 'u', status: 'pending' });

            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Server error' });
        });
    });
});