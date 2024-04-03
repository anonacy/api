import chai from 'chai';
import chaiHttp from 'chai-http';
import { app, server } from '../app'; // import your app or server

chai.use(chaiHttp);
const { expect } = chai;

let VARS = {
  domain: "testing.anonacy.com",
  endpoint: "testing@anonacy.com",
  alias: "",
}
VARS.alias = `testing@${VARS.domain}`;


describe('API Tests', function() {
  this.timeout(12000);

  it('health check', (done) => {
    chai.request(app)
      .get('/health')
      .end((err, res) => {
        expect(res.status).to.equal(200);
        done();
      });
  });

  it('add a domain', (done) => {
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

  it('check domain was created', (done) => {
    chai.request(app)
      .post('/getDomains')
      .send()
      .end((err, res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.body.count).to.be.greaterThan(0);

        // Find the domain in the array
        const domain = res.body.domains.find((x) => x.domain === VARS.domain);
        expect(domain).to.exist;
        done();
      });
  });

  it('get dns setup details for domain', (done) => {
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

  it('add an endpoint', (done) => {
    chai.request(app)
      .post('/addEndpoint')
      .send({"endpoint": VARS.endpoint})
      .end((err, res) => {
        expect(res.statusCode).to.equal(201);
        expect(res.body.success).to.be.true;
        expect(res.body.id).to.exist;
        expect(res.body.endpoint).to.equal(VARS.endpoint);
        done();
      });
  });

  it('find the endpoint in list', (done) => {
    chai.request(app)
      .post('/getEndpoints')
      .send()
      .end((err, res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.body.count).to.be.greaterThan(0);

        // Find the endpoint in the array
        const endpoint = res.body.endpoints.find((x) => x.endpoint === VARS.endpoint);
        expect(endpoint).to.exist;
        done();
      });
  });

  it('add an alias', (done) => {
    chai.request(app)
      .post('/addAlias')
      .send({"alias": VARS.alias, "endpoint": VARS.endpoint})
      .end((err, res) => {
        expect(res.statusCode).to.equal(201);
        expect(res.body.success).to.be.true;
        expect(res.body.id).to.exist;
        expect(res.body.alias).to.equal(VARS.alias);
        expect(res.body.endpoint).to.equal(VARS.endpoint);
        done();
      });
  });

  it('check alias was created', (done) => {
    chai.request(app)
      .post('/getAliases')
      .send()
      .end((err, res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.body.count).to.be.greaterThan(0);

        // Find the endpoint in the array
        const alias = res.body.aliases.find((x) => x.alias === VARS.alias);
        expect(alias).to.exist;
        done();
      });
  });

  it('disable the alias', (done) => {
    chai.request(app)
      .post('/disableAlias')
      .send({"alias": VARS.alias, "endpoint": VARS.endpoint})
      .end((err, res) => {
        expect(res.statusCode).to.equal(201);
        expect(res.body.success).to.be.true;
        done();
      });
  });

  it('check alias was disabled', (done) => {
    chai.request(app)
      .post('/getAliases')
      .send()
      .end((err, res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.body.count).to.be.greaterThan(0);
        const alias = res.body.aliases.find((x) => x.alias === VARS.alias);
        expect(alias.isActive).to.be.false;
        expect(alias.endpoint).to.be.null;
        done();
      });
  });

  it('enable the alias', (done) => {
    chai.request(app)
      .post('/enableAlias')
      .send({"alias": VARS.alias, "endpoint": VARS.endpoint})
      .end((err, res) => {
        expect(res.statusCode).to.equal(201);
        expect(res.body.success).to.be.true;
        done();
      });
  });

  it('check alias was enabled', (done) => {
    chai.request(app)
      .post('/getAliases')
      .send()
      .end((err, res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.body.count).to.be.greaterThan(0);
        const alias = res.body.aliases.find((x) => x.alias === VARS.alias);
        expect(alias.isActive).to.be.true;
        expect(alias.endpoint).to.exist;
        expect(alias.endpoint).to.equal(VARS.endpoint);
        done();
      });
  });

  it('delete the alias', (done) => {
    chai.request(app)
      .post('/deleteAlias')
      .send({"alias": VARS.alias})
      .end((err, res) => {
        expect(res.statusCode).to.equal(201);
        expect(res.body.success).to.be.true;
        done();
      });
  });

  it('check alias was deleted', (done) => {
    chai.request(app)
      .post('/getAliases')
      .send()
      .end((err, res) => {
        expect(res.statusCode).to.equal(200);
        const alias = res.body.aliases.find((x) => x.alias === VARS.alias);
        expect(alias).to.not.exist;
        done();
      });
  });

  it('delete the endpoint', (done) => {
    chai.request(app)
      .post('/deleteEndpoint')
      .send({"endpoint": VARS.endpoint})
      .end((err, res) => {
        expect(res.statusCode).to.equal(201);
        expect(res.body.success).to.be.true;
        done();
      });
  });

  it('check endpoint was deleted', (done) => {
    chai.request(app)
      .post('/getEndpoints')
      .send()
      .end((err, res) => {
        expect(res.statusCode).to.equal(200);
        const endpoint = res.body.endpoints.find((x) => x.endpoint === VARS.endpoint);
        expect(endpoint).to.not.exist;
        done();
      });
  });

  it('delete the domain', (done) => {
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

  it('check domain was deleted', (done) => {
    chai.request(app)
      .post('/getDomains')
      .send()
      .end((err, res) => {
        expect(res.statusCode).to.equal(200);
        const domain = res.body.domains.find((x) => x.domain === VARS.domain);
        expect(domain).to.not.exist;
        done();
      });
  });

  after((done) => {
    server.close(done);
  });
});