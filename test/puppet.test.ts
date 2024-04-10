import chai from 'chai';
import chaiHttp from 'chai-http';
import dotenv from 'dotenv';

dotenv.config();
const URL = process.env.TEST_API_URL;
const API_KEY = process.env.TEST_API_KEY;

chai.use(chaiHttp);
const expect = chai.expect;
const request = chai.request;

const randomNumber = Math.floor(Math.random() * 10000);
const VARS = {
  domain: `test${randomNumber}.anonacy.com`,
  endpoint: `test${randomNumber}@anonacy.com`,
  alias: `test${randomNumber}@test${randomNumber}.anonacy.com`,
}

describe('API Tests', function() {
  this.timeout(30000); // 30 seconds

  it('health check', (done) => {
    request(URL)
      .get('/health')
      .set('Authorization', `Bearer ${API_KEY}`)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        done();
      });
  });

  it('add a domain', (done) => {
    request(URL)
      .post('/domain')
      .set('Authorization', `Bearer ${API_KEY}`)
      .send({"domain": VARS.domain})
      .end((err, res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.body.domain).to.equal(VARS.domain);
        done();
      });
  });

  it('check domain was created', (done) => {
    request(URL)
      .get('/domains')
      .set('Authorization', `Bearer ${API_KEY}`)
      .end((err, res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.body.length).to.be.greaterThan(0);

        // Find the domain in the array
        const domain = res.body.find((x) => x.domain === VARS.domain);
        expect(domain).to.exist;
        done();
      });
  });

  it('get dns setup details for domain', (done) => {
    request(URL)
      .get('/domain')
      .query({domain: VARS.domain})
      .set('Authorization', `Bearer ${API_KEY}`)
      .end((err, res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.body.ok).to.be.false;
        expect(res.body.setup).to.be.lengthOf(4);
        expect(res.body.dns.SPF).to.be.false
        expect(res.body.dns.DKIM).to.be.false
        expect(res.body.dns.RP).to.be.false
        expect(res.body.dns.MX).to.be.false
        expect(res.body.dns.ok).to.be.false
        expect(res.body.domain).to.be.equal(VARS.domain);

        // Check that each title exists in the array
        const titles = ['SPF Record', 'DKIM Record', 'Return Path', 'MX Records'];
        titles.forEach((title) => {
          const exists = res.body.setup.some((record) => record.title === title);
          expect(exists).to.be.true;
        });
        done();
      });
  });

  it('Error when trying to add domain again', (done) => {
    request(URL)
      .post('/domain')
      .set('Authorization', `Bearer ${API_KEY}`)
      .send({"domain": VARS.domain})
      .end((err, res) => {
        expect(res.statusCode).to.equal(500);
        expect(res.body.error).to.equal("Domain already exists");
        done();
      });
  });

  it('add an endpoint', (done) => {
    request(URL)
      .post('/endpoint')
      .set('Authorization', `Bearer ${API_KEY}`)
      .send({"endpoint": VARS.endpoint})
      .end((err, res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.body.endpoint).to.equal(VARS.endpoint);
        done();
      });
  });

  it('find the endpoint in list', (done) => {
    request(URL)
      .get('/endpoints')
      .set('Authorization', `Bearer ${API_KEY}`)
      .end((err, res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.body.length).to.be.greaterThan(0);

        // Find the endpoint in the array
        const endpoint = res.body.find((x) => x.endpoint === VARS.endpoint);
        expect(endpoint).to.exist;
        done();
      });
  });

  it('error when trying to add endpoint again', (done) => {
    request(URL)
      .post('/endpoint')
      .set('Authorization', `Bearer ${API_KEY}`)
      .send({"endpoint": VARS.endpoint})
      .end((err, res) => {
        expect(res.statusCode).to.equal(500);
        expect(res.body.error).to.equal("Endpoint already exists");
        done();
      });
  });

  it('add an alias', (done) => {
    request(URL)
      .post('/alias')
      .set('Authorization', `Bearer ${API_KEY}`)
      .send({"alias": VARS.alias, "endpoint": VARS.endpoint})
      .end((err, res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.body.alias).to.equal(VARS.alias);
        expect(res.body.endpoint).to.equal(VARS.endpoint);
        done();
      });
  });

  it('check alias was created', (done) => {
    request(URL)
      .get('/aliases')
      .set('Authorization', `Bearer ${API_KEY}`)
      .end((err, res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.body.length).to.be.greaterThan(0);

        // Find the endpoint in the array
        const alias = res.body.find((x) => x.alias === VARS.alias);
        expect(alias).to.exist;
        done();
      });
  });

  it('disable the alias', (done) => {
    request(URL)
      .put('/alias')
      .set('Authorization', `Bearer ${API_KEY}`)
      .send({"alias": VARS.alias, "endpoint": VARS.endpoint, "enabled": false})
      .end((err, res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.body.success).to.be.true;
        done();
      });
  });

  it('check alias was disabled', (done) => {
    request(URL)
      .get('/aliases')
      .set('Authorization', `Bearer ${API_KEY}`)
      .end((err, res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.body.length).to.be.greaterThan(0);
        const alias = res.body.find((x) => x.alias === VARS.alias);
        expect(alias.enabled).to.equal(0);
        expect(alias.endpoint).to.exist;
        done();
      });
  });

  it('enable the alias', (done) => {
    request(URL)
      .put('/alias')
      .set('Authorization', `Bearer ${API_KEY}`)
      .send({"alias": VARS.alias, "endpoint": VARS.endpoint, "enabled": true})
      .end((err, res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.body.success).to.be.true;
        done();
      });
  });

  it('check alias was enabled', (done) => {
    request(URL)
      .get('/aliases')
      .set('Authorization', `Bearer ${API_KEY}`)
      .end((err, res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.body.length).to.be.greaterThan(0);
        const alias = res.body.find((x) => x.alias === VARS.alias);
        expect(alias.enabled).to.equal(1);
        expect(alias.endpoint).to.exist;
        done();
      });
  });

  it('error when trying to add alias again', (done) => {
    request(URL)
      .post('/alias')
      .set('Authorization', `Bearer ${API_KEY}`)
      .send({"alias": VARS.alias, "endpoint": VARS.endpoint})
      .end((err, res) => {
        expect(res.statusCode).to.equal(500);
        expect(res.body.error).to.equal("Alias already exists");
        done();
      });
  });

  it('delete the alias', (done) => {
    request(URL)
      .delete('/alias')
      .set('Authorization', `Bearer ${API_KEY}`)
      .query({"alias": VARS.alias})
      .end((err, res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.body.success).to.be.true;
        done();
      });
  });

  it('check alias was deleted', (done) => {
    request(URL)
      .get('/aliases')
      .set('Authorization', `Bearer ${API_KEY}`)
      .end((err, res) => {
        expect(res.statusCode).to.equal(200);
        const alias = res.body.find((x) => x.alias === VARS.alias);
        expect(alias).to.not.exist;
        done();
      });
  });

  it('delete the endpoint', (done) => {
    request(URL)
      .delete('/endpoint')
      .set('Authorization', `Bearer ${API_KEY}`)
      .query({"endpoint": VARS.endpoint})
      .end((err, res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.body.success).to.be.true;
        done();
      });
  });

  it('check endpoint was deleted', (done) => {
    request(URL)
      .get('/endpoints')
      .set('Authorization', `Bearer ${API_KEY}`)
      .end((err, res) => {
        expect(res.statusCode).to.equal(200);
        const endpoint = res.body.find((x) => x.endpoint === VARS.endpoint);
        expect(endpoint).to.not.exist;
        done();
      });
  });

  it('delete the domain', (done) => {
    request(URL)
      .delete('/domain')
      .set('Authorization', `Bearer ${API_KEY}`)
      .query({"domain": VARS.domain})
      .end((err, res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.body.success).to.be.true;
        done();
      });
  });

  it('check domain was deleted', (done) => {
    request(URL)
      .get('/domains')
      .set('Authorization', `Bearer ${API_KEY}`)
      .end((err, res) => {
        expect(res.statusCode).to.equal(200);
        const domain = res.body.find((x) => x.domain === VARS.domain);
        expect(domain).to.not.exist;
        done();
      });
  });

  // after((done) => {
  //   server.close(done);
  // });
});