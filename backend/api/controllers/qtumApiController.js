const { Contract } = require('ethers');
require('dotenv').config()
const ORACLE = require('../../../truffle/build/contracts/Oracle.json');
const oracleAddr = ORACLE.networks[8889].address;
const JANUS = process.env.JANUS
const PRIVKEY = process.env.QTUM_KEY
const {
	QtumProvider : Provider,
	QtumWallet : Wallet,
	QtumContractFactory : ContractFactory,
	QTUM_BIP44_PATH, // Compatible with Qtum core wallet and electrum
	SLIP_BIP44_PATH  // Compatible with 3rd party wallets
    } = require("qtum-ethers-wrapper");

exports.api = async (req, res) => {
	console.log(`Received body: ${JSON.stringify(req.body)} \n\nReceived header: ${JSON.stringify(req.headers)}\n`);
	const provider = new Provider(JANUS);
	
	// create wallet with QTUM private key
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
		let receipt = await oracle.fulfillOracleRequest(
			...values,
			{
			// "gasLimit" : ethers.utils.hexlify(1000000),
			gasLimit: "0x100000", // 62521
			// gasPrice: "0x9502f9000", // in WEI, not Satoshis
			}
		)
		console.log("receipt: ", receipt);
		res.status(200).send(`Receipt: ${JSON.stringify(receipt)}`)

	} catch (e) {
		console.log("error in sending TX: ", e);
		res.status(500).send(JSON.stringify(e))
	}

}