const Web3 = require('web3');
const GANACHE = "http://127.0.0.1:7545";
require('dotenv').config()
const ORACLE = require('../../../truffle/build/contracts/Oracle.json');
const oracleAddr = ORACLE.networks[5777].address;
// const oracleAbi = ORACLE.abi;
const fulfillOracleRequestAbi = ORACLE.abi.filter((x) => {
	return x.name == "fulfillOracleRequest";
})

exports.api_post = async (req, res) => {
	console.log(`Received body: ${JSON.stringify(req.body)} \n\nReceived header: ${JSON.stringify(req.headers)}\n`);

	// create wallet with Ganache private key
	let web3 = new Web3(GANACHE);
	let account = web3.eth.accounts.privateKeyToAccount(process.env.GANACHE_KEY);

	// ABI enconde data
	params = req.body;
	/*
	abi="fulfillOracleRequest(bytes32 requestId, uint256 payment, address callbackAddress, bytes4 callbackFunctionId, uint256 expiration, bytes32 data)"
	data="{\\"requestId\\": $(decode_log.requestId), \\"payment\\": $(decode_log.payment), \\"callbackAddress\\": $(decode_log.callbackAddr), \\"callbackFunctionId\\": $(decode_log.callbackFunctionId), \\"expiration\\": $(decode_log.cancelExpiration), \\"data\\": $(encode_data)}"
	*/

	let values = [
		'0x'+Buffer.from(params.requestId).toString('hex'),
		params.payment.toString(),
		params.callbackAddress,
		'0x'+Buffer.from(params.callbackFunctionId).toString('hex'),
		params.expiration.toString(),
		'0x'+(params.price*100000).toString('16').padStart(64,'0')
	]

	let data = web3.eth.abi.encodeFunctionCall(fulfillOracleRequestAbi[0], values);
	console.log("encoded data: ", data)

	// create TX
	let nonce = await web3.eth.getTransactionCount(account.address, 'latest')
	let tx = {
		"nonce" : nonce,
		"to" : oracleAddr,
		"data" : data,
		"gasPrice" : await web3.eth.getGasPrice(),
		"gas" : 5000000
	}
	
	try {
		// sign TX
		let signedTx = await web3.eth.accounts.signTransaction(tx, account.privateKey);
		console.log("SignedTx: ", signedTx);

		// send TX
		web3.eth.sendSignedTransaction(signedTx.rawTransaction)
		.on('transactionHash', function(hash){
			console.log("onTransactionHash: ", hash);
		})
		.on('receipt', function(receipt){
			console.log("onReceipt: ", receipt);
			res.status(200).send(`Receipt: ${JSON.stringify(receipt)}`)
			
		})
		.on('confirmation', function(confirmationNumber, receipt){
			console.log("onConfirmation -> number: ", confirmationNumber);
		})
		.on('error', (err) => {
			console.log("error: ", err);
			res.status(500).send(`Received error: ${JSON.stringify(err)}`)

		}); // If a out of gas error, the second parameter is the receipt. 0x00000000000000000000000000000000000000000000000003f7ca.ffffffffe

	} catch (e) {
		console.log("error in signint and sending TX: ", e);
		res.status(500).send(JSON.stringify(err))

	}

}