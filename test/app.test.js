const request = require('supertest');
const app = require('../app'); // the path to your app file.

describe('GET /', () => {
  it('should render the home page', (done) => {
    request(app)
      .get('/')
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        done();
      });
  });
});
