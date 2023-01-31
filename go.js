const path = require('path');
const fs = require('fs');
const extractFrames = require('./lib/extract-frames');
const extractText = require('./lib/extract-text');

const args = process.argv.slice(2);
const inputFile = args[0];
const outputFile = args[1];

const TMP_DIR = path.join(__dirname, 'tmp');

extractFrames(inputFile, TMP_DIR).then(async files => {
  console.log(`Extracted ${files.length} frames`);
  const results = await extractText(files);
  results
    .forEach(result => {
      fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
    });
}).catch(error => {
  console.error(error);
});
