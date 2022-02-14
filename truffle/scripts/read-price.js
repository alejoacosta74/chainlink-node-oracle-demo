const ClientContract = artifacts.require('GanacheChainlinkClient')

module.exports = async callback => {

	const client = await ClientContract.deployed()

	try {
		let price = await client.currentPrice()
		console.log(`ETH price: ${price}`);

	} catch (e) {
		console.log("Failed to read price");
	}

	console.log(`\n...Script finished`);
	
	callback();
}
