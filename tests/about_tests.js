const request = require('supertest');
const { expect } = require('chai');

describe('About Service Unit Tests', () => {
    const api = 'http://localhost:3002';

    it('should return the team members', async () => {
        const response = await request(api).get('/api/about');

        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array');
        if (response.body.length > 0) {
            expect(response.body[0]).to.have.property('first_name');
            expect(response.body[0]).to.have.property('last_name');
        }
    });
});
