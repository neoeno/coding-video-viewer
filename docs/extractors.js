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
    let matches = Array.from(frame.text.matchAll(/(\S+) exa.ples?, (\S+) .ailures?(, (\S+) p.nding?|)([^\n]* (\S+) err.rs?|)/g));
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
  let aboveThreshold = withoutDuplicates.filter(result => {
    return result.repeats > 1;
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
  console.log(withoutDuplicatesTwo)
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
