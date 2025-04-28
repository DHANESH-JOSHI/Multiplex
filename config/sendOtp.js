const axios = require('axios');
dotenv = require('dotenv');
dotenv.config();
async function sendOtp(mobile, otp) {
    console.log(mobile);
    const smsApiUrl = 'http://bulk.nationalsms.in/sms-panel/api/http/index.php';

    const params = {
        username: process.env.SMS_USERNAME,          // Your SMS panel username
        apikey: process.env.SMS_APIKEY,              // Your SMS panel API key
        apirequest: 'Text',                  // Request type: Text or Unicode
        sender: process.env.SMS_SENDER,              // Sender ID
        mobile: mobile,                              // Recipient's mobile number
        message: `Dear Customer, ${otp} is your one time password (OTP). Please enter the OTP to proceed. Thank You - NKFC PVT. LTD. (MultiplexPlay OTT) h519E341tzh`,          // OTP message content
        route: process.env.SMS_ROUTE,                // Route for the SMS (e.g., promotional or transactional)
        TemplateID: '1707172378897130616',     // Template ID for the message
        format: 'JSON',                              // Format of the response (JSON)
    };

    try {
        const response = await axios.get(smsApiUrl, { params });
        console.log("SMS API Response:", response.data);
    } catch (error) {
        console.error("Error sending OTP SMS:", error.response ? error.response.data : error.message);
    }
}

module.exports = sendOtp;
