var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const initialisePassport = require('../utils/passportConfig');
const pool = require('../database/connection');

//initialising passport, 2nd param is a function to get user by email
initialisePassport(passport, async (email) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query("SELECT * FROM USERS WHERE email=?", [email]);
        return rows[0];

    }
    catch (err) {
        throw err;
    }
    finally {
        if (conn)
            conn.release();
    }
});

//Middlewares
function ensureAuthenticatedandFreelancer(req, res, next)   //Authentication check for routes that should be accessed only after login as Freelancers
{
    if (!req.isAuthenticated())
        return res.redirect('/signup&in');
    if (req.user.type !== 'freelancer')
        return res.status(403).send('Unauthorized: Only freelancers can access this route');
    next();
}
function ensureAuthenticatedAndClient(req, res, next)   //Authentication check for routes that should be accessed only after login as Clients
{
    if (!req.isAuthenticated())
        return res.redirect('/signup&in');
    if (req.user.type !== 'client')
        return res.status(403).send('Unauthorized: Only clients can access this route');
    next();
}

function checkNotAuthenticated(req, res, next)    //Authentication check for routes that should not be accessed after login
{
    if (req.isAuthenticated()) {
        req.user.type == 'freelancer' ? res.redirect('/freelancers') : res.redirect('/clients');
    }
    else {
        next();
    }
}
// GET FUNCTIONS

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
        conn = await pool.getConnection();
        const query = "INSERT INTO USERS (type,email,password) VALUES (?,?,?)";
        await conn.query(query, [req.body.type, req.body.email, hashedpassword]);
        req.flash('success', 'Sign Up successful, please Sign in to continue.');
        res.redirect('/signup&in'); // Redirect to signin page
    }
    catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
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
            conn.release()
    }
});
router.post('/signin',async function (req, res, next) {
    passport.authenticate('local',async function (err, user, info) {
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
            if (user.type === 'freelancer') {
                return res.redirect('/freelancers');
            } else {
                return res.redirect('/clients');
            }
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
    ensureAuthenticatedAndFreelancer: ensureAuthenticatedandFreelancer,
    ensureAuthenticatedAndClient: ensureAuthenticatedAndClient
};