const { createRazorpayOrder, verifyRazorpayPayment } = require('../../utils/razorpay');


const createPlan = async () => {
    try {

    }catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}