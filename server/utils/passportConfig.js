const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb'); // Corrected import
const db = require('../database/connection');

function initialize(passport, getUserByEmail) {
    passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
        const user = await getUserByEmail(email);
        if (user == null) { 
            return done(null, false, { message: "No user with that email" });
        }
        try {
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user);
            } else {
                return done(null, false, { message: "Password incorrect" });
            }
        } catch (err) {
            return done(err);
        }
    }));

    passport.serializeUser((user, done) => {
       return done(null, user._id); 
    });

    passport.deserializeUser(async (id, done) => {
        let conn;
        try {
            conn = await db.connect();
            const student = await conn.collection('students').findOne({ _id: new ObjectId(id) }); // Corrected ObjectId usage
            return done(null, student);
        } catch (err) {
            return done(err);
        } finally {
            if (conn) await db.disconnect();
        }
    });
}

module.exports = initialize;
