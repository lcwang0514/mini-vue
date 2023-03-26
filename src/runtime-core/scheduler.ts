const queue: any[] = [];
let isFlushEnding = false;

const p = Promise.resolve();
export function nextTick(fn) {
  return fn ? p.then(fn) : p;
}

export function queueJobs(job) {
  if (!queue.includes(job)) {
    queue.push(job);
  }

  queueFlush();
}

function flushJobs() {
  isFlushEnding = false;
  let job;
  while ((job = queue.shift())) {
    job && job();
  }
}

function queueFlush() {
  if (isFlushEnding) return;
  isFlushEnding = true;
  nextTick(flushJobs);
}
