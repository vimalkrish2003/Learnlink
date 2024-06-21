//Freelancer Routing here
var express = require('express');
var router = express.Router();
const { checkAuthenticated } = require('./introRouter');

router.get('/', checkAuthenticated, (req, res) => {
    res.send("YOu are in the home page now!");
})


module.exports = router;