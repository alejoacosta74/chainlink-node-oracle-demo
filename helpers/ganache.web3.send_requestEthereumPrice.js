const Web3 = require('web3');
const CLIENT = require('../../../truffle/build/contracts/GanacheChainlinkClient');
const GANACHE = "http://127.0.0.1:7545";
const clientAddr = CLIENT.networks[5777].address;
require('dotenv').config();
GANACHE_KEY="0xebcfa9f8615d45c4fe4ae9b8a3c5ad87cfec721eeaa1e415c1ea3e3fd3020dcd";
const PRIVKEY = GANACHE_KEY;


( async () => {

	const web3 = new Web3(GANACHE);
	let account = web3.eth.accounts.privateKeyToAccount(GANACHE_KEY);

	let jobId = "8d0e87653b294acfa1406eb30e01ce48";
	let oracle = "0x97Af85c9Ef560874ea11FbC931D8f11dfD8b83dF";

	let contract = new web3.eth.Contract(CLIENT.abi, clientAddr);

	let data = contract.methods.requestEthereumPrice(oracle,jobId).encodeABI();
	
	// create TX
	let nonce = await web3.eth.getTransactionCount(account.address, 'latest')
	let tx = {
		"nonce" : nonce,
		"to" : clientAddr,
		"data" : data,
		"gasPrice" : await web3.eth.getGasPrice(),
		"gas" : 5000000
	}
	
	try {
		let signedTx = await web3.eth.accounts.signTransaction(tx, account.privateKey);
		console.log("SignedTx: ", signedTx);

		// send TX
		web3.eth.sendSignedTransaction(signedTx.rawTransaction)
		.on('transactionHash', function(hash){
			console.log("onTransactionHash: ", hash);
		})
		.on('receipt', function(receipt){
			console.log("onReceipt: ", receipt);
			
		})
		.on('confirmation', function(confirmationNumber, receipt){
			console.log("onConfirmation -> number: ", confirmationNumber);
		})
		.on('error', (err) => {
			console.log("error: ", err);		
		}) 
	} catch (e) {
			console.log("error in sending TX: \n", e);
	}
		
})()