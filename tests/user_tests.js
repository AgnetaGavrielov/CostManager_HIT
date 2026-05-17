/*
 * Importing supertest and chai for API testing.
 */
const request = require('supertest');
const { expect } = require('chai');

/*
 * Unit tests for the Users Service API.
 * We are using Mocha as the test runner and Chai for assertions.
 */
describe('Users Service Unit Tests', () => {
    // Base URL for the Users microservice (port 3001)
    const api = 'http://localhost:3001';

    // Generating a random user ID for testing to avoid unique constraint errors
    const testUserId = Math.floor(Math.random() * 1000000) + 1000000;

    /*
     * Test case: Adding a new user via POST /api/add.
     * We use a new ID to avoid the 'unique' constraint error.
     */
    it('should add a new user and return status 201', async () => {
        // Defining the new user payload
        const newUser = {
            id: testUserId,
            first_name: "Test",
            last_name: "User",
            birthday: "2000-01-01"
        };

        // Sending the POST request
        const response = await request(api)
            .post('/api/add')
            .send(newUser);

        // Assertions for successful creation
        expect(response.status).to.equal(201);
        expect(response.body.id).to.equal(testUserId);
    });

    /*
     * Test case: Getting all users via GET /api/users.
     */
    it('should retrieve a list of all users', async () => {
        // Fetching the user list
        const response = await request(api).get('/api/users');

        // Asserting the response format
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array');
    });

    /*
     * Test case: Getting a specific user via GET /api/users/:id.
     */
    it('should return details for a specific user ID', async () => {
        // Fetching the specific user created earlier
        const response = await request(api).get(`/api/users/${testUserId}`);

        // Verifying user details and default total costs
        expect(response.status).to.equal(200);
        expect(response.body.id).to.equal(testUserId);
        expect(response.body.total).to.equal(0); // Expected total of 0 for a brand new user
    });

    /*
     * Test case: Error handling for non-existent user.
     */
    it('should return 404 for a user that does not exist', async () => {
        // Attempting to fetch a user ID that is guaranteed not to exist
        const response = await request(api).get('/api/users/000000');

        // Asserting correct error status code
        expect(response.status).to.equal(404);
    });
});