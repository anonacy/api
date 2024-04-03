import chai from 'chai';
import chaiHttp from 'chai-http';
import { app, server } from '../app'; // import your app or server
import { Utils } from '../utils';

chai.use(chaiHttp);
const { expect } = chai;

const VARS = {
  domain: "testing.anonacy.com",
  alias: "testing@testing.anonacy.com",
  endpoint: "testing@anonacy.com"
}


describe('API Tests', function() {
  this.timeout(10000);

  it('Health Check', (done) => {
    chai.request(app)
      .get('/health')
      .end((err, res) => {
        expect(res.status).to.equal(200);
        done();
      });
  });

  it('add a new domain', (done) => {
    chai.request(app)
      .post('/addDomain')
      // .set('Authorization', `Bearer ${TOKEN}`)
      .send({"domain": VARS.domain})
      .end((err, res) => {
        expect(res.statusCode).to.equal(201);
        expect(res.body.success).to.be.true;
        expect(res.body.id).to.exist;
        expect(res.body.domain).to.equal(VARS.domain);
        done();
      });
  });

  it('find the new domain in list', (done) => {
    chai.request(app)
      .post('/getDomains')
      // .set('Authorization', `Bearer ${TOKEN}`)
      .send()
      .end((err, res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.body.count).to.be.greaterThan(0);        
        // Find the domain in the array
        const domain = res.body.domains.find((d) => d.domain === VARS.domain);
        expect(domain).to.exist;
        done();
      });
  });

  it('get dns setup details for new domain', (done) => {
    chai.request(app)
      .post('/checkDomain')
      // .set('Authorization', `Bearer ${TOKEN}`)
      .send({"domain": VARS.domain})
      .end((err, res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.body.success).to.be.true;
        expect(res.body.ok).to.be.false;
        expect(res.body.dnsRecords).to.be.lengthOf(4);
        expect(res.body.domain).to.be.equal(VARS.domain);

        // Check that each title exists in the array
        const titles = ['SPF Record', 'DKIM Record', 'Return Path', 'MX Records'];
        titles.forEach((title) => {
          const exists = res.body.dnsRecords.some((record) => record.title === title);
          expect(exists).to.be.true;
        });
        done();
      });
  });

  it('delete the new domain', (done) => {
    chai.request(app)
      .post('/deleteDomain')
      // .set('Authorization', `Bearer ${TOKEN}`)
      .send({"domain": VARS.domain})
      .end((err, res) => {
        expect(res.statusCode).to.equal(201);
        expect(res.body.success).to.be.true;
        done();
      });
  });

  after((done) => {
    server.close(done);
  });
});