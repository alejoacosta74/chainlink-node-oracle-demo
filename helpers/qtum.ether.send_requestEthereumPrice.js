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

( async () => {
	
	try {
		console.log("reading provider: ", JANUS);
		const provider = new Provider(JANUS);
		console.log("creating signer with prive key: ", PRIVKEY);
	
		const signer = new Wallet(PRIVKEY, provider);
		console.log("Created signer: ", signer);


		let jobId = "ebbac65622f54a8dbee2bcb8328837ca"
		let oracle = "0x7fd9a5e7a38cc396609cf389364e9504f14a5ee6"

		console.log("clientAdd: ", clientAddr);
		
		const client = new Contract(clientAddr, CLIENT.abi, signer);
		
		let receipt = await client.requestEthereumPrice(
			oracle, jobId,
			{
				gasLimit: "0x100000",
				// gasPrice: "0x9502f9000", // in WEI, not Satoshis
			}
		)
			console.log("receipt: ", receipt);
		} catch (e) {
			console.log("error in sending TX: \n", e);
		}
		
})()