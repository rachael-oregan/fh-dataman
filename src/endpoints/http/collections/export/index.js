import parsers from './lib/parser';
import archive from './lib/archive';
import UnsupportedMediaError from '../../../../Errors/UnsupportedMediaError';

const GB = 1073741824;

function getCollectionSizeOne(db, collectionName) {
  return new Promise((resolve, reject) => {
    db.collection(collectionName).stats((err, stats) => {
      if (err) {
        return reject(err.message === 'ns not found' ? new Error(`${collectionName} collection does not exist`) : err);
      }

      resolve(stats.size);
    });
  });
}

function getCollectionsSize(db, collectionNames) {
  return Promise.all(collectionNames.map(name => getCollectionSizeOne(db, name)));
}

function getTotalSize(sizes) {
  return sizes.reduce((acc, size) => acc + size, 0);
}

function getCollectionStreams(collections, db, format, raw) {
  return collections.map(name => {
    const collection = db.collection(name);
    const cursor = collection.find({}, { raw: raw });
    cursor.filename = `${name}.${format}`;
    return cursor.stream();
  });
}

function setParsers(streams, format) {
  return streams.map(collection => {
    try {
      const parsedCollections = parsers[format](collection);
      return parsedCollections;
    } catch (err) {
      throw new UnsupportedMediaError();
    }
  });
}

function exportZip(zipFile, out) {
  console.log("----outStream: ", out);
  return new Promise((resolve, reject) => {
    zipFile
      .pipe(out)
      .on('finish', resolve)
      .on('error', reject);
  });
}

function exportHandler(db, collectionNames, format, out) {
  return getCollectionsSize(db, collectionNames)
    .then(sizes => {
      if (getTotalSize(sizes) >= GB) {
        throw new Error("Cannot export collections larger than a gigabyte");
      }
      const streams = getCollectionStreams(collectionNames, db, format, format === 'bson');
      const parsedCollections = setParsers(streams, format);
      return Promise.all(parsedCollections);
    })
    .then(collections => archive(collections))
    .then(zipFile => {
      console.log("------zipFileThen: ", zipFile);
      console.log("--------out: ", out);
      exportZip(zipFile, out);
    });
}

/**
 * Exports collection(s) for a given app.
 *
 * @param {db} db The db connection.
 * @param {String} name The name of the collection to be created.
 * @returns Promise
 */
export default function exportCollections(db, reqCollections, format, out) {
  if (!reqCollections.length) {
    return db
      .listCollections()
      .map(collection => collection.name.split('.').pop())
      .toArray()
      .then(names => {
        const collectionNames = names.filter(name => name !== 'indexes' & name !== 'users');
        return exportHandler(db, collectionNames, format, out);
      });
  }
  // return exportHandler(db, reqCollections, format, out);
}