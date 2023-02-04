let { createWorker, createScheduler, PSM } = require('tesseract.js');

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
    // In theory this should improve accuracy, but it doesn't seem to.
    // await worker.setParameters({
    //   tessedit_pageseg_mode: PSM.SPARSE_TEXT
    // })
    scheduler.addWorker(worker);
  }));
  let processed = 0;
  const results = await Promise.all(files.map(filename => {
    let seconds = filename.match(/frame-(\d+)\.png/)[1];
    return scheduler.addJob('recognize', filename).then(result => {
      processed++;
      console.log(`Transcribed ${processed} of ${files.length}`);
      return { seconds: Number(seconds), text: result.data.text };
    })
  })).then(results => results.sort((a, b) => a.seconds - b.seconds));
  await scheduler.terminate();
  return results;
};

module.exports = extractText;
