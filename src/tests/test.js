const server = require('../server.js');
const supertest = require('supertest');
const request = supertest(server);

describe('User Endpoints', () => {

    it('Register New User', async () => {
        const res = await request
        .post('/register')
        .send({username: 'test', email: 'test'})
        .set('Accept', 'application/json');
        // .expect(200);

        // console.log(res)
    });

    it('Log In With Existing User', async () => {
        const res = await request
        .post('/login')
        .send({username: 'test', email: 'test'})
        .set('Accept', 'application/json');
    });

    //Alternate
    it('Attempt Registration With Existing User', async () => {
        const res = await request
        .post('/register')
        .send({username: 'test', email: 'test'})
        .set('Accept', 'application/json');
    });
  
    it('Incorrect Login', async () => {
        const res = await request
        .post('/login')
        .send({username: 'test', email: 'incorrect'})
        .set('Accept', 'application/json');
    });


});
