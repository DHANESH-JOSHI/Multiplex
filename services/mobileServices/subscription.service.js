const Subscription = require('../../models/subscription.model.js');

async function getSubscriptionStatus(userId, videoId = null) {
  // Find the latest subscription for the user (adjust the query as needed)
  const subscription = await Subscription.findOne({ user: userId })
    .sort({ created_at: -1 })
    .populate('plan'); // Populate plan info if available

  // If no subscription is found, return inactive/default response
  if (!subscription) {
    return {
      plan_status: 'inactive',
      package_title: 'Free',
      expire_date: '06-03-2125',
      video_access: false
    };
  }

  // Get current time in seconds
  const nowInSeconds = Math.floor(Date.now() / 1000);
  
  // Check if the subscription is active
  if (subscription.timestamp_to > nowInSeconds && subscription.status === 1) {
    
    const expireDate = new Date(subscription.timestamp_to * 1000);
    const formattedExpireDate = expireDate.toISOString().split('T')[0];
    
    // If a plan exists, use its title; otherwise, default to "Free"
    const packageTitle = subscription.plan ? subscription.plan.title : 'Free';
    
    // If videoId is provided, check video access
    if (videoId) {
      const hasVideoAccess = subscription.plan && subscription.plan.videos && 
        subscription.plan.videos.includes(videoId);
      
      return {
        status: 'active',
        package_title: packageTitle,
        expire_date: formattedExpireDate,
        video_access: hasVideoAccess
      };
    }
    
    return {
      status: 'active',
      package_title: packageTitle,
      expire_date: formattedExpireDate
    };
  } else {
    // Subscription is expired or inactive
    return {
      status: 'inactive',
      package_title: 'Free',
      expire_date: '06-03-2125',
      video_access: false
    };
  }
}

async function checkVideoAccess(userId, videoId) {
  const subscription = await Subscription.findOne({ user: userId })
    .sort({ created_at: -1 })
    .populate('plan');

  if (!subscription || !subscription.plan) {
    return false;
  }

  const nowInSeconds = Math.floor(Date.now() / 1000);
  
  if (subscription.timestamp_to > nowInSeconds && subscription.status === 1) {
    return subscription.plan.videos && subscription.plan.videos.includes(videoId);
  }

  return false;
}

module.exports = { getSubscriptionStatus, checkVideoAccess };
