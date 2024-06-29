const crypto = require('crypto');
const moment = require('moment');
const db = require('../database/connection');
const nodemailer = require('nodemailer');
require('dotenv').config();
function generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
}

async function storeOTP(email, otp) {
    let conn;
    try {
        conn = await db.connect();
        const expirationTime = moment().add(2, 'minutes').toISOString(); // MongoDB typically uses ISODate format        
        const collection = conn.collection('students');
        const result = await collection.insertOne({ email: email, otp: otp, expirationTime: expirationTime });
        if (result.insertedCount === 0) {
            throw new Error("Failed to insert OTP for the email");
        } else {
            return true;
        }
    } catch (err) {
        throw err;
    }
}

async function verifyOTP(email, receivedOTP) {
    let conn;
    try {
        conn = await db.connect();
        const collection = conn.collection('students');
        const user = await collection.findOne({ email: email });

        if (!user)
            throw new Error("Email not Found");

        if (moment().isAfter(moment(user.expirationTime))) {
            throw new Error("OTP has Expired");
        }

        if (receivedOTP !== user.otp) {
            throw new Error("OTP is incorrect");
        }

        await collection.updateOne(
            { email: email },
            {
                $unset: { otp: "", expirationTime: "" },
                $addToSet: { verifiedItems: "email" }
            }
        );
        return true;
    } catch (err) {
        throw err;
    }
}




async function sendOTPthroughEmail(email, otp) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: process.env.EMAIL_USER,
            clientId: process.env.OAUTH_CLIENTID,
            clientSecret: process.env.OAUTH_CLIENT_SECRET,
            refreshToken: process.env.OAUTH_REFRESH_TOKEN,
        }
    });

    let mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Your OTP for verification for Learn Link',
        text: `Hi there,

Thank you for using Learn Link! To ensure your safety, please enter the following One-Time Password (OTP) in the designated field on our website:

${otp}

This OTP is valid for 2 minutes. Please do not share it with anyone else.

If you did not initiate this request, please disregard this email.
Welcome to Learn Link!

Sincerely,

The Learnlink Team`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.log('Failed to send email', error);
        throw error;
    }
}




module.exports = {
    generateOTP,
    storeOTP,
    verifyOTP,
    sendOTPthroughEmail
};
