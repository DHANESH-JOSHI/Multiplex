const { sendBulkNotifications } = require('../services/notificationService');

// Simulated DB (replace with actual DB query in real use)
const users = Array.from({ length: 50000 }, (_, i) => ({
  name: `User${i + 1}`,
  fcm: `token_${i + 1}`, // Replace with real tokens from DB
}));

const notifyAllUsers = async (req, res) => {
  const tokens = users.map(u => u.fcm).filter(Boolean);

  const payload = {
    notification: {
      title: "🚀 App Update!",
      body: "Check out what's new in your dashboard.",
    },
  };

  try {
    const results = await sendBulkNotifications(tokens, payload);

    const totalSuccess = results.reduce((acc, r) => acc + r.successCount, 0);
    const totalFailure = results.reduce((acc, r) => acc + r.failureCount, 0);

    res.status(200).json({
      message: 'Notification process completed.',
      totalBatches: results.length,
      totalSuccess,
      totalFailure,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { notifyAllUsers };
