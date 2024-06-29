var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const initialisePassport = require('../utils/passportConfig');
const db = require('../database/connection');
const { generateOTP, storeOTP, verifyOTP, sendOTPthroughEmail } = require('../utils/oneTimePasswordManagement');
//initialising passport, 2nd param is a function to get user by email
initialisePassport(passport, async (email) => {
    let conn;
    try {
        conn = await db.connect();
        const collection = conn.collection('students');
        const user = await collection.findOne({ email: email }, { projection: { _id: 1, password: 1 } });
        return user;

    }
    catch (err) {
        throw err;
    }
});

//MIDDLEWARES

function checkAuthenticated(req, res, next) {
    if (!req.isAuthenticated()) {
        res.status(401).send('User is not authenticated');
        return res.redirect('/signup&in');
    }
    else {
        next();
    }

}

//TO IMPLEMENT CHECK AUTHENTICATED FOR STUDENTS THAT ARE ALSO TEACHERS

function checkNotAuthenticated(req, res, next)    //Authentication check for routes that should not be accessed after login
{
    if (req.isAuthenticated()) {
        res.status(403).send('User is already authenticated');
        return res.redirect('/in');
    }
    else {
        next();
    }
}


// GET FUNCTIONS
router.get('/check-auth', (req, res) => {
    if (req.isAuthenticated()) {
        res.status(200).send("Authenticated");
    } else {
        res.status(401).send("Not Authenticated");
    }
});


router.get('/', checkNotAuthenticated, (req, res) => {
    res.send("Intro page goes here");
})

router.get('/signup&in', checkNotAuthenticated, (req, res) => {
    res.send('signup & signin page goes here');
})

router.get('/forgotpassword', checkNotAuthenticated, (req, res) => {
    res.send("forgot password page goes here");
})

// POST FUNCTIONS

router.post('/signup', checkNotAuthenticated, async (req, res) => {
    let conn;
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        conn = await db.connect();
        const collection = conn.collection('students');
        // Check if a student with the given email already exists
        const existingStudent = await collection.findOne({ email: req.body.email });
        if (existingStudent && existingStudent.verifiedItems && existingStudent.verifiedItems.includes('email')) {
            // If the student exists and email is verified, update their password
            await collection.updateOne({ email: req.body.email }, { $set: { password: hashedPassword } });
            res.status(200).send('Signed Up successfully, please Sign in to continue.');
        } else {
            // If the student does not exist or email is not verified, return an error
            res.status(400).send('Please complete the OTP verification process before signing up.');
        }
    } catch (err) {
        console.error(err);
        req.flash('error', 'An error occurred, please try again.');
    }
});

router.post('/signin', (req, res, next) => {
    passport.authenticate('local', async function (err, user, info) {
        if (err) {
            console.error("Signin error:", err);
            return next(err);
        }
        if (!user) {
            res.status(401).send('User not found');
            return;
        }
        req.logIn(user, function (err) {
            if (err) {
                console.error("Login error:", err);
                res.status(500).send('Sign in failed');
                next(err);
            }
            res.status(200).send('Sign in successful');
            return;
        });
    })(req, res, next);
});

router.delete('/signout', (req, res) => {
    if (req.isAuthenticated()) {
        req.logout();
        res.redirect('/signup&in');
    }
    else {
        res.status(403).send('User is not authenticated');
    }
})

router.post('/generate-signup-otp', checkNotAuthenticated, async (req, res) => {
    const { email } = req.body; // Assuming the client sends the email in the request body
    let conn;
    try {
        conn = await db.connect();
        const collection = conn.collection('students');
        // Check for duplicate email
        const existingUser = await collection.findOne({ email: email });
        if (existingUser) {
            if (existingUser.verifiedItems && existingUser.verifiedItems.includes('email') && existingUser.password) {
                return res.status(400).send('Signup failed: Another account has already verified with this email.');
            }
            else 
            {
                // Delete the existing user
                await collection.deleteOne({ email: email })
            }

        }
        // Generate OTP
        const otp = generateOTP();
        // Store OTP
        await storeOTP(email, otp);
        // Send OTP through Email
        await sendOTPthroughEmail(email, otp);
        res.send('OTP has been sent to your email.');
    } catch (err) {
        console.error(err);
        res.status(500).send(`An error occurred while generating OTP.\n${err.message}`);
    }
});

router.post('/verify-signup-otp', checkNotAuthenticated, async (req, res) => {
    const { email, otp } = req.body; // Assuming the client sends the email and OTP in the request body
    try {
        // Verify OTP
        await verifyOTP(email, otp);
        res.status(200).send('OTP has been verified successfully.');
    } catch (err) {
        console.error(err);
        res.status(400).send(err.message);
    }
});

module.exports = {
    router: router,
    checkAuthenticated: checkAuthenticated,
    checkNotAuthenticated: checkNotAuthenticated
};