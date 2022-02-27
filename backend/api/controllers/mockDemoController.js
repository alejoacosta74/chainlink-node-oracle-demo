
const { Contract } = require('ethers');
require('dotenv').config()
const CLIENT = require('../../../truffle/build/contracts/GanacheChainlinkClient');
const clientAddr = CLIENT.networks[8889].address;
const JANUS = process.env.JANUS
const PRIVKEY = process.env.QTUM_KEY
const {
	QtumProvider : Provider,
	QtumWallet : Wallet,
	QtumContractFactory : ContractFactory,
	QTUM_BIP44_PATH, // Compatible with Qtum core wallet and electrum
	SLIP_BIP44_PATH  // Compatible with 3rd party wallets
    } = require("qtum-ethers-wrapper");

exports.demo = async (req, res) => {
	console.log(`Received from ip ${req.ip} body: ${JSON.stringify(req.body)} \n\nReceived header: ${JSON.stringify(req.headers)}\n`);
	const provider = new Provider(JANUS);
	
	// create wallet with QTUM private key
	const signer = new Wallet(PRIVKEY, provider);

	let jobId = "ebbac65622f54a8dbee2bcb8328837ca"
	let oracle = "0x7fd9a5e7a38cc396609cf389364e9504f14a5ee6"
	let values = [oracle, jobId]

	try {
		const client = new Contract(clientAddr, CLIENT.abi, signer);
		let receipt = JSON.parse(`{
		"hash": "0xdebc4f6e4632c1890f14af5ff0aaca4bc68c680ead2855096c79d6ffaeb8d823",
		"to": "0x80d2f667e6bbf6ab2937d1f6697903f858dd9090",
		"from": "0x7926223070547d2d15b2ef5e7383e541c338ffe9"
		}`)
		res.status(200).send(`Receipt: ${JSON.stringify(receipt)}`)

	} catch (e) {
		console.log("error in sending TX: ", e);
		res.status(500).send(JSON.stringify(e))
	}

}