//Client Routing here
var express = require('express');
var router = express.Router();
const { ensureAuthenticatedAndClient } = require('./introRouter');

router.get('/', ensureAuthenticatedAndClient, (req, res) => {
    res.send("Client Homepage page goes here");
})


module.exports = router;