const Counter = require('../models/counter.model');

async function getNextSequence(name) {
  const updatedCounter = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return updatedCounter.seq;
}

module.exports = { getNextSequence };
