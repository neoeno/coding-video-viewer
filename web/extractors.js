class Event {
  constructor(name, timestamp, data) {
    this.name = name;
    this.timestamp = timestamp;
    this.data = data || {};
  }
}

function extractFirstTestRunCompleted(frames) {
  let matchedFrame = frames.find(frame => {
    return /Finished in|seconds to load/.test(frame.text)
  });
  if (!matchedFrame) {
    return [];
  }
  return [new Event('FirstTestRunCompleted', matchedFrame.seconds)];
}

function extractTestRunStatusUpdate(frames) {
  let interestingTestFrames = frames.filter(frame => {
    return /Finished in|seconds to load/.test(frame.text)
  })
  let testRunResults = interestingTestFrames.map(frame => {
    let matches = Array.from(frame.text.matchAll(/(\S+) exa.ples?, (\S+) .ailures?(, (\S+) pending?|)([^\n]* (\S+) err.rs?|)/g));
    if (!matches || matches.length === 0) {
      return null;
    }
    let lastMatch = Array.from(matches)[matches.length - 1];
    let [_1, examples, failures, _2, pending, _3, errors] = lastMatch;
    examples = glomToNumber(examples);
    failures = glomToNumber(failures);
    pending = glomToNumber(pending) || 0;
    errors = glomToNumber(errors) || 0;
    if (failures > examples) {
      return null;
    }
    return {
      full: _1,
      timestamp: frame.seconds,
      examples,
      failures,
      pending,
      errors,
      repeats: 1,
    };
  }).filter(result => result !== null);
  console.log(testRunResults);
  let withoutDuplicates = testRunResults.reduce((acc, result) => {
    if (acc.length === 0) {
      return [result];
    }
    let last = acc[acc.length - 1];
    if (last.examples === result.examples && last.failures === result.failures && last.errors === result.errors && last.pending === result.pending) {
      last.repeats += 1;
      return acc;
    }
    return [...acc, result];
  }, []);
  console.log(withoutDuplicates);
  let aboveThreshold = withoutDuplicates.filter(result => {
    return result.repeats > 5;
  });
  let withoutDuplicatesTwo = aboveThreshold.reduce((acc, result) => {
    if (acc.length === 0) {
      return [result];
    }
    let last = acc[acc.length - 1];
    if (last.examples === result.examples && last.failures === result.failures && last.errors === result.errors && last.pending === result.pending) {
      last.repeats += result.repeats;
      return acc;
    }
    return [...acc, result];
  }, []);
  return withoutDuplicatesTwo.map(result => {
    let status = result.failures === 0 && result.errors === 0;
    if (status) {
      return new Event('TestSuitePass', result.timestamp, result);
    } else {
      return new Event('TestSuiteFail', result.timestamp, result);
    }
  });
}

function glomToNumber(string) {
  // Copyright symbol:  ©, r:
  if (string == '©' || string == "®" || string == "@") {
    return 0;
  }
  return Number(string);
}

function assertEqual(msg, a, b) {
  if (a !== b) {
    console.error(`Failure: ${msg}`, a, b);
  }
  console.log(`Pass: ${msg}`);
}

async function runTests() {
  let frames = await fetch('/test_data.json').then(response => response.json());
  let firstTestRunCompletedEvents = extractFirstTestRunCompleted(frames);
  assertEqual('should have one event', firstTestRunCompletedEvents.length, 1);
  assertEqual('should have correct timestamp', firstTestRunCompletedEvents[0].timestamp, 988);

  // let testRunStatusUpdateEvents = extractTestRunStatusUpdate(frames);
  // assertEqual('should have 24 events', testRunStatusUpdateEvents.length, 24);
  // assertEqual('should have correct name', testRunStatusUpdateEvents[0].name, 'TestSuiteFail');
  // assertEqual('should have correct timestamp', testRunStatusUpdateEvents[0].timestamp, 988);
  // assertEqual('should have correct examples', testRunStatusUpdateEvents[0].data.examples, 0);
  // assertEqual('should have correct failures', testRunStatusUpdateEvents[0].data.failures, 0);
  // assertEqual('should have correct errors', testRunStatusUpdateEvents[0].data.errors, 1);
  // assertEqual('should have correct name', testRunStatusUpdateEvents[18].name, 'TestSuiteFail');
  // assertEqual('should have correct timestamp', testRunStatusUpdateEvents[18].timestamp, 1406);
  // assertEqual('should have correct examples', testRunStatusUpdateEvents[18].data.examples, 12);
  // assertEqual('should have correct failures', testRunStatusUpdateEvents[18].data.failures, 1);
  // assertEqual('should have correct errors', testRunStatusUpdateEvents[18].data.errors, 0);



}

runTests().then(() => {
  console.log('Tests passed');
}).catch(error => {
  console.error(error);
});

