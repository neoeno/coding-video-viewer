async function load() {
  const eventsElement = document.querySelector('[data-events]');
  eventsElement.innerHTML = 'Loading...';

  const data = await fetch('data/snippet.json').then(response => response.json());
  const events = extractEvents(data);

  eventsElement.innerHTML = events.map((evt, idx) => {
    let nextEvent = events[idx + 1] || new Event('End', 803);
    evt.duration = nextEvent.timestamp - evt.timestamp;
    let formatted = `
      <li data-timestamp="${evt.timestamp}" data-duration="${evt.duration}" onclick="scrollVideo(${evt.timestamp})" class="evt evt-type-${evt.name}">
        <div class="evt-scroller"><div class="evt-scroller-inner"></div></div>
        <div class="evt-timing">${friendlyTime(evt.timestamp)} for ${friendlyDuration(evt.timestamp, nextEvent)}</div>
        <div class="evt-title">${formatEvent(evt)}</div>
        <div class="evt-extra">${formatExtra(evt)}</div>
      </li>`;
    return formatted;
  }).join('');

  // Update events list as video plays
  const videoElem = document.querySelector('video');
  let lastActive = null;
  videoElem.addEventListener('timeupdate', () => {
    const currentTimestamp = Math.floor(videoElem.currentTime) + 2;
    const currentEvents = events.filter(evt => evt.timestamp <= currentTimestamp);

    const pastEventElems = document.querySelectorAll('.evt-past');
    pastEventElems.forEach(elem => {
      elem.classList.remove('evt-past');
    });
    const currentEventElems = document.querySelectorAll('.evt-current');
    currentEventElems.forEach(elem => {
      elem.classList.remove('evt-current');
    });
    const currentEventScrollerElems = document.querySelectorAll('.evt-scroller-inner');
    currentEventScrollerElems.forEach(elem => {
      elem.style.width = '0%';
    });

    currentEvents.forEach(currentEvent => {
      const currentEventElem = document.querySelectorAll(`[data-timestamp="${currentEvent.timestamp}"]`);
      currentEventElem.forEach(elem => {
        elem.classList.add('evt-past');
      });
    });

    const activeEvent = currentEvents[currentEvents.length - 1];
    const activeEventElem = document.querySelector(`[data-timestamp="${activeEvent.timestamp}"][data-duration="${activeEvent.duration}"]`);
    activeEventElem.classList.add('evt-current');
    activeEventElem.querySelector('.evt-scroller-inner').style.width = `${(currentTimestamp - activeEvent.timestamp) / activeEvent.duration * 100}%`;

    // Scroll active event elem into view
    if (lastActive === activeEventElem) return;
    lastActive = activeEventElem;
    activeEventElem.scrollIntoView({ behavior: 'smooth', block: 'center' });

  })

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

function formatEvent(event) {
  if (event.name === 'Start') {
    return `🎥 Start`;
  }
  if (event.name === 'TestSuitePass') {
    return `🟢 Suite Passed`;
  }
  if (event.name === 'TestSuiteFail') {
    return `🔴 Suite Failed`;
  }
  if (event.name === 'FirstTestRunCompleted') {
    return `⚙️ First Test Run`;
  }
  return `Unknown event: ${event.name}`;
}

function formatExtra(event) {
  if (event.name === 'TestSuitePass') {
    let pending = event.data.pending === 0 ? '' : `, ${event.data.pending} pending`;
    return `${event.data.examples} examples${pending}`;
  }
  if (event.name === 'TestSuiteFail') {
    let pending = event.data.pending === 0 ? '' : `, ${event.data.pending} pending`;
    let errors = event.data.errors === 0 ? '' : `, ${event.data.errors} errors`;
    return `${event.data.examples} examples, ${event.data.failures} failures${pending}${errors}`;
  }
  return '';
}

function friendlyDuration(timestamp, nextEvent) {
  let duration = nextEvent.timestamp - timestamp;
  if (duration >= 60) {
    return `${Math.round(duration/60)}m`;
  }
  return `${duration.toString()}s`;
}

function friendlyTime(timestamp) {
  let minutes = Math.floor(timestamp / 60);
  let seconds = Math.floor(timestamp % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
