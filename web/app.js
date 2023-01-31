async function load() {
  const eventsElement = document.querySelector('[data-events]');
  eventsElement.innerHTML = 'Loading...';

  const data = await fetch('/data/real.json').then(response => response.json());
  const events = extractEvents(data);

  eventsElement.innerHTML = events.map(event => {
    return `<li><a href="#" onclick="scrollVideo(${event.seconds})">${event.seconds}: ${event.text}</a></li>`;
  }).join('');
}

load().then(() => {
  console.log('Loaded');
}).catch(error => {
  console.error(error);
});

function extractEvents(data) {
  let lastTestLog = null;
  let lastTestRun = null;
  return data.map(item => {
    let testLog = getLastIfExists(item.text, /Finished in [\d.]+ seconds \(files took [\d.]+/g);
    let testRun = getLastIfExists(item.text, /[\d@]+ exa..les?, [\d@]+ fa...res?(, \d+ pending|)(, \d+ err.r|)/g);
    if (testLog && testLog[0] != lastTestLog) {
      console.warn('New testLog but no new run', testLog, testRun)
    }
    let isNewRun = testRun && testRun !== lastTestRun;
    if (isNewRun) {
      let seconds = Number(item.seconds);
      lastTestLog = testLog && testLog;
      lastTestRun = testRun && testRun;
      return { seconds, text: `${testRun} (${testLog})` };
    }
  }).filter(item => item);
}

function getLastIfExists(string, regex) {
  let matches = Array.from(string.matchAll(regex));
  if (matches.length === 0) return null;
  let match = Array.from(matches)[matches.length - 1][0];
  return match.replaceAll('@', '0');
}

function scrollVideo(seconds) {
  const video = document.querySelector('video');
  video.currentTime = seconds;
}
