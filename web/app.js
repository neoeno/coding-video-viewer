async function load() {
  const eventsElement = document.querySelector('[data-events]');
  eventsElement.innerHTML = 'Loading...';

  const data = await fetch('/data/real-3.json').then(response => response.json());
  const events = extractEvents(data);

  let lastEvent = new Event('Start', 0);
  eventsElement.innerHTML = events.map(event => {
    let formatted = `<li><a href="#" onclick="scrollVideo(${event.timestamp})">${formatEvent(event, lastEvent)}</a></li>`;
    lastEvent = event;
    return formatted;
  }).join('');
}

load().then(() => {
  console.log('Loaded');
}).catch(error => {
  console.error(error);
});

function extractEvents(data) {
  return [
    new Event('Start', 0),
    ...extractFirstTestRunCompleted(data),
    ...extractTestRunStatusUpdate(data),
  ]
}

function formatEvent(event, lastEvent) {
  let elapsed = event.timestamp - lastEvent.timestamp;
  if (event.name === 'Start') {
    return `🎥 Start`;
  }
  if (event.name === 'TestSuitePass') {
    let pending = event.data.pending === 0 ? '' : `, ${event.data.pending} pending`;
    return `🟢 +${friendlyElapsed(elapsed)} Suite Passed (${event.data.examples} examples${pending})`;
  }
  if (event.name === 'TestSuiteFail') {
    let pending = event.data.pending === 0 ? '' : `, ${event.data.pending} pending`;
    let errors = event.data.errors === 0 ? '' : `, ${event.data.errors} errors`;
    return `🔴 +${friendlyElapsed(elapsed)} Suite Failed (${event.data.examples} examples, ${event.data.failures} failures${pending}${errors})`;
  }
  if (event.name === 'FirstTestRunCompleted') {
    return `⚙️ +${friendlyElapsed(elapsed)} - First Test Run`;
  }
  return `Unknown event at ${event.timestamp}`;
}

function friendlyElapsed(timestamp) {
  if (timestamp < 60) {
    return `${timestamp}s`;
  }
  return `${Math.round(timestamp / 60)}m`;
}

function getLastIfExists(string, regex) {
  let matches = Array.from(string.matchAll(regex));
  if (matches.length === 0) return null;
  let match = Array.from(matches)[matches.length - 1][0];
  return match.replaceAll('@', '0');
}

function scrollVideo(seconds) {
  const video = document.querySelector('video');
  video.currentTime = seconds - 2; // Not sure why 2.
}
