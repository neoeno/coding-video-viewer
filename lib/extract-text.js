let { createWorker, createScheduler } = require('tesseract.js');

async function extractText(files) {
  const scheduler = createScheduler();
  await Promise.all([
    await createWorker(),
    await createWorker(),
    await createWorker(),
    await createWorker(),
    await createWorker(),
    await createWorker(),
    await createWorker(),
    await createWorker()
  ].map(async worker => {
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    scheduler.addWorker(worker);
  }));
  let processed = 0;
  const results = await Promise.all(files.map(filename => {
    let seconds = filename.match(/frame-(\d+)\.png/)[1];
    return scheduler.addJob('recognize', filename).then(result => {
      processed++;
      console.log(`Transcribed ${processed} of ${files.length}`);
      return { seconds, text: result.data.text };
    })
  })).then(results => results.sort((a, b) => a.seconds - b.seconds));
  // OOM error here somehow. To investigate.
  await scheduler.terminate();
  return results;
};

module.exports = extractText;
