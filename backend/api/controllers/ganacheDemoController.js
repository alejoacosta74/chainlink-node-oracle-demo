const { ethers, Contract , Wallet } = require('ethers');
require('dotenv').config()
const CLIENT = require('../../../truffle/build/contracts/GanacheChainlinkClient');
const GANACHE = "http://127.0.0.1:7545";
const clientAddr = CLIENT.networks[5777].address;
const PRIVKEY = process.env.GANACHE_KEY1

exports.demo = async (req, res) => {
	console.log(`Received body: ${JSON.stringify(req.body)} \n\nReceived header: ${JSON.stringify(req.headers)}\n`);
	const provider = ethers.getDefaultProvider(GANACHE);
	
	// create wallet with QTUM private key
	const signer = new Wallet(PRIVKEY, provider);

	let jobId = "8d0e87653b294acfa1406eb30e01ce48";
	let oracle = "0x97Af85c9Ef560874ea11FbC931D8f11dfD8b83dF";
	let values = [oracle, jobId];

	try {
		const client = new Contract(clientAddr, CLIENT.abi, signer);
		
		let receipt = await client.requestEthereumPrice(
			...values,
			{
			gasLimit: "0x7A120",
			// gasPrice: "0x9502f9000", // in WEI, not Satoshis
			}
		)
		console.log("receipt: ", receipt);
		res.status(200).send(`Receipt: ${JSON.stringify(receipt)}`)

	} catch (e) {
		console.log("error in sending TX: \n", e);
		res.status(500).send(JSON.stringify(e))
	}

}