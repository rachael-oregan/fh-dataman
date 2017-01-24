import assert from 'assert';
import deleteCollections from './delete';
import sinon from 'sinon';
import {getLogger} from '../../../logger';

const logger = getLogger();
const dropStub = sinon.stub();

const mockDb = {
  dropCollection: dropStub
};

export function testDeleteCollections(done) {
  dropStub.returns(true);
  assert.equal(deleteCollections('test-delete-app', logger, mockDb, 'testCollection'), true);
  done();
}

export function testDeleteCollectionsFailure(done) {
  dropStub.returns(false);
  assert.equal(deleteCollections('test-delete-app', logger, mockDb, 'testCollection'), false);
  done();
}