const { admin } = require('../lib/firebaseAdmin');

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

async function sendBulkNotifications(tokens, payload) {
  const batches = chunkArray(tokens, 500);
  const results = [];

  for (const batch of batches) {
    const message = {
      tokens: batch,
      notification: payload.notification,
      data: payload.data || {},
    };

    try {
      const response = await admin.messaging().sendMulticast(message);
      results.push({
        successCount: response.successCount,
        failureCount: response.failureCount,
      });
    } catch (error) {
      results.push({
        successCount: 0,
        failureCount: batch.length,
        error: error.message,
      });
    }
  }

  return results;
}

module.exports = { sendBulkNotifications };
