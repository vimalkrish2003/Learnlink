// Freelancer Routing here
var express = require('express');
var router = express.Router();
const { checkAuthenticated } = require('./introRouter');
const db = require('../database/connection');
const { body, validationResult } = require('express-validator');

// GET request for the home page
router.get('/',checkAuthenticated, (req, res) => {
    res.send("You are in the home page now!");
});

// POST request to add student details
router.post('/add-student',checkAuthenticated,  [
    body('fullname').not().isEmpty().trim().escape(),
    body('username').not().isEmpty().trim().escape(),
    body('phonenumber').isMobilePhone(),
    body('age').isInt({ min: 1 }),
    body('school_college').not().isEmpty().trim().escape(),
    body('grade').not().isEmpty().trim().escape(),
    body('sex').isIn(['Male', 'Female', 'Other'])
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { fullname, username, phonenumber, age, school_college, grade, sex } = req.body;
    let conn;
    try {
        conn = await db.connect();
        const student = {
            fullname,
            username,
            phonenumber,
            age,
            school_college,
            grade,
            sex
        };
        const collection = conn.collection('students');
        await collection.insertOne(student);
        res.status(201).json({ message: 'Student details added successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to add student details.' });
    } finally {
        if (conn)
            await db.disconnect();
    }
});


// router to check if username exists
router.post('/check-username', checkAuthenticated, async (req, res) => {
    const { username } = req.body;
    let conn;
    try {
        conn = await db.connect();
        const collection = conn.collection('students');
        const user = await collection.findOne({ username });
        if (user) {
            res.status(200).json({ exists: true });
        } else {
            res.status(200).json({ exists: false });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to check username.' });
    } finally {
        if (conn)
            await db.disconnect();
    }
});


module.exports = router;