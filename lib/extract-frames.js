const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

function clearDirectory(dirPath) {
  fs.readdirSync(dirPath).forEach(file => {
    fs.unlinkSync(path.join(dirPath, file));
  });
}

function listFiles(dirPath) {
  return fs.readdirSync(dirPath).map(file => {
    return path.join(dirPath, file);
  });
}

function extractFrames(filename, destDir, quiet = false) {
  clearDirectory(destDir);
  return new Promise((resolve, reject) => {
    ffmpeg(filename)
      .outputOptions('-r 1')
      .size('200%')
      .videoFilters('eq=contrast=2:brightness=0.1:gamma=2')
      .videoFilters('format=gray')
      .output(path.join(destDir, 'frame-%09d.png'))
      .on('progress', progress => {
        if (quiet) return;
        let percent = Math.min(100, Math.round(progress.percent))
        console.log(`Framing progress: ${percent}%`);
      }).on('error', error => reject(error))
      .on('end', () => resolve(listFiles(destDir)))
      .run();
  });
}

module.exports = extractFrames;
