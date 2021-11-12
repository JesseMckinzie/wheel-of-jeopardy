const server = require('../server.js');
const supertest = require('supertest');
const request = supertest(server);

describe('User Endpoints', () => {

    it('GET /user should show all users', async () => {
        const res = await request
        .post('/register')
        .send({username: 'test', email: 'test'})
        .set('Accept', 'application/json');
        // .expect(200);

        console.log(res)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('json'));
        expect(res.body).toHaveProperty('users')
    });
  
});
