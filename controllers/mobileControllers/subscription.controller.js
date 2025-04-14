const subscriptionService = require('../../services/mobileServices/subscription.service.js');

exports.getUserSubscriptionStatus = async (req, res) => {
  // Retrieve user_id from the query string
  const userId = req.query.user_id;

  // Validate user_id is provided
  if (!userId) {
    return res.status(400).json({
      status: 'error',
      message: 'You must provide user ID.'
    });
  }

  try {
    // Get subscription data from the service layer
    const subscriptionData = await subscriptionService.checkUserSubscriptionStatus(userId);
    return res.status(200).json(subscriptionData);
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};
