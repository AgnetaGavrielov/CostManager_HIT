/*
 * Importing supertest for making HTTP requests to our API.
 * Importing expect from chai for assertions.
 */
const request = require('supertest');
const { expect } = require('chai');

/*
 * Test suite for the Cost Service API.
 * Ensures that adding costs and retrieving reports work correctly.
 */
describe('Cost Service Unit Tests', () => {
    // Base URL for the Cost microservice (port 3003)
    const api = 'http://localhost:3003';

    /*
     * Test case: Adding a new cost item.
     */
    it('should add a new cost item and return status 200', async () => {
        // Creating a dummy cost object for testing
        const newCost = {
            description: "Test Cost",
            category: "food",
            userid: 999999,
            sum: 100
        };

        // Sending POST request to add the cost
        const response = await request(api)
            .post('/api/add')
            .send(newCost);

        // Asserting successful response and correct data
        expect(response.status).to.equal(200);
        expect(response.body.description).to.equal("Test Cost");
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
        const response = await request(api).get(`/api/report?id=999999&year=${year}&month=${month}`);

        // Asserting successful response and correct report structure
        expect(response.status).to.equal(200);
        expect(response.body.userid).to.equal(999999);
        expect(response.body.year).to.equal(year);
        expect(response.body.month).to.equal(month);
        expect(response.body.costs).to.be.an('array');
    });
});