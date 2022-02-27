const express = require('express');
const router = express.Router();
var qtumDemoController = require('../controllers/qtumDemoController');
var ganacheDemoController = require('../controllers/ganacheDemoController');
var mockDemoController = require('../controllers/mockDemoController');

router.post("/", qtumDemoController.demo);
router.post("/ganache", ganacheDemoController.demo);

router.all("*", (req, res) => {
	console.log(`${req.method} not supported on /demo endpoint\n`)
	res.send(`${req.method} not supported on /demo endpoint`)
})

module.exports= router;