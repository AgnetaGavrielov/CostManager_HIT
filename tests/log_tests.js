// Importing supertest and chai for API testing
const request = require('supertest');
const { expect } = require('chai');

// Test suite for the Log Service API
// Verifies that the logging mechanism exposes its data correctly
describe('Log Service Unit Tests', () => {
    // Base URL for the Log microservice (port 3004)
    const api = 'http://localhost:3004';

    /**
     * Test case: Retrieving all system logs.
     */
    it('should retrieve a list of all logs', async () => {
        // Sending GET request to fetch logs from the database
        const response = await request(api).get('/api/logs');
        // Asserting successful response and array format
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array');
    });
});