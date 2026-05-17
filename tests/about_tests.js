/*
 * Importing supertest for making HTTP requests to our local API.
 * Importing expect from chai to write behavior-driven assertions.
 */
const request = require('supertest');
const { expect } = require('chai');

/*
 * Test suite for the About Service API.
 * This suite ensures that the /api/about endpoint works as required.
 */
describe('About Service Unit Tests', () => {
    // Defining the base URL for the About microservice (port 3002)
    const api = 'http://localhost:3002';

    /*
     * Test case: Verifying that GET /api/about returns team member details.
     */
    it('should return the team members', async () => {
        // Sending the GET request to the endpoint
        const response = await request(api).get('/api/about');

        // Asserting that the HTTP status code is 200 OK
        expect(response.status).to.equal(200);

        // Asserting that the returned JSON is an array
        expect(response.body).to.be.an('array');

        // Verifying the structure of the objects inside the array
        if (response.body.length > 0) {
            expect(response.body[0]).to.have.property('first_name');
            expect(response.body[0]).to.have.property('last_name');
        }
    });
});