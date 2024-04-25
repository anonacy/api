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
  webhook: `https://test${randomNumber}.anonacy.com/webhook`
}

describe('Webhook Tests', function() {
  this.timeout(30000); // 30 seconds


  it('add a webhook', (done) => {
    request(URL)
      .post('/webhook')
      .set('Authorization', `Bearer ${API_KEY}`)
      .send({"webhook": VARS.webhook})
      .end((err, res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.body.webhook).to.equal(VARS.webhook);
        done();
      });
  });

  it('find the webhook in list', (done) => {
    request(URL)
      .get('/webhooks')
      .set('Authorization', `Bearer ${API_KEY}`)
      .end((err, res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.body.length).to.be.greaterThan(0);

        // Find the webhook in the array
        const webhook = res.body.find((x) => x.webhook === VARS.webhook);
        expect(webhook).to.exist;
        done();
      });
  });

  it('error when trying to add webhook again', (done) => {
    request(URL)
      .post('/webhook')
      .set('Authorization', `Bearer ${API_KEY}`)
      .send({"webhook": VARS.webhook})
      .end((err, res) => {
        expect(res.statusCode).to.equal(500);
        expect(res.body.error).to.equal("Webhook already exists");
        done();
      });
  });

  it('disable the webhook', (done) => {
    request(URL)
      .put('/webhook')
      .set('Authorization', `Bearer ${API_KEY}`)
      .send({"webhook": VARS.webhook, "enabled": false})
      .end((err, res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.body.success).to.be.true;
        done();
      });
  });

  it('check webhook was disabled', (done) => {
    request(URL)
      .get('/webhooks')
      .set('Authorization', `Bearer ${API_KEY}`)
      .end((err, res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.body.length).to.be.greaterThan(0);
        const webhook = res.body.find((x) => x.webhook === VARS.webhook);
        expect(webhook.enabled).to.equal(0);
        done();
      });
  });

  it('enable the webhook', (done) => {
    request(URL)
      .put('/webhook')
      .set('Authorization', `Bearer ${API_KEY}`)
      .send({"webhook": VARS.webhook, "enabled": true})
      .end((err, res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.body.success).to.be.true;
        done();
      });
  });

  it('check webhook was enabled', (done) => {
    request(URL)
      .get('/webhooks')
      .set('Authorization', `Bearer ${API_KEY}`)
      .end((err, res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.body.length).to.be.greaterThan(0);
        const webhook = res.body.find((x) => x.webhook === VARS.webhook);
        expect(webhook.enabled).to.equal(1);
        done();
      });
  });

  it('delete the webhook', (done) => {
    request(URL)
      .delete('/webhook')
      .set('Authorization', `Bearer ${API_KEY}`)
      .query({"webhook": VARS.webhook})
      .end((err, res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.body.success).to.be.true;
        done();
      });
  });

  it('check webhook was deleted', (done) => {
    request(URL)
      .get('/webhooks')
      .set('Authorization', `Bearer ${API_KEY}`)
      .end((err, res) => {
        expect(res.statusCode).to.equal(200);
        const webhook = res.body.find((x) => x.webhook === VARS.webhook);
        expect(webhook).to.not.exist;
        done();
      });
  });

  // after((done) => {
  //   server.close(done);
  // });
});