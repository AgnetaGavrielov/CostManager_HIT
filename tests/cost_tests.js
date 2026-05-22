/*
 * Importing supertest for making HTTP requests to our API.
 * Importing expect from chai for assertions.
 */
const request = require('supertest');
const { expect } = require('chai');

/*
 * Test suite for the Cost Service API.
 * Ensures that adding costs and retrieving reports work correctly.
 * Uses user 123123 which is the required seed user in the database.
 */
describe('Cost Service Unit Tests', () => {
    // Base URL for the Cost microservice (port 3003)
    const api = 'http://localhost:3003';

    // Using the required seed user ID that must exist in the database
    const seedUserId = 123123;

    /*
     * Test case: Adding a new cost item with a valid existing user.
     */
    it('should add a new cost item and return status 200', async () => {
        // Creating a cost object for the seed user
        const newCost = {
            description: 'Test Cost',
            category: 'food',
            userid: seedUserId,
            sum: 100
        };

        // Sending POST request to add the cost
        const response = await request(api)
            .post('/api/add')
            .send(newCost);

        // Asserting successful response and correct data
        expect(response.status).to.equal(200);
        expect(response.body.description).to.equal('Test Cost');
    });

    /*
     * Test case: Rejecting a cost item for a non-existent user.
     */
    it('should return error when adding cost for non-existent user', async () => {
        // Using an ID that is guaranteed not to exist in the database
        const invalidCost = {
            description: 'Ghost Cost',
            category: 'food',
            userid: 999999,
            sum: 50
        };

        // Sending POST request with an invalid user
        const response = await request(api)
            .post('/api/add')
            .send(invalidCost);

        // Asserting that the server correctly rejects the request
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('message');
    });

    /*
     * Test case: Rejecting a cost item with an invalid category.
     */
    it('should return error when adding cost with invalid category', async () => {
        const invalidCost = {
            description: 'Bad Category Cost',
            category: 'invalid_category',
            userid: seedUserId,
            sum: 50
        };

        // Sending POST request with an invalid category
        const response = await request(api)
            .post('/api/add')
            .send(invalidCost);

        // Asserting the server rejects the invalid category
        expect(response.status).to.equal(400);
    });

    /*
     * Test case: Retrieving the monthly report.
     */
    it('should get the monthly report', async () => {
        // Getting current year and month dynamically
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        // Sending GET request for the report
        const response = await request(api).get(`/api/report?id=${seedUserId}&year=${year}&month=${month}`);

        // Asserting successful response and correct report structure
        expect(response.status).to.equal(200);
        expect(response.body.userid).to.equal(seedUserId);
        expect(response.body.year).to.equal(year);
        expect(response.body.month).to.equal(month);
        expect(response.body.costs).to.be.an('array');
    });

    /*
     * Test case: Report must contain all 5 required categories.
     */
    it('should return report with all 5 categories', async () => {
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        const response = await request(api).get(`/api/report?id=${seedUserId}&year=${year}&month=${month}`);

        // Checking that all required categories are present in the report
        expect(response.status).to.equal(200);
        const categoryNames = response.body.costs.map(item => Object.keys(item)[0]);
        expect(categoryNames).to.include('food');
        expect(categoryNames).to.include('health');
        expect(categoryNames).to.include('housing');
        expect(categoryNames).to.include('sports');
        expect(categoryNames).to.include('education');
    });

    /*
     * Test case: Report endpoint should return error for missing parameters.
     */
    it('should return error when report parameters are missing', async () => {
        // Sending GET request without required parameters
        const response = await request(api).get('/api/report');

        // Asserting that the server returns a validation error
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('message');
    });
});