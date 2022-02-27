const GANACHE = "http://127.0.0.1:7545";
const { ethers, Contract , Wallet } = require('ethers');
const ORACLE = require('../../../truffle/build/contracts/Oracle.json');
const oracleAddr = ORACLE.networks[5777].address;
require('dotenv').config()
const PRIVKEY = process.env.GANACHE_KEY

exports.api = async (req, res) => {
	console.log(`Received body: ${JSON.stringify(req.body)} \n\nReceived header: ${JSON.stringify(req.headers)}\n`);
	const provider = ethers.getDefaultProvider(GANACHE);
	
	// create wallet with GANACHE private key
	const signer = new Wallet(PRIVKEY, provider);

	// ABI enconde data
	params = req.body;
	let values = [
		'0x'+Buffer.from(params.requestId).toString('hex'),
		params.payment.toString(),
		params.callbackAddress,
		'0x'+Buffer.from(params.callbackFunctionId).toString('hex'),
		params.expiration.toString(),
		'0x'+(Math.round(params.price)).toString(16).padStart(64,'0')
	]

	try {
		// get oracle contract instance
		const oracle = new Contract(oracleAddr, ORACLE.abi, signer);
		
		// send oracle tx
		// let gasPrice = await provider.getGasPrice();
		let receipt = await oracle.fulfillOracleRequest(
			...values,
			{
			// "gasPrice" : gasPrice,
			// "gasLimit" : ethers.utils.hexlify(1000000),
			}
		)
		console.log("receipt: ", receipt);
		res.status(200).send(`Receipt: ${JSON.stringify(receipt)}`)

	} catch (e) {
		console.log("error in sending TX: ", e);
		res.status(500).send(JSON.stringify(e))
	}

}