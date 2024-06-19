
const LocalStrategy = require('passport-local').Strategy;
const bcrypt=require('bcrypt');
const pool = require('../database/connection');

function initialize(passport,getUserByEmail)
{
    passport.use(new LocalStrategy({usernameField:'email'},async (email,password,done)=>
    {
        const user=await getUserByEmail(email);
        if (user==null)
        { 
            return done(null,false,{message : "No user with that email"});
        }
        try
        {
            ;
            if(await bcrypt.compare(password,user.password))
            {
                return done(null,user);
            }
            else
            {
                return done(null,false,{message:"Password incorrect"});
            }
        }
        catch(err)
        {
            return done(err);
        }

    }));

    passport.serializeUser((user,done)=>
    {
       return done(null,user.id); 
    });
    passport.deserializeUser(async (id,done)=>
    {
        let conn;
        try 
        {
            conn=await pool.getConnection()
            const user= await conn.query("SELECT type FROM USERS WHERE id = ?",[id]);
            if(user[0].type=='freelancer')
            {
                const freelancer= await conn.query("SELECT * FROM USERS JOIN FREELANCERS ON USERS.id = FREELANCERS.fid WHERE USERS.id = ?",[id]);
                return done(null,freelancer[0]);
            }
            else
            {
                const client= await conn.query("SELECT * FROM USERS JOIN CLIENTS ON USERS.id = CLIENTS.cid WHERE USERS.id = ?",[id]);
                return done(null,client[0]);
            }
        } catch (err) {
            return done(err);
        }
        finally
        {
            if (conn)
                conn.release();
        }
    })
}

module.exports=initialize;