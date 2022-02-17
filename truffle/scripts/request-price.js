const ClientContract = artifacts.require('GanacheChainlinkClient')
const OracleContract = artifacts.require('Oracle')
const LinkContract = artifacts.require('LinkToken')
const getAddr = require('../../chainlink/get-addr');
const getJobs = require('../../chainlink/get-jobs');

module.exports = async callback => {
	const readBalances = async () => {
		console.log(`\n... reading LINK balances:`);
		console.log(`client: ${await link.balanceOf(client.address)}`);
		console.log(`node: ${await link.balanceOf(nodeAddr)}`);
		console.log(`oracle: ${await link.balanceOf(oracle.address)}`);
		console.log(`\n... reading ETH balances:`);
		console.log(`client: ${await web3.eth.getBalance(client.address)}`);
		console.log(`node: ${await web3.eth.getBalance(nodeAddr)}`);
		console.log(`oracle: ${await web3.eth.getBalance(oracle.address)}`);
	}

	const sleep = (milliseconds) => {
		return new Promise(resolve => setTimeout(resolve, milliseconds))
	}

	const client = await ClientContract.deployed()
	const oracle = await OracleContract.deployed()
	const link = await LinkContract.deployed()
	// const nodeAddr = "0x0000000000000000000000000000000000000000"
	const nodeAddr = await getAddr()
	await readBalances()

	let jobs= await getJobs()
	jobs = jobs.sort((a,b) => a.id > b.id ? 1 : ( a.id < b.id ? -1 : 0))
	let jobID = jobs[4].attributes.externalJobID
	jobID = jobID.replace(/-/g,'')
	// let jobID = "b7365ef3db254e5995174cd18e471c11"	
	console.log(`\n...calling first chainlink job found -> job ID: ${jobID}`);

	console.log(`\n...sending request to Client contract`);

	try {
		let receipt = await client.requestEthereumPrice(
			oracle.address,
			jobID
		)
		console.log('TX receipt: ', receipt);
		console.log(`... waiting 5 seconds to allow chainlink off chain API call to return data`);
		await sleep(5000)
	
		console.log(`\n...retrieving ETH price`);
		let price = await client.currentPrice()
		console.log(`ETH price: ${price}`);
		await readBalances()
		console.log(`\n...Script finished`);

	} catch (e) {
		console.log("Failed to send Eth price request. Make sure client contract balance has enough LINK \nError:", e.name);
	}

	
	callback();
}
