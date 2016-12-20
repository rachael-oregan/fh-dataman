import supertest from 'supertest';
import assert from 'assert';
import express from 'express';
import authorize from '../';

const testEndPointAuthorized = '/test/endpoint/authorized';
const testEndPointForbidden = '/test/endpoint/forbidden';

const app = express();

app.use((req, res, next) => {
  req.user = { permission: { read: true } };
  next();
});

app.get(testEndPointAuthorized, authorize({ permissionPath: 'user.permission.read' }), (req, res) => {
  res.status(200).end();
});
app.get(testEndPointForbidden, authorize({ permissionPath: 'user.permission.write' }), (req, res) => {
  res.status(200).end();
});

app.use((err, req, res, next) => {
  if (err) {
    return res.status(err.code).send({ message: err.message });
  }

  return res.status(200).end();
});

export function requestShouldPassAuthorization(done) {
  supertest(app)
    .get(testEndPointAuthorized)
    .expect(200)
    .end(done);
}

export function requestShouldFailAuthorization(done) {
  supertest(app)
    .get(testEndPointForbidden)
    .expect(403)
    .expect(res => {
      assert.equal(res.body.message, 'No permission');
    })
    .end(done);
}