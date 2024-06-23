var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const initialisePassport = require('../utils/passportConfig');
const db = require('../database/connection');

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
    finally {
        if (conn)
            db.disconnect();
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
        return  res.redirect('/in');
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
        const hashedpassword = await bcrypt.hash(req.body.password, 10);
        conn = await db.connect();
        const student = { email: req.body.email, password: hashedpassword };
        const collection = conn.collection('students');
        await collection.insertOne(student);
        req.flash('success', 'Sign Up successful, please Sign in to continue.');
        res.redirect('/signup&in'); // Redirect to signin page
    }
    catch (err) {
        if (err.code === 11000) { // MongoDB duplicate key error code
            req.flash('error', 'Email already exists');
            res.redirect('/signup&in'); // Redirect to signup page
        } else {
            console.error(err);
            req.flash('error', 'Signup failed');
            res.redirect('/signup&in'); // Redirect to signup page
        }
    }
    finally {
        if (conn)
            await db.disconnect();
    }
});
router.post('/signin', async function (req, res, next) {
    passport.authenticate('local', async function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.redirect('/signup&in');
        }

        // let conn;    REMOVE COMMENTS AFTER EMAIL VERIFICATION
        // try {
        //     conn=await pool.getConnection();
        //     const result=await conn.query("SELECT email_verified FROM USERS WHERE email=?",[req.body.email]);
        //     if(result[0].email_verified==false)
        //     {
        //         req.flash('error','Email not verified');
        //         return res.redirect('')     //EMPLOY REDIRECT TO EMAIL VERIFICATION
        //     }
        // } catch (err) {
        //     req.flash('error','Signin failed');
        //     res.redirect('/signup&in');
        // }
        // finally
        // {
        //     if(conn)
        //         conn.release();
        // }
        req.logIn(user, function (err) {
            if (err) {
                return next(err);
            }
            return res.redirect('/in');
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


module.exports = {
    router: router,
    checkAuthenticated: checkAuthenticated,
    checkNotAuthenticated: checkNotAuthenticated
};