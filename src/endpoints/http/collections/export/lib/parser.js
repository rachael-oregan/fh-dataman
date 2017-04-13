import stream from 'stream';
import jcsv from 'jcsv';
import concat from 'concat-stream';
import str from 'string-to-stream';

class JSON extends stream.Transform {
  constructor() {
    super({ objectMode: true });
  }

  _transform(data, encoding, cb) {
    data = JSON.stringify(data);
    this.push(data);
    cb();
  }
}

function bson(collection) {
  Promise.resolve(collection);
}

function json(collection) {
  const parserJson = new JSON();
  parserJson.filename = collection.filename;
  return Promise.resolve(collection.pipe(parserJson));
}

function csv(collection) {
  const promise = new Promise((resolve, reject) => {
    collection.pipe(concat(jsonArray => {
      jcsv(jsonArray, { separator: ',', newline: "\r\n", headers: true }, (err, csv) => {
        if (err) {
          return reject(err);
        }
        const stream = str(csv);
        stream.filename = collection.filename;
        resolve(stream);
      });
    }));
  });
  return promise;
}

// const parsers = {
//   bson: collection => Promise.resolve(collection),
//   json: collection => {
//     const parserJson = new json();
//     parserJson.filename = collection.filename;
//     return Promise.resolve(collection.pipe(parserJson));
//   },
//   csv: collection => {
//     const promise = new Promise((resolve, reject) => {
//       collection.pipe(concat(jsonArray => {
//         jcsv(jsonArray, { separator: ',', newline: "\r\n", headers: true }, (err, csv) => {
//           if (err) {
//             return reject(err);
//           }
//           const stream = str(csv);
//           stream.filename = collection.filename;
//           resolve(stream);
//         });
//       }));
//     });
//     return promise;
//   }
// };

export { json, csv, bson };