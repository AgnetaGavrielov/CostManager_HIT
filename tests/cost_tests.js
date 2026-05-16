const request = require('supertest');
const { expect } = require('chai');

describe('Cost Service Unit Tests', () => {
    const api = 'http://localhost:3003';

    it('should add a new cost item and return status 200', async () => {
        const newCost = {
            description: "Test Cost",
            category: "food",
            userid: 999999,
            sum: 100
        };

        const response = await request(api)
            .post('/api/add')
            .send(newCost);

        expect(response.status).to.equal(200);
        expect(response.body.description).to.equal("Test Cost");
    });

    it('should get the monthly report', async () => {
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        const response = await request(api).get(`/api/report?id=999999&year=${year}&month=${month}`);

        expect(response.status).to.equal(200);
        expect(response.body.userid).to.equal(999999);
        expect(response.body.year).to.equal(year);
        expect(response.body.month).to.equal(month);
        expect(response.body.costs).to.be.an('array');
    });
});
