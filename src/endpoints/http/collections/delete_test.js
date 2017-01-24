import assert from 'assert';
import deleteCollections from './delete';
import sinon from 'sinon';
import {getLogger} from '../../../logger';
import sinonStubPromise from 'sinon-stub-promise';

sinonStubPromise(sinon);
const logger = getLogger();
const dropStub = sinon.stub().returnsPromise();
const listStub = sinon.stub().returnsPromise();

const mockDb = {
  dropCollection: dropStub,
  listCollections: function() {
    return {
      toArray: listStub
    };
  }
};

const mockReqCollections = ['testCollection', 'collection1'];

export function testDeleteCollections(done) {
  dropStub.resolves({name: 'testCollection'}, {name: 'collection1'});
  listStub.resolves([{name: 'testCollection'}, {name: 'collection1'}, {name: 'collection2'}]);
  deleteCollections('test-delete-app', logger, mockDb, mockReqCollections).then(collections => {
    assert.equal(collections, [{name: 'testCollection'}, {name: 'collection1'}]);
    done();
  });
}