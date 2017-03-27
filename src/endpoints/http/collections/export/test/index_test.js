import assert from 'assert';
import sinon from 'sinon';
import sinonStubPromise from 'sinon-stub-promise';
import * as index from '../';
import * as parsers from '../lib/parser';
import * as archive from '../lib/archive';
import fs from 'fs';

sinonStubPromise(sinon);
const listStub = sinon.stub().returnsPromise();
const statsStub = sinon.stub();
const collectionStub = sinon.stub();
const streamStub = sinon.stub();
const readStream = fs.createReadStream(`${__dirname}/test/export/files/test/data.json`);
const writeStream = fs.createWriteStream({});

const mockDb = {
  listCollections: function() {
    return {
      map: function() {
        return {
          toArray: listStub
        };
      }
    };
  },
  collection: collectionStub
};

const exportCollections = index.default;

const supportedFormat = 'json';
const unsupportedFormat = 'txt';
const allCollections = [];
const reqCollections = ['collection1'];

parsers.default.json = function() {
  return { "_id": 1, "item": "bottle", "qty": 30 };
};

archive.default = function() {
  return {
    readStream
  };
};

export function testExportAllCollections(done) {
  listStub.resolves(['indexes', 'users', 'collection1', 'collection2']);
  statsStub.yields(null, {size: 100 } );
  collectionStub.returns({
    find: function() {
      return { stream: streamStub };
    },
    stats: statsStub
  });
  readStream.emit('finish');
  exportCollections(mockDb, allCollections, supportedFormat, writeStream).then(out => {
    console.log("----out: ", out);
    //check if data in write stream equals the data in the readStream
    done();
  });
}

// export function testExportUnsupportedMedia(done) {
//   listStub.resolves(['indexes', 'users', 'collection1', 'collection2']);
//   statsStub.yields(null, { size: 100 });
//   streamStub.returns({ "_id": 1, "item": "bottle", "qty": 30 });
//   collectionStub.returns({
//     find: function() {
//       return { stream: streamStub };
//     },
//     stats: statsStub
//   });
//   exportCollections(mockDb, allCollections, unsupportedFormat).catch(err => {
//     assert.equal(err.name, 'UnsupportedMediaError');
//     assert.equal(err.code, 415);
//     done();
//   });
// }

// export function testCollectionDoesNotExist(done) {
//   listStub.resolves(['indexes', 'users', 'collection1', 'collection2']);
//   statsStub.yields({ message: 'ns not found'});
//   collectionStub.returns({ stats: statsStub });
//   exportCollections(mockDb, allCollections, supportedFormat).catch(err => {
//     assert.equal(err.message, 'collection1 collection does not exist');
//     done();
//   });
// }

// export function testCollectionSizeTooBig(done) {
//   listStub.resolves(['indexes', 'users', 'collection1', 'collection2']);
//   statsStub.yields(null, { size: 1073741824 });
//   collectionStub.returns({ stats: statsStub });
//   exportCollections(mockDb, allCollections, supportedFormat).catch(err => {
//     assert.equal(err.message, 'Cannot export collections larger than a gigabyte');
//     done();
//   });
// }