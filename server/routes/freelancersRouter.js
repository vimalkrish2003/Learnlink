//Freelancer Routing here
var express = require('express');
var router = express.Router();
const { ensureAuthenticatedAndFreelancer } = require('./introRouter');

router.get('/', ensureAuthenticatedAndFreelancer, (req, res) => {
    res.send("Freelancer homepage goes here");
})


module.exports = router;