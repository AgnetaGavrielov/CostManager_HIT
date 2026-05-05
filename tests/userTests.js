const request = require('supertest');
const { expect } = require('chai');

/*
 * Unit tests for the Users Service API.
 * We are using Mocha as the test runner and Chai for assertions.
 */
describe('Users Service Unit Tests', () => {
    const api = 'http://localhost:3001';

    /*
     * Test case: Adding a new user via POST /api/add.
     * We use a new ID to avoid the 'unique' constraint error.
     */
    it('should add a new user and return status 201', async () => {
        const newUser = {
            id: 999999,
            first_name: "Test",
            last_name: "User",
            birthday: "2000-01-01"
        };

        const response = await request(api)
            .post('/api/add')
            .send(newUser);

        expect(response.status).to.equal(201);
        expect(response.body.id).to.equal(999999);
    });

    /*
     * Test case: Getting all users via GET /api/users.
     */
    it('should retrieve a list of all users', async () => {
        const response = await request(api).get('/api/users');

        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array');
    });

    /*
     * Test case: Getting a specific user via GET /api/users/:id.
     */
    it('should return details for a specific user ID', async () => {
        const response = await request(api).get('/api/users/999999');

        expect(response.status).to.equal(200);
        expect(response.body.id).to.equal(999999);
        expect(response.body.total).to.equal(0); // Expected placeholder for now
    });

    /*
     * Test case: Error handling for non-existent user.
     */
    it('should return 404 for a user that does not exist', async () => {
        const response = await request(api).get('/api/users/000000');
        expect(response.status).to.equal(404);
    });
});