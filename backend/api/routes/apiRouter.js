const express = require('express');
const router = express.Router();
var ganacheController = require('../controllers/ganacheApiController');
var qtumController = require('../controllers/qtumApiController');

router.post("/qtum/", qtumController.api);
router.post("/ganache/", ganacheController.api);

router.all("*", (req, res) => {
	console.log(`${req.method} not supported on /api endpoint\n`)
	res.send(`${req.method} not supported on /api endpoint`)
})

module.exports= router;