const request = require('supertest');
const { expect } = require('chai');

describe('Log Service Unit Tests', () => {
    const api = 'http://localhost:3004';

    it('should retrieve a list of all logs', async () => {
        const response = await request(api).get('/api/logs');

        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array');
    });
});
