const { ethers, Contract , Wallet } = require('ethers');
const CLIENT = require('../../../truffle/build/contracts/GanacheChainlinkClient');
const GANACHE = "http://127.0.0.1:7545";
const clientAddr = CLIENT.networks[5777].address;
require('dotenv').config();
GANACHE_KEY="0xebcfa9f8615d45c4fe4ae9b8a3c5ad87cfec721eeaa1e415c1ea3e3fd3020dcd";
const PRIVKEY = GANACHE_KEY;


( async () => {
	
	try {
		const provider = ethers.getDefaultProvider(GANACHE);

		// create wallet with QTUM private key
		const signer = new Wallet(PRIVKEY, provider);

		let jobId = "8d0e87653b294acfa1406eb30e01ce48";
		let oracle = "0x97Af85c9Ef560874ea11FbC931D8f11dfD8b83dF";
		
		const client = new Contract(clientAddr, CLIENT.abi, signer);
		
		let receipt = await client.requestEthereumPrice(
			oracle, jobId,
			{
				gasLimit: "0x7A120",
				// gasPrice: "0x9502f9000", // in WEI, not Satoshis
			}
		)
			console.log("receipt: ", receipt);
		} catch (e) {
			console.log("error in sending TX: \n", e);
		}
		
})()