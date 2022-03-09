
const { Contract } = require('ethers');
require('dotenv').config()
const CLIENT = require('../../../truffle/build/contracts/GanacheChainlinkClient');
const clientAddr = CLIENT.networks[8889].address;
//const JANUS = process.env.JANUS
//const PRIVKEY = process.env.QTUM_KEY
const QTUM_KEY="cMbgxCJrTYUqgcmiC1berh5DFrtY1KeU4PXZ6NZxgenniF1mXCRk";
const JANUS="http://127.0.0.1:23889";
const PRIVKEY = QTUM_KEY;
const {
	QtumProvider : Provider,
	QtumWallet : Wallet,
	QtumContractFactory : ContractFactory,
	QTUM_BIP44_PATH, // Compatible with Qtum core wallet and electrum
	SLIP_BIP44_PATH  // Compatible with 3rd party wallets
    } = require("qtum-ethers-wrapper");

exports.demo = async (req, res) => {
	console.log(`Received body: ${JSON.stringify(req.body)} \n\nReceived header: ${JSON.stringify(req.headers)}\n`);
	const provider = new Provider(JANUS);
	
	// create wallet with QTUM private key
	const signer = new Wallet(PRIVKEY, provider);

	let jobId = "ebbac65622f54a8dbee2bcb8328837ca"
	let oracle = "0x7fd9a5e7a38cc396609cf389364e9504f14a5ee6"
	let values = [oracle, jobId]

	try {
		const client = new Contract(clientAddr, CLIENT.abi, signer);
		//console.log("demoController: client :", client);

		console.log("sending TX to:", clientAddr);
		let receipt = await client.requestEthereumPrice(
			...values,
			{
			gasLimit: "0x100000",
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
