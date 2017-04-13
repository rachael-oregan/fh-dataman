import yazl from 'yazl';

function archive(collections) {
  const zipFile = new yazl.ZipFile();
  collections.forEach(collection => {
    zipFile.addReadStream(collection, `${collection.filename}`);
  });
  zipFile.end();
  return zipFile.outputStream;
}

export { archive };