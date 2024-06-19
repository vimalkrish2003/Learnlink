const crypto = require('crypto');
const moment = require('moment');
const pool = require('../database/connection');
require('dotenv').config();
function generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
}

async function storeOTP(email, otp) {
    let conn;
    try {
        conn = await pool.getConnection();
        const expirationTime = moment().add(2, 'minutes').format('YYYY-MM-DD HH:mm:ss');
        await conn.query("UPDATE USERS SET otp = ?, expiration_time = ? WHERE email = ?", [otp, expirationTime, email]);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

async function verifyOTP(email, receviedOTP) {
    let conn;
    try {
        conn = await pool.getConnection();
        const result = await conn.query("SELECT otp, expiration_time FROM USERS WHERE email = ?", [email]);
        if (result.length == 0)
            throw new Error("Email not Found");
        if (moment().isAfter(moment(result[0].expiration_time))) {
            throw new Error("OTP has Expired");
        }
        else if (receviedOTP !== result[0].otp) {
            throw new Error("OTP is incorrect");
        }
        await conn.query("UPDATE USERS SET otp=NULL,expiration_time=NULL,email_verified=true where email= ?", [email]);
        return true;

    }
    catch (err) {
        throw err;
    }
    finally {
        if (conn)
            conn.release();
    }
}
const nodemailer = require('nodemailer');

async function sendOTPthroughEmail(email, otp) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    let mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Your OTP for verification in EthLance ',
        text: `Hi there,

        Thank you for using EthLance! To ensure your safety, please enter the following One-Time Password (OTP) in the designated field on our website:
        
        ${otp}
        
        This OTP is valid for 2 minutes. Please do not share it with anyone else.
        
        If you did not initiate this request, please disregard this email.
        Welcome to EthLance!
        
        Sincerely,
        
        The EthLance Team`
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function cleanupUnverifiedUsers() {
    let conn;
    try {
        conn = await pool.getConnection();
        const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
        conn.query("DELETE FROM USERS WHERE email_verified = false AND (expiration_time < ? OR expiration_time IS NULL)", [currentTime]);
    } catch (err) {
        throw err;
    }
    finally {
        if (conn)
            conn.release();
    }
}
//Run the cleanup function every 24 hours

//setInterval(cleanupUnverifiedUsers, 24 * 60 * 60 * 1000);   Remove Comment while running

module.exports = {
    generateOTP,
    storeOTP,
    verifyOTP,
    sendOTPthroughEmail
};
