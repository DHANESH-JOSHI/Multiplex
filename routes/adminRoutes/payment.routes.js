const express = require("express");
const router = express.Router();
const { addSubscription,
        updatePayment,
        getAllSubscriptions,
        getSubscriptionById,
        updateSubscription,
        deleteSubscription,
        checkVideoSubscription,
        grantManualSubscription
         } = require("../../controllers/adminController/payment.controller");

router.post("/", addSubscription);
router.post("/manual", grantManualSubscription);
router.post("/receipt", updatePayment)
router.get("/", getAllSubscriptions);
router.get("/check_user_subscription", getSubscriptionById);
router.get("/check_video_subscription", checkVideoSubscription);
router.put("/:id", updateSubscription);
router.delete("/:id", deleteSubscription);

module.exports = router;