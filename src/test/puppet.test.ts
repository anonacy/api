import chai from 'chai';
import chaiHttp from 'chai-http';
import { app, server } from '../app'; // import your app or server

chai.use(chaiHttp);
const { expect } = chai;

describe('GET /health', () => {
  it('should return 200 OK', (done) => {
    chai.request(app)
      .get('/health')
      .end((err, res) => {
        expect(res.status).to.equal(200);
        done();
      });
  });

  after((done) => {
    server.close(done);
  });
});